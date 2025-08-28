import React, { useEffect, useRef } from 'react';
import { useStore } from '../../state/store';
import { modalContent } from './content';

export default function InfoModal() {
  const modals = useStore((s) => s.modals);
  const setState = (partial: Partial<any>) => (useStore as any).setState(partial);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setState({ modals: { active: null, infoContent: undefined } });
    }
    if (modals.active) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [modals.active]);

  if (!modals.active) return null;

  // Use dynamic content if available, otherwise fall back to static content
  const content = modals.infoContent || modalContent[modals.active];
  if (!content) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setState({ modals: { active: null, infoContent: undefined } })} />
      <div
        ref={ref}
        className="relative w-full max-w-md rounded-2xl border border-default bg-surface-1 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-primary mb-3">{content.title}</h3>
            <p className="text-secondary leading-relaxed">
              {'content' in content ? content.content : content.body}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 rounded-lg border border-default bg-surface-2 hover:bg-surface-3 focus-ring transition-all duration-200 text-sm font-medium text-primary"
            onClick={() => setState({ modals: { active: null, infoContent: undefined } })}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

