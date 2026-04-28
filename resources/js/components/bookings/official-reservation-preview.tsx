import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  BOOKING_USAGE_LABELS,
  type BookingUsageKey,
} from '@/lib/booking-venue-catalog';
import { Printer } from 'lucide-react';

type OfficialReservationPreviewProps = {
  data: Record<string, any>;
  selectedVenue?: Record<string, any>;
  usage: BookingUsageKey;
  durationHours: string;
  otherRentals: string;
  additionalCharges: string;
  reservationNotes: string;
  estimatedBase: number;
  estimatedTotal: number;
  fullAddress: string;
};

function money(value: unknown): string {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return '₱0.00';
  }

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(amount);
}

function text(value: unknown, fallback = '—'): string {
  const output = String(value ?? '').trim();

  return output || fallback;
}

function checked(value: boolean): string {
  return value ? '☑' : '☐';
}

function rateLine(
  selectedLabel: string | undefined,
  label: string,
  rate: number,
  usage: BookingUsageKey,
  targetUsage: BookingUsageKey,
  total: number,
) {
  const isSelected = usage === targetUsage;

  return (
    <tr>
      <td className="bccc-form-usage">
        {checked(isSelected)} {BOOKING_USAGE_LABELS[targetUsage]}
      </td>
      <td className="bccc-form-center">
        {targetUsage === 'additional_hour' && isSelected ? selectedLabel : isSelected ? 'Fixed' : '—'}
      </td>
      <td className="bccc-form-money">{money(rate)}</td>
      <td className="bccc-form-money">{isSelected ? money(total) : '₱0.00'}</td>
      <td />
    </tr>
  );
}

function ChargeSection({
  title,
  active,
  rates,
  usage,
  durationHours,
  total,
}: {
  title: string;
  active: boolean;
  rates?: Record<string, number>;
  usage: BookingUsageKey;
  durationHours: string;
  total: number;
}) {
  const safeRates = {
    whole_day: Number(rates?.whole_day ?? 0),
    half_day: Number(rates?.half_day ?? 0),
    additional_hour: Number(rates?.additional_hour ?? 0),
  };

  return (
    <section className={`bccc-form-charge-block ${active ? 'is-active' : ''}`}>
      <div className="bccc-form-charge-title">
        <strong>{title}</strong>
        {active ? <span>Selected</span> : null}
      </div>

      <table className="bccc-form-table">
        <thead>
          <tr>
            <th>Usage</th>
            <th>Duration</th>
            <th>Rate</th>
            <th>Total</th>
            <th>Remarks</th>
          </tr>
        </thead>

        <tbody>
          {rateLine(
            durationHours ? `${durationHours} hour(s)` : '1 hour',
            title,
            safeRates.whole_day,
            usage,
            'whole_day',
            active ? total : 0,
          )}
          {rateLine(
            durationHours ? `${durationHours} hour(s)` : '1 hour',
            title,
            safeRates.half_day,
            usage,
            'half_day',
            active ? total : 0,
          )}
          {rateLine(
            durationHours ? `${durationHours} hour(s)` : '1 hour',
            title,
            safeRates.additional_hour,
            usage,
            'additional_hour',
            active ? total : 0,
          )}
          <tr className="bccc-form-subtotal-row">
            <td colSpan={3}>Subtotal</td>
            <td className="bccc-form-money">{active ? money(total) : '₱0.00'}</td>
            <td />
          </tr>
        </tbody>
      </table>
    </section>
  );
}

