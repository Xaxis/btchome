import React from 'react';
import { CaretDown } from '@phosphor-icons/react';

// Main app wrapper that provides the continuous visual spine
interface AppWithSpineProps {
  children: React.ReactNode;
}

export function AppWithSpine({ children }: AppWithSpineProps) {
  // Spine is now rendered per section beneath content; this wrapper remains for future global hooks
  return <div className="relative">{children}</div>;
}

// Step connector positioned on the left spine
interface StepConnectorProps {
  title: string;
  isActive?: boolean;
  isCompleted?: boolean;
  className?: string;
  sectionId?: string; // For scroll navigation
}

export function StepConnector({
  title,
  isActive = false,
  isCompleted = false,
  className = '',
  sectionId
}: StepConnectorProps) {
  // Determine circle and icon styling based on state
  const circleClasses = `step-circle w-10 h-10 rounded-full flex items-center justify-center ${
    isCompleted ? 'step-circle-completed' : isActive ? 'step-circle-active' : 'step-circle-default'
  }`;

  const iconClasses = `step-icon ${
    isCompleted ? 'step-icon-completed' : isActive ? 'step-icon-active' : 'step-icon-default'
  }`;

  // Handle click to scroll to section
  const handleClick = () => {
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    }
  };

  return (
    <div className={`relative h-0 pointer-events-none ${className}`} aria-hidden="true">
      {/* Spine continuation above and below the circle */}
      <div className="absolute left-1/2 -translate-x-1/2 z-[1]" style={{ top: '-50px', height: '100px' }}>
        <div className="spine-line absolute left-1/2 -translate-x-1/2 h-full"></div>
      </div>

      {/* Step icon centered on spine at this seam */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-[10]">
        <button
          className={circleClasses}
          onClick={handleClick}
          aria-label={`Navigate to ${title} section`}
          title={`Go to ${title}`}
        >
          <CaretDown size={14} weight="bold" className={iconClasses} />
        </button>
      </div>
    </div>
  );
}

// Section wrapper that maintains full width but provides connection points
interface ConnectedSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ConnectedSection({ children, className = '' }: ConnectedSectionProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
    </div>
  );
}
