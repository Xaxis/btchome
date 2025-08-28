import React from 'react';
import { Shield, GithubLogo, XLogo, Info } from '@phosphor-icons/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-1 border-t border-subtle mt-20">
      <div className="mx-auto max-w-7xl px-6 py-16">
        {/* Disclaimer Section */}
        <div className="mb-12">
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 flex-shrink-0">
                <Shield size={24} weight="duotone" />
              </div>
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 text-lg">
                  Not Financial Advice
                </h4>
                <p className="text-yellow-700 dark:text-yellow-300 leading-relaxed">
                  This tool is for educational purposes only. Projections are based on mathematical models and may not predict future performance.
                  Always consult qualified professionals before making investment decisions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Left: Copyright & Data Source */}
          <div className="flex flex-col md:flex-row items-center gap-6 text-sm">
            <div className="text-muted">
              © {currentYear} All rights reserved.
            </div>

            <div className="flex items-center gap-2 text-muted">
              <Info size={16} />
              <span>Data from CoinGecko</span>
            </div>
          </div>

          {/* Right: Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-secondary hover:text-primary transition-all duration-200 focus-ring"
              aria-label="GitHub"
            >
              <GithubLogo size={20} weight="duotone" />
            </a>

            <a
              href="https://x.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-secondary hover:text-primary transition-all duration-200 focus-ring"
              aria-label="X (Twitter)"
            >
              <XLogo size={20} weight="duotone" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
