import React from 'react';

/**
 * Vintage Studio Condenser Microphone Line-Art Silhouette (Desktop only, 5-8% opacity)
 */
export function StudioMicSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`hidden lg:block pointer-events-none select-none absolute z-0 ${className}`} aria-hidden="true">
      <svg
        width="180"
        height="220"
        viewBox="0 0 180 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Mic Capsule & Grille */}
        <rect x="55" y="20" width="70" height="90" rx="35" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <line x1="55" y1="50" x2="125" y2="50" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        <line x1="55" y1="65" x2="125" y2="65" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        <line x1="55" y1="80" x2="125" y2="80" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        <line x1="90" y1="20" x2="90" y2="110" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        
        {/* Shockmount Ring */}
        <circle cx="90" cy="85" r="48" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.06" strokeDasharray="3 3" />
        <circle cx="90" cy="85" r="54" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.04" />
        
        {/* Mic Body & Connector */}
        <path d="M70 110 L70 150 Q70 160 80 165 L80 185 L100 185 L100 165 Q110 160 110 150 L110 110" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        
        {/* Stand & Pivot */}
        <circle cx="90" cy="185" r="5" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.06" />
        <line x1="90" y1="190" x2="90" y2="220" stroke="#0066FF" strokeWidth="2" strokeOpacity="0.07" />
        <line x1="60" y1="220" x2="120" y2="220" stroke="#0066FF" strokeWidth="2" strokeOpacity="0.07" />
      </svg>
    </div>
  );
}

/**
 * Studio Monitor Speaker Line-Art Silhouette (Desktop only, 5-8% opacity)
 */
export function StudioSpeakerSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`hidden lg:block pointer-events-none select-none absolute z-0 ${className}`} aria-hidden="true">
      <svg
        width="190"
        height="220"
        viewBox="0 0 190 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Speaker Cabinet Outer Box */}
        <rect x="25" y="15" width="140" height="190" rx="14" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <rect x="35" y="25" width="120" height="170" rx="8" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.04" />
        
        {/* High Frequency Tweeter */}
        <circle cx="95" cy="65" r="20" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <circle cx="95" cy="65" r="9" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
        <line x1="75" y1="65" x2="115" y2="65" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.04" />
        
        {/* Bass Woofer Cone */}
        <circle cx="95" cy="140" r="42" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <circle cx="95" cy="140" r="28" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        <circle cx="95" cy="140" r="14" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.06" />
        
        {/* Bass Reflex Port */}
        <circle cx="48" cy="188" r="4" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="142" cy="188" r="4" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
      </svg>
    </div>
  );
}

/**
 * Studio Guitar Line-Art Silhouette (Desktop only, 5-8% opacity)
 */
export function StudioGuitarSilhouette({ className = '' }: { className?: string }) {
  return (
    <div className={`hidden lg:block pointer-events-none select-none absolute z-0 ${className}`} aria-hidden="true">
      <svg
        width="160"
        height="240"
        viewBox="0 0 160 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Headstock & Tuning Pegs */}
        <path d="M72 10 L88 10 L92 35 L68 35 Z" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <circle cx="62" cy="18" r="3" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="62" cy="28" r="3" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="98" cy="18" r="3" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
        <circle cx="98" cy="28" r="3" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />

        {/* Fretboard / Neck */}
        <line x1="75" y1="35" x2="73" y2="120" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <line x1="85" y1="35" x2="87" y2="120" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <line x1="74" y1="55" x2="86" y2="55" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        <line x1="74" y1="75" x2="86" y2="75" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />
        <line x1="73" y1="95" x2="87" y2="95" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.05" />

        {/* Guitar Body Curves */}
        <path
          d="M73 120 C50 120 30 135 30 155 C30 170 42 180 48 188 C38 198 25 215 25 235 C25 240 135 240 135 235 C135 215 122 198 112 188 C118 180 130 170 130 155 C130 135 110 120 87 120 Z"
          stroke="#0066FF"
          strokeWidth="1.5"
          strokeOpacity="0.07"
        />

        {/* Soundhole & Bridge */}
        <circle cx="80" cy="165" r="15" stroke="#0066FF" strokeWidth="1.5" strokeOpacity="0.07" />
        <circle cx="80" cy="165" r="18" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.04" />
        <rect x="66" y="205" width="28" height="6" rx="2" stroke="#0066FF" strokeWidth="1" strokeOpacity="0.06" />
      </svg>
    </div>
  );
}
