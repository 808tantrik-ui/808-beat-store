import React, { useEffect, useRef, useState } from 'react';
import { Eye, RotateCw, Maximize2, Minimize2, Sparkles, Compass } from 'lucide-react';

declare global {
  interface Window {
    pannellum: {
      viewer: (
        elementIdOrElement: string | HTMLElement,
        config: Record<string, any>
      ) => any;
    };
  }
}

interface Studio360ViewerProps {
  imageSrc?: string;
  title?: string;
  subtitle?: string;
  className?: string;
  autoRotate?: boolean;
}

export function Studio360Viewer({
  imageSrc = '/studio-front-360.jpg',
  title = 'Studio 360° Experience',
  subtitle = 'Drag & explore our flagship music production studio in full 360° interactive view',
  className = '',
  autoRotate = false,
}: Studio360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerInstanceRef = useRef<any>(null);
  const [isRotating, setIsRotating] = useState(autoRotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerId = useRef(`panorama-container-${Math.random().toString(36).substring(2, 9)}`);

  useEffect(() => {
    let viewer: any = null;
    let timer: any = null;

    const initViewer = () => {
      if (!window.pannellum || !containerRef.current) {
        // Retry if pannellum script hasn't loaded yet
        timer = setTimeout(initViewer, 100);
        return;
      }

      try {
        // Clear previous viewer if any
        if (viewerInstanceRef.current && typeof viewerInstanceRef.current.destroy === 'function') {
          viewerInstanceRef.current.destroy();
        }

        viewer = window.pannellum.viewer(containerRef.current, {
          type: 'equirectangular',
          panorama: imageSrc,
          autoLoad: true,
          autoRotate: isRotating ? -2 : 0,
          compass: false,
          mouseZoom: false,
          showZoomCtrl: true,
          showFullscreenCtrl: false, // Using our custom aesthetic button
          hfov: 100,
          minHfov: 50,
          maxHfov: 120,
          pitch: 0,
          yaw: 0,
        });

        viewer.on('load', () => {
          setIsLoaded(true);
        });

        viewerInstanceRef.current = viewer;
      } catch (err) {
        console.error('Error initializing 360 viewer:', err);
      }
    };

    initViewer();

    const handleResize = () => {
      if (viewerInstanceRef.current && typeof viewerInstanceRef.current.resize === 'function') {
        viewerInstanceRef.current.resize();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (timer) clearTimeout(timer);
      if (viewer && typeof viewer.destroy === 'function') {
        try {
          viewer.destroy();
        } catch {
          // ignore cleanup errors
        }
      }
    };
  }, [imageSrc]);

  const toggleAutoRotate = () => {
    if (viewerInstanceRef.current) {
      if (isRotating) {
        viewerInstanceRef.current.stopAutoRotate();
        setIsRotating(false);
      } else {
        viewerInstanceRef.current.startAutoRotate(-2);
        setIsRotating(true);
      }
    }
  };

  const toggleFullscreen = () => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.toggleFullscreen();
      setIsFullscreen(!isFullscreen);
    }
  };

  const resetView = () => {
    if (viewerInstanceRef.current) {
      viewerInstanceRef.current.setPitch(0);
      viewerInstanceRef.current.setYaw(0);
      viewerInstanceRef.current.setHfov(100);
    }
  };

  return (
    <div
      className={`w-full relative overflow-hidden border border-surface-border bg-surface-dark transition-all duration-300 ${className}`}
      style={{
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
      }}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 sm:p-5 flex items-center justify-between bg-gradient-to-b from-background/90 via-background/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-electric-cyan/10 border border-electric-cyan/30 text-electric-cyan backdrop-blur-md">
            <Eye className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                {title}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-electric-blue/20 text-electric-blue border border-electric-blue/40">
                360° VR
              </span>
            </div>
            {subtitle && (
              <p className="text-xs text-text-muted hidden sm:block drop-shadow">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={resetView}
            title="Reset View"
            className="p-2 rounded-xl bg-surface/80 hover:bg-surface border border-surface-border text-text-muted hover:text-white transition-all backdrop-blur-md"
          >
            <Compass className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={isRotating ? 'Pause Rotation' : 'Auto Rotate'}
            className={`p-2 rounded-xl border transition-all backdrop-blur-md flex items-center gap-1.5 text-xs font-semibold ${
              isRotating
                ? 'bg-electric-cyan/20 border-electric-cyan text-electric-cyan'
                : 'bg-surface/80 hover:bg-surface border-surface-border text-text-muted hover:text-white'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">{isRotating ? 'Rotating' : 'Auto Spin'}</span>
          </button>
          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 rounded-xl bg-surface/80 hover:bg-surface border border-surface-border text-text-muted hover:text-white transition-all backdrop-blur-md"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 360 Panorama Container: 600px on Laptop/Desktop, 300px on Mobile */}
      <div
        id={containerId.current}
        ref={containerRef}
        className="w-full h-[300px] md:h-[600px] relative z-0 touch-none cursor-grab active:cursor-grabbing"
      />

      {/* Bottom Floating Hint Overlay */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-4 py-1.5 rounded-full bg-background/80 border border-surface-border/60 text-[11px] text-text-muted backdrop-blur-md flex items-center gap-2 shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-electric-cyan" />
        <span>Drag with finger or mouse to look around</span>
      </div>
    </div>
  );
}
