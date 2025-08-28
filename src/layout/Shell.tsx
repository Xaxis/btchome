import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import { Sun, Moon } from '@phosphor-icons/react';
import InfoModal from '../features/modals/InfoModal';
import { formatCurrencyFull } from '../utils/format';

export default function Shell({ children }: { children: React.ReactNode }) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const btcPrice = useStore((s) => s.btcPrice);
  const loading = useStore((s) => s.loading);
  const refreshPrice = useStore((s) => s.refreshPrice);

  useEffect(() => {
    // initialize from localStorage
    try {
      const saved = localStorage.getItem('btchome-theme') as 'dark' | 'light' | null;
      if (saved) setTheme(saved);
      else document.documentElement.setAttribute('data-theme', theme);
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-surface text-primary">
      <header className="px-6 py-4 border-b border-subtle bg-surface-1 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-0">
            <span className="text-xl font-bold text-orange-600">BTC</span>
            <span className="text-xl font-semibold text-slate-600 dark:text-slate-300">Home</span>
          </div>
          <div className="flex items-center gap-3">
            {/* Live BTC Widget */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-default bg-surface-2 hover:bg-surface-3 transition-all duration-200 text-sm font-medium">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-mono text-secondary">{formatCurrencyFull(btcPrice)}</span>
              <button
                onClick={refreshPrice}
                disabled={loading}
                className="text-muted hover:text-secondary transition-colors disabled:opacity-50"
                title="Refresh Bitcoin price"
              >
                {loading ? '⟳' : '↻'}
              </button>
            </div>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-default bg-surface-2 hover:bg-surface-3 focus-ring transition-all duration-200 text-sm font-medium group"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
              >
                <div className="relative w-4 h-4">
                  <Sun
                    size={16}
                    weight="duotone"
                    className={`absolute inset-0 transition-all duration-300 ${
                      theme === 'light'
                        ? 'opacity-100 rotate-0 text-yellow-500'
                        : 'opacity-0 rotate-90 text-muted'
                    }`}
                  />
                  <Moon
                    size={16}
                    weight="duotone"
                    className={`absolute inset-0 transition-all duration-300 ${
                      theme === 'dark'
                        ? 'opacity-100 rotate-0 text-blue-400'
                        : 'opacity-0 -rotate-90 text-muted'
                    }`}
                  />
                </div>
                <span className="capitalize">{theme}</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="bg-surface">
        {children}
      </main>

      {/* Modal Portal */}
      <div id="modal-root">
        <InfoModal />
      </div>
    </div>
  );
}

