import React from 'react';
import { TrendUp, Shield, Info, Heart } from '@phosphor-icons/react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-2 border-t border-subtle mt-16">
      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-brand/10 text-brand">
                <TrendUp size={20} weight="duotone" />
              </div>
              <div>
                <h3 className="text-lg font-bold">
                  <span className="text-brand">BTC</span>
                  <span className="text-slate-600 dark:text-slate-300">Home</span>
                </h3>
              </div>
            </div>
            <p className="text-sm text-secondary leading-relaxed">
              Smart financial decisions through Bitcoin vs real estate analysis.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Resources</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#" className="text-secondary hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="text-secondary hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-secondary hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold text-primary mb-3">Connect</h4>
            <div className="flex items-center gap-4 text-sm">
              <a href="#" className="text-secondary hover:text-primary transition-colors">GitHub</a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">Twitter</a>
            </div>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="border-t border-subtle pt-6 mb-6">
          <div className="bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield size={20} weight="duotone" className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
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

        {/* Bottom Bar */}
        <div className="border-t border-subtle pt-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="text-muted">
              © {currentYear} BTCHome. All rights reserved.
            </div>

            <div className="flex items-center gap-2 text-muted">
              <Info size={14} />
              <span>Data from CoinGecko • DYOR</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
