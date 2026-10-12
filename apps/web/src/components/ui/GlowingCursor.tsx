import { useEffect, useRef } from 'react';

export function GlowingCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Disable on touch devices or reduced motion
    if (typeof window === 'undefined') return;

    try {
      const isTouch =
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia('(hover: none), (pointer: coarse)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (isTouch || prefersReducedMotion) {
        return;
      }
    } catch {
      return;
    }

    let mouseX = -100;
    let mouseY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let isHoveringInteractive = false;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      const target = e.target as HTMLElement | null;
      if (
        target?.tagName === 'BUTTON' ||
        target?.tagName === 'A' ||
        target?.closest('button') ||
        target?.closest('a') ||
        target?.getAttribute('role') === 'button' ||
        target?.classList.contains('cursor-pointer')
      ) {
        isHoveringInteractive = true;
      } else {
        isHoveringInteractive = false;
      }
    };

    const render = () => {
      // Smooth lerp follow
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${cursorX - 12}px, ${cursorY - 12}px, 0) scale(${
          isHoveringInteractive ? 1.7 : 1
        })`;
        cursorRef.current.style.opacity = mouseX < 0 ? '0' : '1';
        cursorRef.current.style.filter = isHoveringInteractive
          ? 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.9))'
          : 'drop-shadow(0 0 8px rgba(0, 102, 255, 0.6))';
      }

      animationFrameId = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor hidden sm:block pointer-events-none" />;
}
