import React, { useRef, useState, useMemo } from 'react';

interface AudioWaveformProps {
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  barCount?: number;
  height?: number;
  interactive?: boolean;
}

export function AudioWaveform({
  currentTime,
  duration,
  onSeek,
  barCount = 70,
  height = 36,
  interactive = true,
}: AudioWaveformProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Deterministic aesthetic waveform pattern
  const bars = useMemo(() => {
    const list: number[] = [];
    for (let i = 0; i < barCount; i++) {
      // Natural music envelope: intro builds up, drops down, verse, hook peak, outro
      const progress = i / barCount;
      const base = Math.sin(progress * Math.PI) * 0.4 + 0.3;
      const variation = Math.sin(i * 0.45) * 0.2 + Math.cos(i * 0.9) * 0.15;
      const heightPercent = Math.max(0.18, Math.min(0.95, base + variation));
      list.push(heightPercent);
    }
    return list;
  }, [barCount]);

  const progressRatio = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;
  const activeBarIndex = Math.floor(progressRatio * barCount);

  const calculateTimeFromEvent = (e: React.MouseEvent | MouseEvent) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const ratio = x / rect.width;
    return ratio * duration;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    const newTime = calculateTimeFromEvent(e);
    onSeek(newTime);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const draggedTime = calculateTimeFromEvent(moveEvent);
      onSeek(draggedTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setHoverX(e.clientX - rect.left);
  };

  const handleMouseLeave = () => {
    setHoverX(null);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const hoverTime =
    hoverX !== null && containerRef.current
      ? (hoverX / containerRef.current.getBoundingClientRect().width) * duration
      : null;

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full flex items-center gap-[2px] py-1 select-none ${
        interactive ? 'cursor-pointer group' : ''
      }`}
      style={{ height: `${height}px` }}
    >
      {bars.map((barHeight, idx) => {
        const isPlayed = idx <= activeBarIndex;
        const isHovered = hoverX !== null && containerRef.current && idx <= (hoverX / containerRef.current.getBoundingClientRect().width) * barCount;

        return (
          <div
            key={idx}
            className="flex-1 rounded-full transition-all duration-75"
            style={{
              height: `${Math.round(barHeight * height)}px`,
              background: isPlayed
                ? 'linear-gradient(to top, #0066FF, #00F0FF)'
                : isHovered
                ? 'rgba(0, 102, 255, 0.45)'
                : 'rgba(255, 255, 255, 0.15)',
              boxShadow: isPlayed && idx === activeBarIndex ? '0 0 8px rgba(0, 240, 255, 0.8)' : 'none',
            }}
          />
        );
      })}

      {/* Hover Time Tooltip */}
      {hoverTime !== null && hoverX !== null && (
        <div
          className="absolute -top-7 px-2 py-0.5 rounded bg-surface border border-surface-border text-[10px] font-mono text-white pointer-events-none transform -translate-x-1/2 shadow-lg"
          style={{ left: `${hoverX}px` }}
        >
          {formatSeconds(hoverTime)}
        </div>
      )}
    </div>
  );
}
