import React from 'react';

// A spacer between the header and the first section with a centered source ring and a spine segment
export default function TopSpineSpacer() {
  return (
    <div className="hero-gradient relative h-28 md:h-32">
      {/* Source ring centered in the gap */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-0">
        <div className="spine-ring"></div>
      </div>
      {/* Spine from circle bottom to the bottom edge of spacer */}
      <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 z-[1]" style={{ top: 'calc(50% + 20px)', bottom: 0 }}>
        <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
      </div>
    </div>
  );
}

