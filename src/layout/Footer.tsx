import React from 'react';
import { Shield, GithubLogo, XLogo, Info } from '@phosphor-icons/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-1 border-t border-subtle shadow-sm">
      {/* Disclaimer Section */}
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 flex-shrink-0">
              <Shield size={20} weight="duotone" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 min-w-0">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 flex-shrink-0">
                Not Financial Advice
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 leading-relaxed">
                This tool is for educational purposes only. Projections are based on mathematical models and may not predict future performance.
                Always consult qualified professionals before making investment decisions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bar - Matches Header Style */}
      <div className="border-t border-subtle bg-surface-1">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Copyright & Data Source */}
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted">
                © {currentYear} All rights reserved.
              </div>
              <div className="hidden sm:block w-px h-4 bg-border-default"></div>
              <div className="hidden sm:flex items-center gap-2 text-sm text-muted">
                <Info size={14} />
                <span>Data from CoinGecko</span>
              </div>
            </div>

            {/* Right: Social Links */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted font-medium">Connect</span>
              <div className="flex items-center gap-2">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-default bg-surface-2 hover:bg-surface-3 text-secondary hover:text-primary transition-all duration-200 focus-ring"
                  aria-label="GitHub"
                >
                  <GithubLogo size={16} weight="duotone" />
                </a>

                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-default bg-surface-2 hover:bg-surface-3 text-secondary hover:text-primary transition-all duration-200 focus-ring"
                  aria-label="X (Twitter)"
                >
                  <XLogo size={16} weight="duotone" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
