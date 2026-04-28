import { Loader2, Sparkles } from 'lucide-react';

type BookingFormLoadingLayerProps = {
  visible: boolean;
  label?: string;
  sublabel?: string;
};

export function BookingFormLoadingLayer({
  visible,
  label = 'Preparing your booking page',
  sublabel = 'Please wait while the form updates.',
}: BookingFormLoadingLayerProps) {
  return (
    <div
      className={`booking-form-loading-layer ${visible ? 'is-visible' : ''}`}
      aria-hidden={!visible}
    >
      <div className="booking-form-loading-card">
        <div className="booking-form-loading-orb">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#c9a96a]" />
            <p className="truncate text-sm font-black tracking-[-0.02em]">
              {label}
            </p>
          </div>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {sublabel}
          </p>
        </div>
      </div>
    </div>
  );
}
