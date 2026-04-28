import { router } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type LoadingPhase = 'idle' | 'starting' | 'loading' | 'finishing';

export function BackendRouteLoader() {
  const [phase, setPhase] = useState<LoadingPhase>('idle');
  const [progress, setProgress] = useState(0);

  const progressTimer = useRef<number | null>(null);
  const overlayTimer = useRef<number | null>(null);
  const finishTimer = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('backend-smooth-scroll-active');

    return () => {
      document.documentElement.classList.remove('backend-smooth-scroll-active');
    };
  }, []);

  useEffect(() => {
    const clearTimers = () => {
      if (progressTimer.current) {
        window.clearInterval(progressTimer.current);
        progressTimer.current = null;
      }

      if (overlayTimer.current) {
        window.clearTimeout(overlayTimer.current);
        overlayTimer.current = null;
      }

      if (finishTimer.current) {
        window.clearTimeout(finishTimer.current);
        finishTimer.current = null;
      }
    };

    const unbindStart = router.on('start', () => {
      clearTimers();

      setProgress(8);
      setPhase('starting');

      overlayTimer.current = window.setTimeout(() => {
        setPhase('loading');
      }, 250);

      progressTimer.current = window.setInterval(() => {
        setProgress((current) => {
          if (current < 35) return current + 4;
          if (current < 65) return current + 2;
          if (current < 85) return current + 0.8;
          return Math.min(current + 0.2, 92);
        });
      }, 160);
    });

    const unbindFinish = router.on('finish', () => {
      clearTimers();
      setProgress(100);
      setPhase('finishing');

      finishTimer.current = window.setTimeout(() => {
        setPhase('idle');
        setProgress(0);
      }, 350);
    });

    return () => {
      clearTimers();
      unbindStart();
      unbindFinish();
    };
  }, []);

  const active = phase !== 'idle';
  const showOverlay = phase === 'loading';

  return (
    <>
      <div
        className={`backend-route-progress ${active ? 'is-active' : ''}`}
        aria-hidden="true"
      >
        <div
          className="backend-route-progress-bar"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        className={`backend-route-overlay ${showOverlay ? 'is-visible' : ''}`}
        aria-hidden={!showOverlay}
      >
        <div className="backend-route-loader-card">
          <div className="backend-route-loader-orb">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>

          <div>
            <p className="text-sm font-black tracking-[-0.02em]">
              Loading workspace
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Please wait while the page updates.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
