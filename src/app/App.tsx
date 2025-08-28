import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import Shell from '../layout/Shell';
import HeroSection from '../layout/HeroSection';
import PurchasePlanningSection from '../layout/PurchasePlanningSection';
import BottomPane from '../layout/BottomPane';
import Footer from '../layout/Footer';
import { StepSeparator, ConnectedSection } from '../components/VerticalStepper';

export default function App() {
  const initialize = useStore((s) => s.initialize);

  useEffect(() => {
    // Initialize the app with fresh Bitcoin price data
    initialize();
  }, [initialize]);

  return (
    <Shell>
      {/* Step 1: Initial Configuration */}
      <ConnectedSection isActive={true}>
        <HeroSection />
      </ConnectedSection>

      <StepSeparator
        title="Purchase Planning"
        isActive={true}
      />

      {/* Step 2: Purchase Planning */}
      <ConnectedSection isActive={true}>
        <PurchasePlanningSection />
      </ConnectedSection>

      <StepSeparator
        title="Strategy Analysis"
        isActive={false}
      />

      {/* Step 3 & 4: Strategy Projection and Configuration */}
      <ConnectedSection isActive={false}>
        <BottomPane />
      </ConnectedSection>

      <Footer />
    </Shell>
  );
}

