import React, { useEffect } from 'react';
import { useStore } from '../state/store';
import Shell from '../layout/Shell';
import HeroSection from '../layout/HeroSection';
import PurchasePlanningSection from '../layout/PurchasePlanningSection';
import TopSpineSpacer from '../layout/TopSpineSpacer';
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
        {/* Spine spacer between header and first section */}
        <TopSpineSpacer />

        {/* Step 1: Initial Configuration */}
        <ConnectedSection>
          <div id="hero-section">
            <HeroSection />
          </div>
        </ConnectedSection>

        <StepConnector
          title="Purchase Planning"
          isActive={true}
          sectionId="purchase-section"
        />

        {/* Step 2: Purchase Planning */}
        <ConnectedSection>
          <div id="purchase-section">
            <PurchasePlanningSection />
          </div>
        </ConnectedSection>

        <StepConnector
          title="Strategy Analysis"
          isActive={false}
          sectionId="projection-section"
        />

        {/* Step 3: Strategy Projection */}
        <ConnectedSection>
          <div id="projection-section">
            <BottomPane />
          </div>
        </ConnectedSection>

        <Footer />
      </Shell>
    </AppWithSpine>
  );
}

