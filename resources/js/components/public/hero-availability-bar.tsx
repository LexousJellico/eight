import { type FormEvent, type ReactNode, useMemo, useState } from 'react';
import {
  CalendarDays,
  CircleAlert,
  CircleX,
  Info,
  LoaderCircle,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type VenueOption = {
  label: string;
  value: string;
  category?: string | null;
  capacity?: string | null;
};

type AvailabilityStatus =
  | 'available'
  | 'limited'
  | 'public_booked'
  | 'private_booked'
  | 'blocked';

type AvailabilityBlock = {
  key: 'AM' | 'PM' | 'EVE' | string;
  label: string;
  from: string;
  to: string;
  is_available: boolean;
};

type AvailabilityResult = {
  date: string;
  venue: string;
  status: AvailabilityStatus;
  title: string;
  description: string;
  note: string;
  blocks?: AvailabilityBlock[];
  event_titles?: string[];
  recommended_action?: string;
  can_proceed?: boolean;
  venue_capacity_ok?: boolean;
  venue_capacity_message?: string;
};

const eventTypeOptions = [
  'Conference',
  'Convention',
  'Summit',
  'Seminar',
  'Workshop',
  'Training',
  'Meeting',
  'Board Meeting',
  'General Assembly',
  'Government Program',
  'Public Forum',
  'Press Conference',
  'Exhibit',
  'Expo',
  'Trade Fair',
  'Bazaar',
  'Product Launch',
  'Corporate Event',
  'Cultural Program',
  'Cultural Show',
  'Concert',
  'Awards Night',
  'Graduation',
  'Recognition Program',
  'Wedding Reception',
  'Debut',
  'Birthday Celebration',
  'Religious Gathering',
  'Community Event',
  'Festival Activity',
  'Sports Event',
  'Private Event',
];

function getCsrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')?.trim() ?? '';
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) return response.json();

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { message: text || 'Unexpected response.' };
  }
}

function tone(status: AvailabilityStatus) {
  switch (status) {
    case 'available':
      return 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200';
    case 'limited':
      return 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-200';
    case 'public_booked':
      return 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-400/20 dark:bg-sky-500/10 dark:text-sky-200';
    case 'private_booked':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-400/20 dark:bg-yellow-500/10 dark:text-yellow-200';
    default:
      return 'border-red-200 bg-red-50 text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200';
  }
}

function blockTone(block: AvailabilityBlock) {
  return block.is_available
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-500/10 dark:text-emerald-200'
    : 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200';
}

