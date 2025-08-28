import React from 'react';
import { ArrowDown, CheckCircle, Circle } from '@phosphor-icons/react';

interface FlowStep {
  id: string;
  title: string;
  description: string;
  completed?: boolean;
  active?: boolean;
}

interface FlowConnectorProps {
  steps: FlowStep[];
  className?: string;
}

export function FlowConnector({ steps, className = '' }: FlowConnectorProps) {
  return (
    <div className={`flex flex-col items-center py-8 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-col items-center">
          {/* Step Indicator */}
          <div className="flex items-center gap-4 mb-4">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              step.completed 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : step.active
                ? 'bg-brand border-brand text-white'
                : 'bg-surface-2 border-border-default text-muted'
            }`}>
              {step.completed ? (
                <CheckCircle size={20} weight="fill" />
              ) : (
                <span className="text-sm font-bold">{index + 1}</span>
              )}
            </div>
            
            <div className="text-left">
              <div className={`text-sm font-semibold ${
                step.active ? 'text-primary' : step.completed ? 'text-emerald-600' : 'text-muted'
              }`}>
                {step.title}
              </div>
              <div className="text-xs text-muted max-w-xs">
                {step.description}
              </div>
            </div>
          </div>
          
          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div className="flex flex-col items-center mb-4">
              <div className={`w-px h-8 transition-all duration-300 ${
                step.completed ? 'bg-emerald-300' : 'bg-border-subtle'
              }`} />
              <ArrowDown 
                size={16} 
                className={`transition-all duration-300 ${
                  step.completed ? 'text-emerald-500' : 'text-muted'
                }`}
              />
              <div className={`w-px h-8 transition-all duration-300 ${
                step.completed ? 'bg-emerald-300' : 'bg-border-subtle'
              }`} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Simplified version for section transitions
interface SectionTransitionProps {
  fromSection: string;
  toSection: string;
  className?: string;
}

export function SectionTransition({ fromSection, toSection, className = '' }: SectionTransitionProps) {
  return (
    <div className={`flex flex-col items-center py-6 ${className}`}>
      <div className="flex flex-col items-center gap-2">
        <div className="w-px h-6 bg-gradient-to-b from-brand/50 to-transparent" />
        <div className="p-2 rounded-full bg-surface-1 border border-brand/20 shadow-sm">
          <ArrowDown size={16} className="text-brand" weight="duotone" />
        </div>
        <div className="w-px h-6 bg-gradient-to-b from-transparent to-brand/50" />
      </div>
      
      <div className="text-center mt-2">
        <div className="text-xs text-muted">
          {fromSection} → {toSection}
        </div>
      </div>
    </div>
  );
}

// Progress indicator for the entire app flow
interface AppFlowProgressProps {
  currentStep: 'input' | 'projection' | 'results' | 'configuration';
  className?: string;
}

export function AppFlowProgress({ currentStep, className = '' }: AppFlowProgressProps) {
  const steps = [
    { id: 'input', label: 'Input', description: 'Set your parameters' },
    { id: 'projection', label: 'Projection', description: 'View the analysis' },
    { id: 'results', label: 'Results', description: 'Compare strategies' },
    { id: 'configuration', label: 'Configure', description: 'Fine-tune settings' },
  ];

  const currentIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index <= currentIndex 
                ? 'bg-brand shadow-brand' 
                : 'bg-surface-3 border border-border-subtle'
            }`} />
            <span className={`text-xs font-medium transition-all duration-300 ${
              index === currentIndex ? 'text-primary' : 'text-muted'
            }`}>
              {step.label}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`w-8 h-px transition-all duration-300 ${
              index < currentIndex ? 'bg-brand' : 'bg-border-subtle'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
