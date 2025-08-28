import React from 'react';

// A spacer between the header and the first section with a centered source ring and a spine segment
export default function TopSpineSpacer() {
  return (
    <div className="hero-gradient relative h-40 md:h-48">
      {/* Source ring positioned lower in the spacer */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-0" style={{ top: '75%' }}>
        <div className="spine-ring"></div>
      </div>
      {/* Spine from circle bottom to the bottom edge of spacer */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-[1]" style={{ top: 'calc(75% + 36px)', bottom: 0 }}>
        <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
      </div>
    </div>
  );
}

