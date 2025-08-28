import { useState, useEffect } from 'react';

export type ScreenSize = 'sm' | 'md' | 'lg';

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('lg');

  useEffect(() => {
    function updateScreenSize() {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize('sm');
      } else if (width < 1024) {
        setScreenSize('md');
      } else {
        setScreenSize('lg');
      }
    }

    // Set initial size
    updateScreenSize();

    // Listen for resize events
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}
