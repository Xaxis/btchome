// Test setup file for Vitest
import { vi } from 'vitest';

// Mock global fetch for API testing
global.fetch = vi.fn();

// Mock Chart.js for component testing
vi.mock('chart.js', () => ({
  Chart: vi.fn(),
  registerables: [],
}));

// Setup DOM testing utilities
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
