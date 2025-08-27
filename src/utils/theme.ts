export type Theme = 'light' | 'dark' | 'system';

export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: Theme = 'system';
  private listeners: Set<(theme: Theme) => void> = new Set();

  private constructor() {
    this.init();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private init() {
    // Check for saved theme preference or default to 'system'
    const savedTheme = this.getSavedTheme();
    this.setTheme(savedTheme);

    // Listen for system theme changes
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.currentTheme === 'system') {
          this.applyTheme();
        }
      });
    }
  }

  private getSavedTheme(): Theme {
    if (typeof window === 'undefined') return 'system';
    
    const saved = localStorage.getItem('btchome-theme') as Theme;
    return saved && ['light', 'dark', 'system'].includes(saved) ? saved : 'system';
  }

  private saveTheme(theme: Theme) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('btchome-theme', theme);
    }
  }

  private getSystemTheme(): 'light' | 'dark' {
    if (typeof window === 'undefined') return 'light';
    
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private getEffectiveTheme(): 'light' | 'dark' {
    return this.currentTheme === 'system' ? this.getSystemTheme() : this.currentTheme;
  }

  private applyTheme() {
    if (typeof document === 'undefined') return;

    const effectiveTheme = this.getEffectiveTheme();
    const html = document.documentElement;

    // Remove existing theme classes
    html.classList.remove('light', 'dark');
    
    // Add current theme class
    html.classList.add(effectiveTheme);

    // Update meta theme-color for mobile browsers
    this.updateMetaThemeColor(effectiveTheme);
  }

  private updateMetaThemeColor(theme: 'light' | 'dark') {
    if (typeof document === 'undefined') return;

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    const color = theme === 'dark' ? '#0f172a' : '#ffffff';
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', color);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = color;
      document.head.appendChild(meta);
    }
  }

  setTheme(theme: Theme) {
    this.currentTheme = theme;
    this.saveTheme(theme);
    this.applyTheme();
    this.notifyListeners();
  }

  getTheme(): Theme {
    return this.currentTheme;
  }

  getEffectiveThemeValue(): 'light' | 'dark' {
    return this.getEffectiveTheme();
  }

  toggleTheme() {
    const effectiveTheme = this.getEffectiveTheme();
    this.setTheme(effectiveTheme === 'light' ? 'dark' : 'light');
  }

  subscribe(listener: (theme: Theme) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentTheme));
  }

  // Utility methods for components
  isDark(): boolean {
    return this.getEffectiveTheme() === 'dark';
  }

  isLight(): boolean {
    return this.getEffectiveTheme() === 'light';
  }

  // CSS custom property helpers
  getCSSVariable(property: string): string {
    if (typeof window === 'undefined') return '';
    
    return getComputedStyle(document.documentElement)
      .getPropertyValue(property)
      .trim();
  }

  setCSSVariable(property: string, value: string) {
    if (typeof document === 'undefined') return;
    
    document.documentElement.style.setProperty(property, value);
  }
}

// Export singleton instance
export const themeManager = ThemeManager.getInstance();

// Utility functions for easier usage
export const setTheme = (theme: Theme) => themeManager.setTheme(theme);
export const getTheme = () => themeManager.getTheme();
export const toggleTheme = () => themeManager.toggleTheme();
export const isDarkMode = () => themeManager.isDark();
export const isLightMode = () => themeManager.isLight();
export const subscribeToTheme = (listener: (theme: Theme) => void) => 
  themeManager.subscribe(listener);
