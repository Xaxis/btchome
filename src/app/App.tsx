import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import Shell from '../layout/Shell';
import HeroSection from '../layout/HeroSection';
import PurchasePlanningSection from '../layout/PurchasePlanningSection';
import BottomPane from '../layout/BottomPane';
import Footer from '../layout/Footer';
import { StepConnector, ConnectedSection, AppWithSpine } from '../components/VerticalStepper';

export default function App() {
  const initialize = useStore((s) => s.initialize);

  useEffect(() => {
    // Initialize the app with fresh Bitcoin price data
    initialize();
  }, [initialize]);

  return (
    <AppWithSpine>
      <Shell>
        {/* Step 1: Initial Configuration */}
        <ConnectedSection>
          <HeroSection />
        </ConnectedSection>

        <StepConnector
          title="Purchase Planning"
          isActive={true}
        />

        {/* Step 2: Purchase Planning */}
        <ConnectedSection>
          <PurchasePlanningSection />
        </ConnectedSection>

        <StepConnector
          title="Strategy Analysis"
          isActive={false}
        />

        {/* Step 3 & 4: Strategy Projection and Configuration */}
        <ConnectedSection>
          <BottomPane />
        </ConnectedSection>

        <Footer />
      </Shell>
    </AppWithSpine>
  );
}

