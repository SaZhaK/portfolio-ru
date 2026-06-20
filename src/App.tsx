import { useState, useEffect, lazy, Suspense } from 'react';
import { Router, Route, Switch } from 'wouter';
import { useHashLocation } from 'wouter/use-hash-location';
import { MotionConfig } from 'framer-motion';
import { PortfolioPage } from '@/pages/portfolio';
import { CustomCursor } from '@/components/CustomCursor';
import { SmoothScrollProvider } from '@/components/SmoothScroll';
import { OpenToWorkBanner } from '@/components/OpenToWorkBanner';
import { DemoBanner } from '@/components/DemoBanner';
import { applyThemePalette, hexToPresetPalette } from '@/lib/themes';
import { config } from '@/portfolio.config';

const ResumePage = lazy(() =>
  import('@/pages/resume').then((m) => ({ default: m.ResumePage }))
);
const LandingPage = lazy(() =>
  import('@/pages/landing').then((m) => ({ default: m.LandingPage }))
);
const SetupPage = lazy(() =>
  import('@/pages/setup').then((m) => ({ default: m.SetupPage }))
);
const BlogListPage = lazy(() =>
  import('@/pages/blog').then((m) => ({ default: m.BlogListPage }))
);
const BlogPostPage = lazy(() =>
  import('@/pages/blog/post').then((m) => ({ default: m.BlogPostPage }))
);

const IS_DEMO = import.meta.env.VITE_DEMO_MODE === 'true';

function PortfolioWithChrome({
  showDemoBanner,
}: {
  showDemoBanner: boolean;
}) {
  const [demoBannerVisible, setDemoBannerVisible] = useState(
    showDemoBanner && localStorage.getItem('gitvitae-demo-dismissed') !== '1'
  );
  const [openToWorkVisible, setOpenToWorkVisible] = useState(config.openToWork);

  const demoBannerHeight = demoBannerVisible ? 40 : 0;
  const totalTopOffset = demoBannerHeight + (openToWorkVisible ? 40 : 0);

  return (
    <SmoothScrollProvider>
      <CustomCursor />
      <DemoBanner onDismiss={() => setDemoBannerVisible(false)} />
      <OpenToWorkBanner
        onDismiss={() => setOpenToWorkVisible(false)}
        topOffset={demoBannerHeight}
      />
      <div
        className="transition-[padding] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ paddingTop: `${totalTopOffset}px` }}
      >
        <PortfolioPage topOffset={totalTopOffset} />
      </div>
    </SmoothScrollProvider>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
    const palette = config.primaryColor
      ? hexToPresetPalette(config.primaryColor)
      : config.customColors;
    applyThemePalette(
      config.primaryColor ? 'custom' : config.colorPreset,
      true,
      palette
    );
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <Router hook={useHashLocation}>
        <Suspense fallback={null}>
          <Switch>
            {/* Blog routes — always accessible */}
            <Route path="/blog/:slug">
              {(params) => (
                <BlogPostPage slug={(params as { slug: string }).slug ?? ''} />
              )}
            </Route>
            <Route path="/blog">
              <BlogListPage />
            </Route>

            {/* Resume page — always accessible */}
            <Route path="/resume">
              <CustomCursor />
              <ResumePage />
            </Route>

            {/* Setup wizard */}
            <Route path="/setup">
              <SetupPage />
            </Route>

            {/* Demo portfolio — always accessible at #/demo */}
            <Route path="/demo">
              <PortfolioWithChrome showDemoBanner={IS_DEMO} />
            </Route>

            {/* Root — landing page or portfolio depending on siteMode */}
            <Route>
              {config.siteMode === 'landing' ? (
                <LandingPage />
              ) : (
                <PortfolioWithChrome showDemoBanner={IS_DEMO} />
              )}
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </MotionConfig>
  );
}

export default App;