function HeroFieldShell({
  label,
  icon,
  children,
}: {
  label: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-[1.45rem] border border-black/5 bg-white/95 px-4 py-3 text-slate-800 shadow-[0_10px_30px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/78 dark:text-white">
      <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        <span className="text-slate-400 dark:text-slate-500">{icon}</span>
        {label}
      </div>
      {children}
    </div>
  );
}

export default function HeroAvailabilityBar({ venueOptions }: { venueOptions: VenueOption[] }) {
  const [date, setDate] = useState('');
  const [eventType, setEventType] = useState('');
  const [venue, setVenue] = useState('');
  const [guests, setGuests] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedVenue = useMemo(
    () => venueOptions.find((item) => item.value === venue) ?? null,
    [venue, venueOptions],
  );

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!date || !eventType || !venue || !guests) {
      setValidationMessage('Please complete the date, event type, area, and guest count.');
      return;
    }

    setLoading(true);
    setModalOpen(true);
    setResult(null);
    setValidationMessage('');
    setModalMessage('Checking selected date and area...');

    try {
      const response = await fetch('/public/availability-check', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRF-TOKEN': getCsrfToken(),
        },
        body: JSON.stringify({
          date,
          event_type: eventType,
          venue,
          guests: Number(guests),
        }),
      });

      const payload = await parseResponse(response);

      if (!response.ok) {
        setModalMessage(payload?.message ?? 'Unable to check availability right now.');
        return;
      }

      setResult(payload as AvailabilityResult);
      setModalMessage('');
    } catch {
      setModalMessage('Unable to check availability right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="glass-card rounded-[2rem] border-white/20 p-3 shadow-[0_28px_70px_rgba(15,23,42,0.18)] dark:shadow-[0_28px_70px_rgba(2,8,23,0.50)] lg:p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-1">
          <div>
            <div className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-white/72">
              Availability Quick Check
            </div>
            <div className="mt-1 text-sm text-white/86">
              Select your target date, event type, and area before starting the booking request.
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 backdrop-blur-md">
            <Sparkles className="h-4 w-4" />
            Public-facing schedule preview
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 xl:grid-cols-[1.04fr_1.18fr_1.15fr_0.88fr_auto]">
          <HeroFieldShell label="Event Date" icon={<CalendarDays className="h-4 w-4" />}>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </HeroFieldShell>

          <HeroFieldShell label="Event Type" icon={<Sparkles className="h-4 w-4" />}>
            <Select value={eventType || undefined} onValueChange={setEventType}>
              <SelectTrigger className="h-auto border-0 bg-transparent px-0 py-0 text-sm font-semibold shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/10 bg-white/96 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white">
                {eventTypeOptions.map((item) => (
                  <SelectItem key={item} value={item} className="rounded-xl py-2.5 text-sm">
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </HeroFieldShell>

          <HeroFieldShell label="Select Area" icon={<Info className="h-4 w-4" />}>
            <Select value={venue || undefined} onValueChange={setVenue}>
              <SelectTrigger className="h-auto border-0 bg-transparent px-0 py-0 text-sm font-semibold shadow-none focus-visible:ring-0">
                <SelectValue placeholder="Select area" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-black/10 bg-white/96 text-slate-900 shadow-[0_20px_50px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-slate-950/96 dark:text-white">
                {venueOptions.map((item) => (
                  <SelectItem key={item.value} value={item.value} className="rounded-xl py-2.5 text-sm">
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      {item.capacity ? (
                        <span className="text-xs text-slate-500 dark:text-slate-400">{item.capacity}</span>
                      ) : null}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </HeroFieldShell>

          <HeroFieldShell label="Guests Count" icon={<Users className="h-4 w-4" />}>
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(e.target.value)}
              placeholder="Estimated guests"
              className="w-full bg-transparent text-sm font-semibold outline-none"
            />
          </HeroFieldShell>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[86px] items-center justify-center rounded-[1.45rem] bg-[#0f8b6d] px-6 text-sm font-extrabold uppercase tracking-[0.16em] text-white shadow-[0_18px_42px_rgba(15,139,109,0.34)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-[#294CFF] dark:shadow-[0_18px_42px_rgba(41,76,255,0.26)]"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <LoaderCircle className="h-5 w-5 animate-spin" />
                Checking
              </span>
            ) : (
              'Check Availability'
            )}
          </button>
        </form>

        {selectedVenue ? (
          <div className="mt-3 flex flex-wrap gap-2 rounded-[1.2rem] border border-white/12 bg-black/12 px-4 py-3 text-xs text-white/82 dark:bg-white/6">
            <span className="font-semibold uppercase tracking-[0.12em]">{selectedVenue.label}</span>
            {selectedVenue.category ? <span>• {selectedVenue.category}</span> : null}
            {selectedVenue.capacity ? <span>• Capacity: {selectedVenue.capacity}</span> : null}
          </div>
        ) : null}

        {validationMessage ? (
          <div className="mt-3 inline-flex w-full items-start gap-2 rounded-[1.1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-400/20 dark:bg-red-500/10 dark:text-red-200">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{validationMessage}</span>
          </div>
        ) : null}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/58 backdrop-blur-md"
            onClick={closeModal}
            aria-label="Close availability result"
          />

          <div className="relative w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/15 bg-[#f8f5ee] shadow-[0_32px_90px_rgba(15,23,42,0.28)] animate-in fade-in zoom-in-95 duration-200 dark:border-white/10 dark:bg-[#09111e]">
            <div className="flex items-center justify-between border-b border-black/5 px-5 py-4 dark:border-white/10 sm:px-6">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Availability Status
                </div>
                <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
                  {loading ? 'Checking selected schedule' : result?.title || 'Availability result'}
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">
              {loading ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-[#0f8b6d]/10 text-[#0f8b6d] dark:bg-[#294CFF]/10 dark:text-[#9fb4ff]">
                    <LoaderCircle className="h-8 w-8 animate-spin" />
                  </div>
                  <div className="mt-5 text-xl font-semibold text-slate-900 dark:text-white">Checking availability</div>
                  <p className="mt-2 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {modalMessage || 'Please wait while the system reviews the selected date, area, and visible schedule.'}
                  </p>
                </div>
              ) : modalMessage && !result ? (
                <div className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 dark:border-red-400/20 dark:bg-red-500/10">
                  <div className="flex items-start gap-3 text-red-800 dark:text-red-200">
                    <CircleX className="mt-0.5 h-5 w-5 shrink-0" />
                    <div>
                      <div className="font-semibold">Unable to complete the check</div>
                      <div className="mt-1 text-sm leading-7">{modalMessage}</div>
                    </div>
                  </div>
                </div>
              ) : result ? (
                <div className="space-y-5">
                  <div className={`rounded-[1.6rem] border p-5 ${tone(result.status)}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-75">
                          {result.venue} • {result.date}
                        </div>
                        <div className="mt-2 text-xl font-semibold">{result.title}</div>
                        <p className="mt-2 text-sm leading-7 opacity-90">{result.description}</p>
                      </div>

                      <div className="rounded-full border border-current/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em]">
                        {result.status.replaceAll('_', ' ')}
                      </div>
                    </div>

                    <div className="mt-4 rounded-[1.2rem] border border-current/10 bg-white/60 px-4 py-4 text-sm leading-7 dark:bg-black/10">
                      <div className="font-semibold">System note</div>
                      <div className="mt-1">{result.note}</div>
                      {result.recommended_action ? <div className="mt-2 font-medium">{result.recommended_action}</div> : null}
                      {result.venue_capacity_message ? <div className="mt-2">{result.venue_capacity_message}</div> : null}
                    </div>
                  </div>

                  {result.blocks && result.blocks.length > 0 ? (
                    <div className="rounded-[1.6rem] border border-black/5 bg-white/90 p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                        Time Block Status
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {result.blocks.map((block) => (
                          <div key={block.key} className={`rounded-[1.2rem] border p-4 ${blockTone(block)}`}>
                            <div className="text-sm font-bold uppercase tracking-[0.16em]">{block.key}</div>
                            <div className="mt-1 text-base font-semibold">{block.label}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.12em] opacity-80">
                              {block.from} - {block.to}
                            </div>
                            <div className="mt-3 text-sm font-medium">
                              {block.is_available ? 'Available' : 'Occupied'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {result.event_titles && result.event_titles.length > 0 ? (
                    <div className="rounded-[1.6rem] border border-black/5 bg-white/90 p-5 dark:border-white/10 dark:bg-white/5">
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300">
                        Visible Events on This Date
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {result.event_titles.map((title) => (
                          <span
                            key={title}
                            className="rounded-full border border-black/10 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
                          >
                            {title}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
