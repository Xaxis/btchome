# BTCHome - Bitcoin vs Real Estate Investment Comparison

A modern, minimalistic Bitcoin-themed SPA that helps users compare Bitcoin investments against real estate purchases. Built with Astro, TypeScript, and Tailwind CSS.

## Features

- **Bitcoin Investment Calculator**: DCA vs lump sum strategies with historical performance
- **Real Estate Calculator**: Comprehensive mortgage calculations with taxes, insurance, and PMI
- **Investment Comparison**: Side-by-side analysis of Bitcoin vs real estate returns
- **Affordability Analysis**: See how much house your Bitcoin stack can afford
- **Tax Considerations**: Include mortgage interest deductions and capital gains
- **Interactive Charts**: Modern visualizations of investment performance over time
- **Dark/Light Theme**: Bitcoin-themed design with full theme support

## Tech Stack

- **Framework**: Astro 5 with TypeScript
- **Styling**: Tailwind CSS with custom Bitcoin theme
- **State Management**: Zustand
- **Charts**: Chart.js with date-fns adapter
- **Testing**: Vitest with jsdom
- **Deployment**: GitHub Pages

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts
├── pages/          # Astro pages (SPA routes)
├── services/       # API services and data fetching
├── stores/         # Zustand state management
├── styles/         # Global styles and themes
├── types/          # TypeScript type definitions
├── utils/          # Utility functions and calculations
└── test/           # Test setup and utilities
```

## Disclaimer

This tool is for educational and informational purposes only. It does not constitute financial advice. Always consult with qualified financial professionals before making investment decisions.
