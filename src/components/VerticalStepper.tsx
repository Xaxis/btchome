import React from 'react';
import { CheckCircle, Circle, ArrowDown, CaretDown } from '@phosphor-icons/react';

export interface Step {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'active' | 'upcoming';
  optional?: boolean;
}

interface VerticalStepperProps {
  steps: Step[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export function VerticalStepper({ steps, currentStepId, onStepClick, className = '' }: VerticalStepperProps) {
  const currentIndex = steps.findIndex(step => step.id === currentStepId);

  return (
    <div className={`relative ${className}`}>
      {/* Background Timeline */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-brand/20 via-brand/40 to-brand/20 transform -translate-x-1/2" />
      
      {/* Steps */}
      <div className="relative space-y-16">
        {steps.map((step, index) => {
          const isActive = step.id === currentStepId;
          const isCompleted = step.status === 'completed';
          const isUpcoming = step.status === 'upcoming';
          const isClickable = onStepClick && (isCompleted || isActive);

          return (
            <div key={step.id} className="relative flex items-center justify-center">
              {/* Step Indicator */}
              <div className="relative z-10 flex items-center justify-center">
                <button
                  onClick={() => isClickable && onStepClick(step.id)}
                  disabled={!isClickable}
                  className={`
                    relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 group
                    ${isCompleted 
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25' 
                      : isActive
                      ? 'bg-brand border-brand text-white shadow-lg shadow-brand/25'
                      : 'bg-surface-1 border-border-default text-muted hover:border-brand/50'
                    }
                    ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle size={24} weight="fill" />
                  ) : (
                    <span className="text-lg font-bold">{index + 1}</span>
                  )}
                  
                  {/* Pulse animation for active step */}
                  {isActive && (
                    <div className="absolute inset-0 rounded-full bg-brand animate-ping opacity-20" />
                  )}
                </button>
              </div>

              {/* Step Content */}
              <div className={`
                absolute left-1/2 transform translate-x-16 -translate-y-1/2 max-w-xs
                ${isActive ? 'opacity-100' : 'opacity-70'}
              `}>
                <div className={`
                  p-4 rounded-xl border transition-all duration-300
                  ${isActive 
                    ? 'bg-surface-1 border-brand/20 shadow-lg' 
                    : 'bg-surface-2 border-border-subtle'
                  }
                `}>
                  <h3 className={`
                    font-semibold mb-1 transition-colors duration-300
                    ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-muted'}
                  `}>
                    {step.title}
                    {step.optional && (
                      <span className="text-xs text-muted ml-2">(Optional)</span>
                    )}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Mirror content for left side on larger screens */}
              <div className={`
                hidden lg:block absolute right-1/2 transform -translate-x-16 -translate-y-1/2 max-w-xs
                ${isActive ? 'opacity-100' : 'opacity-70'}
              `}>
                <div className={`
                  p-4 rounded-xl border transition-all duration-300 text-right
                  ${isActive 
                    ? 'bg-surface-1 border-brand/20 shadow-lg' 
                    : 'bg-surface-2 border-border-subtle'
                  }
                `}>
                  <h3 className={`
                    font-semibold mb-1 transition-colors duration-300
                    ${isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-muted'}
                  `}>
                    Step {index + 1}
                  </h3>
                  <p className="text-sm text-secondary leading-relaxed">
                    {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Upcoming'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Enhanced section separator with extended connecting lines
interface StepSeparatorProps {
  title: string;
  isActive?: boolean;
  isCompleted?: boolean;
  extendAbove?: boolean;
  extendBelow?: boolean;
  className?: string;
}

export function StepSeparator({
  title,
  isActive = false,
  isCompleted = false,
  extendAbove = true,
  extendBelow = true,
  className = ''
}: StepSeparatorProps) {
  const lineColor = isCompleted ? 'bg-emerald-400' : isActive ? 'bg-brand/60' : 'bg-border-default';

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Extended connecting line from above */}
      {extendAbove && (
        <div className={`w-px h-16 transition-all duration-500 ${lineColor}`} />
      )}

      {/* Main separator container */}
      <div className="flex flex-col items-center py-8">
        {/* Flow indicator with arrow */}
        <div className={`
          relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 group hover:scale-105 z-10
          ${isCompleted
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/25'
            : isActive
            ? 'bg-brand border-brand text-white shadow-lg shadow-brand/25'
            : 'bg-surface-1 border-border-default text-muted hover:border-brand/40'
          }
        `}>
          <CaretDown
            size={20}
            weight="bold"
            className={`transition-all duration-300 ${
              isActive ? 'animate-bounce' : 'group-hover:translate-y-0.5'
            }`}
          />

          {/* Pulse animation for active step */}
          {isActive && (
            <div className="absolute inset-0 rounded-full bg-brand animate-ping opacity-20" />
          )}

          {/* Connecting dots for visual enhancement */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
            <div className={`w-1 h-1 rounded-full transition-all duration-500 ${lineColor}`} />
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className={`w-1 h-1 rounded-full transition-all duration-500 ${lineColor}`} />
          </div>
        </div>

        {/* Step title */}
        <div className="mt-4 text-center">
          <div className={`text-sm font-medium transition-colors duration-300 ${
            isActive ? 'text-primary' : isCompleted ? 'text-emerald-600' : 'text-muted'
          }`}>
            {title}
          </div>
        </div>
      </div>

      {/* Extended connecting line to below */}
      {extendBelow && (
        <div className={`w-px h-16 transition-all duration-500 ${lineColor}`} />
      )}
    </div>
  );
}

// Section wrapper that includes connecting lines
interface ConnectedSectionProps {
  children: React.ReactNode;
  isActive?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export function ConnectedSection({ children, isActive = false, isCompleted = false, className = '' }: ConnectedSectionProps) {
  const lineColor = isCompleted ? 'bg-emerald-400' : isActive ? 'bg-brand/60' : 'bg-border-default';

  return (
    <div className={`relative ${className}`}>
      {/* Vertical connecting line running through the section */}
      <div className={`absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2 transition-all duration-500 ${lineColor} opacity-30`} />

      {/* Section content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
