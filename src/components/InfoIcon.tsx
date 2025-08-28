import React from 'react';
import { Info } from '@phosphor-icons/react';
import { useStore } from '../state/store';

interface InfoIconProps {
  title: string;
  content: string;
  className?: string;
}

export default function InfoIcon({ title, content, className = '' }: InfoIconProps) {
  const setState = (useStore as any).setState;

  const handleClick = () => {
    setState({ 
      modals: { 
        active: 'info-modal',
        infoContent: { title, content }
      } 
    });
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center justify-center w-4 h-4 rounded-full bg-surface-3 hover:bg-surface-4 border border-subtle hover:border-default transition-all duration-200 focus-ring ${className}`}
      aria-label={`Information about ${title}`}
      title={`Click for more information about ${title}`}
    >
      <Info size={12} weight="bold" className="text-muted hover:text-secondary" />
    </button>
  );
}

// Enhanced label component with info icon
interface LabelWithInfoProps {
  label: string;
  infoTitle: string;
  infoContent: string;
  required?: boolean;
  className?: string;
}

export function LabelWithInfo({ label, infoTitle, infoContent, required = false, className = '' }: LabelWithInfoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <label className="text-sm font-medium text-secondary">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <InfoIcon title={infoTitle} content={infoContent} />
    </div>
  );
}