export function OfficialReservationPreview({
  data,
  selectedVenue,
  usage,
  durationHours,
  otherRentals,
  additionalCharges,
  reservationNotes,
  estimatedBase,
  estimatedTotal,
  fullAddress,
}: OfficialReservationPreviewProps) {
  const selectedLabel = String(selectedVenue?.label ?? '');
  const rates = selectedVenue?.rates ?? {};
  const additional = Number(additionalCharges || 0);

  const chargeNames = [
    'FULL HALL',
    'MAIN HALL',
    'LED WALL',
    'VIP LOUNGE',
    'BOARD ROOM',
  ];

  return (
    <div className="bccc-preview-shell">
      <div className="bccc-preview-actions no-print">
        <div>
          <p className="backend-booking-label">Digital Form Preview</p>
          <h3 className="text-xl font-black tracking-[-0.04em]">
            Printable Reservation Form
          </h3>
        </div>

        <Button
          type="button"
          className="rounded-full"
          onClick={() => window.print()}
        >
          <Printer className="mr-2 h-4 w-4" />
          Print Form
        </Button>
      </div>

      <div className="bccc-print-root">
        <div className="bccc-form-paper">
          <header className="bccc-form-header">
            <div className="bccc-form-logo-mark">
              <div className="bccc-form-roof" />
              <div className="bccc-form-base" />
            </div>

            <div>
              <p className="bccc-form-small">Reservation Form</p>
              <h1>Baguio Convention & Cultural Center</h1>
              <p className="bccc-form-office">
                City Tourism, Culture and Arts Office · City Government of Baguio
              </p>
            </div>
          </header>

          <Separator className="my-4" />

          <section className="bccc-form-section">
            <div className="bccc-form-section-title">1: Event Details</div>

            <div className="bccc-form-grid">
              <div className="bccc-form-line">
                <span>Title:</span>
                <strong>{text(data.type_of_event)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Date/s:</span>
                <strong>
                  {text(data.booking_date_from)} to {text(data.booking_date_to)}
                </strong>
              </div>

              <div className="bccc-form-line">
                <span>Guests:</span>
                <strong>{text(data.number_of_guests)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Area:</span>
                <strong>{text(selectedVenue?.displayLabel ?? selectedVenue?.label)}</strong>
              </div>
            </div>
          </section>

          <section className="bccc-form-section">
            <div className="bccc-form-section-title">2: Organizer</div>

            <div className="bccc-form-grid">
              <div className="bccc-form-line">
                <span>Name Organization:</span>
                <strong>{text(data.company_name)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Head of Organization:</span>
                <strong>{text(data.head_of_organization)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Contact Person:</span>
                <strong>{text(data.client_name)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Tel No:</span>
                <strong>{text(data.client_contact_number)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Email:</span>
                <strong>{text(data.client_email)}</strong>
              </div>

              <div className="bccc-form-line">
                <span>Address:</span>
                <strong>{text(fullAddress)}</strong>
              </div>
            </div>
          </section>

          <section className="bccc-form-section">
            <div className="bccc-form-section-title">3: Charges</div>

            <div className="bccc-form-charge-stack">
              {chargeNames.map((name) => (
                <ChargeSection
                  key={name}
                  title={name}
                  active={selectedLabel === name}
                  rates={selectedLabel === name ? rates : undefined}
                  usage={usage}
                  durationHours={durationHours}
                  total={estimatedBase}
                />
              ))}
            </div>

            <div className="bccc-form-totals">
              <div>
                <span>Other Rentals:</span>
                <strong>{text(otherRentals, 'None')}</strong>
              </div>

              <div>
                <span>Additional Charges:</span>
                <strong>{money(additional)}</strong>
              </div>

              <div className="bccc-form-grand-total">
                <span>Total Charges:</span>
                <strong>{money(estimatedTotal)}</strong>
              </div>

              <div>
                <span>Notes:</span>
                <strong>
                  {text(
                    reservationNotes,
                    'Additional charges may be imposed after assessment at egress. The City has the right to bump off reservations depending on reservation status.',
                  )}
                </strong>
              </div>
            </div>
          </section>

          <section className="bccc-form-section bccc-form-compact-rules">
            <div className="bccc-form-section-title">4: Booking Reminders</div>

            <ul>
              <li>Full payment must be settled before ingress, subject to separate billing statement.</li>
              <li>Organizers must seek clearance from BCCC administration prior to ingress.</li>
              <li>All items and equipment brought inside the facility must be declared for review and approval.</li>
              <li>Additional charges may be imposed after assessment at egress.</li>
            </ul>
          </section>

          <section className="bccc-form-signatures">
            <div>
              <p>Assessed by:</p>
              <div className="bccc-signature-line" />
              <strong>Ian Catacutan</strong>
              <span>Reservations</span>
            </div>

            <div>
              <p>Conforme:</p>
              <div className="bccc-signature-line" />
              <strong>{text(data.client_name, 'Client / Authorized Representative')}</strong>
              <span>Signature over printed name</span>
            </div>

            <div>
              <p>Recommending Approval:</p>
              <div className="bccc-signature-line" />
              <strong>Engr. Aloysius C. Mapalo</strong>
              <span>City Tourism Officer</span>
            </div>

            <div>
              <p>Approved by:</p>
              <div className="bccc-signature-line" />
              <strong>Vittorio Jerico L. Cawis</strong>
              <span>City Administrator</span>
            </div>
          </section>

          <footer className="bccc-form-footer">
            <strong>City Tourism, Culture and Arts Office</strong>
            <span>
              (074) 446-2009 · Globe (+63) 956 572 9097 · Smart (+63) 960 200 9679 · www.baguio.gov.ph
            </span>
          </footer>
        </div>
      </div>
    </div>
  );
}
