<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPostEventCharge;
use App\Support\BcccBookingPolicyCatalog;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class BookingBillingService
{
    public function __construct(private readonly BookingFinancialSummaryService $financialSummary)
    {
    }

    public function summarize(Booking $booking): array
    {
        $booking->loadMissing(['payments', 'bookingServices.service', 'postEventCharges']);

        $financial = $this->financialSummary->summarize($booking);
        $baseTotal = $this->money($booking->finalized_total ?? $financial['total'] ?? 0);
        $postEventTotal = $booking->postEventCharges
            ->filter(fn (BookingPostEventCharge $charge): bool => ! in_array($this->normalize($charge->status), ['void', 'waived', 'cancelled', 'canceled'], true))
            ->sum(fn (BookingPostEventCharge $charge): float => $this->money($charge->amount));

        $totalWithPostEvent = $baseTotal + $postEventTotal;
        $paid = $this->money($financial['paid'] ?? 0);
        $pending = $this->money($financial['pending'] ?? 0);
        $requiredDownPayment = $this->resolveRequiredDownPayment($booking, $baseTotal);
        $requiredBond = $this->resolveRequiredBond($booking);
        $balance = max($totalWithPostEvent - $paid, 0);

        return [
            'base_total' => $this->roundMoney($baseTotal),
            'base_subtotal' => $this->roundMoney($this->money($booking->base_subtotal ?? $baseTotal)),
            'discount_total' => $this->roundMoney($this->money($booking->discount_total ?? 0)),
            'post_event_total' => $this->roundMoney($postEventTotal),
            'total_with_post_event' => $this->roundMoney($totalWithPostEvent),
            'paid' => $this->roundMoney($paid),
            'pending' => $this->roundMoney($pending),
            'balance' => $this->roundMoney($balance),
            'required_down_payment' => $this->roundMoney($requiredDownPayment),
            'required_bond' => $this->roundMoney($requiredBond),
            'bond_status' => (string) ($booking->bond_status ?: 'pending'),
            'bond_paid' => in_array($this->normalize($booking->bond_status), ['paid', 'posted', 'settled', 'waived'], true),
            'down_payment_paid' => $paid >= $requiredDownPayment && $requiredDownPayment > 0,
            'confirmation_ready' => $paid >= $requiredDownPayment && $requiredDownPayment > 0,
            'balance_due_at' => optional($booking->balance_due_at)->toIso8601String(),
            'down_payment_due_at' => optional($booking->down_payment_due_at)->toIso8601String(),
            'final_computation_locked_at' => optional($booking->final_computation_locked_at)->toIso8601String(),
            'final_computation_meta' => is_array($booking->final_computation_meta ?? null) ? $booking->final_computation_meta : [],
            'policy' => [
                'active_charge_scope' => BcccBookingPolicyCatalog::ACTIVE_CHARGE_SCOPE,
                'discount_privacy' => 'Discounts are only shown on final computation and internal billing review.',
                'excluded_charges' => BcccBookingPolicyCatalog::excludedUserCharges(),
            ],
        ];
    }

    public function lockFinalComputation(Booking $booking, ?int $userId = null, ?string $notes = null): Booking
    {
        return DB::transaction(function () use ($booking, $userId, $notes): Booking {
            $booking->loadMissing(['payments', 'bookingServices.service', 'postEventCharges']);

            $financial = $this->financialSummary->summarize($booking);
            $baseTotal = $this->money($financial['total'] ?? 0);
            $requiredDownPayment = round($baseTotal * BcccBookingPolicyCatalog::REQUIRED_DOWN_PAYMENT_RATE, 2);
            $requiredBond = BcccBookingPolicyCatalog::REQUIRED_BOND_AMOUNT;

            $payload = [];

            if (Schema::hasColumn('bookings', 'base_subtotal')) {
                $payload['base_subtotal'] = $baseTotal;
            }

            if (Schema::hasColumn('bookings', 'discount_total')) {
                $payload['discount_total'] = $this->money($booking->discount_total ?? 0);
            }

            if (Schema::hasColumn('bookings', 'finalized_total')) {
                $payload['finalized_total'] = $baseTotal;
            }

            if (Schema::hasColumn('bookings', 'required_down_payment_amount')) {
                $payload['required_down_payment_amount'] = $requiredDownPayment;
            }

            if (Schema::hasColumn('bookings', 'required_bond_amount')) {
                $payload['required_bond_amount'] = $requiredBond;
            }

            if (Schema::hasColumn('bookings', 'final_computation_locked_at')) {
                $payload['final_computation_locked_at'] = now();
            }

            if ($userId && Schema::hasColumn('bookings', 'final_computation_locked_by_user_id')) {
                $payload['final_computation_locked_by_user_id'] = $userId;
            }

            if (Schema::hasColumn('bookings', 'final_computation_meta')) {
                $payload['final_computation_meta'] = [
                    'source' => 'admin_finalization',
                    'locked_by_user_id' => $userId,
                    'locked_at' => now()->toIso8601String(),
                    'active_charge_scope' => BcccBookingPolicyCatalog::ACTIVE_CHARGE_SCOPE,
                    'discounts_visible_only_on_final_review' => true,
                    'financial_summary' => $financial,
                ];
            }

            if ($notes !== null && Schema::hasColumn('bookings', 'billing_notes')) {
                $payload['billing_notes'] = trim($notes) ?: null;
            }

            $booking->forceFill($payload)->save();

            return $booking->fresh(['payments', 'bookingServices.service', 'postEventCharges']);
        });
    }

    public function updateBilling(Booking $booking, array $data, ?int $userId = null): Booking
    {
        return DB::transaction(function () use ($booking, $data, $userId): Booking {
            $payload = [];

            foreach ([
                'base_subtotal',
                'discount_total',
                'finalized_total',
                'required_down_payment_amount',
                'required_bond_amount',
                'bond_status',
                'bond_waiver_reason',
                'billing_notes',
            ] as $column) {
                if (array_key_exists($column, $data) && Schema::hasColumn('bookings', $column)) {
                    $payload[$column] = is_string($data[$column]) ? trim($data[$column]) : $data[$column];
                }
            }

            $bondStatus = $this->normalize($payload['bond_status'] ?? $booking->bond_status ?? 'pending');

            if (Schema::hasColumn('bookings', 'bond_paid_at') && in_array($bondStatus, ['paid', 'posted', 'settled'], true)) {
                $payload['bond_paid_at'] = $booking->bond_paid_at ?: now();
            }

            if (Schema::hasColumn('bookings', 'bond_waived_at') && $bondStatus === 'waived') {
                $payload['bond_waived_at'] = $booking->bond_waived_at ?: now();
            }

            if ((bool) ($data['lock_final_computation'] ?? false)) {
                $booking->forceFill($payload)->save();
                return $this->lockFinalComputation($booking->fresh(), $userId, $data['billing_notes'] ?? null);
            }

            if (! empty($payload)) {
                $booking->forceFill($payload)->save();
            }

            return $booking->fresh(['payments', 'bookingServices.service', 'postEventCharges']);
        });
    }

    public function createPostEventCharge(Booking $booking, array $data, ?int $userId = null): BookingPostEventCharge
    {
        return $booking->postEventCharges()->create([
            'category' => $this->normalize($data['category'] ?? 'post_event'),
            'label' => trim((string) $data['label']),
            'amount' => $this->roundMoney($this->money($data['amount'] ?? 0)),
            'status' => $this->normalize($data['status'] ?? 'assessed'),
            'notes' => trim((string) ($data['notes'] ?? '')) ?: null,
            'assessed_at' => now(),
            'assessed_by_user_id' => $userId,
        ]);
    }

    public function updatePostEventCharge(BookingPostEventCharge $charge, array $data): BookingPostEventCharge
    {
        $charge->update([
            'category' => $this->normalize($data['category'] ?? $charge->category ?? 'post_event'),
            'label' => trim((string) ($data['label'] ?? $charge->label)),
            'amount' => $this->roundMoney($this->money($data['amount'] ?? $charge->amount ?? 0)),
            'status' => $this->normalize($data['status'] ?? $charge->status ?? 'assessed'),
            'notes' => array_key_exists('notes', $data) ? (trim((string) $data['notes']) ?: null) : $charge->notes,
        ]);

        return $charge->fresh();
    }

    public function deletePostEventCharge(BookingPostEventCharge $charge): void
    {
        $charge->delete();
    }

    private function resolveRequiredDownPayment(Booking $booking, float $baseTotal): float
    {
        $stored = $this->money($booking->required_down_payment_amount ?? 0);

        if ($stored > 0) {
            return $stored;
        }

        return $baseTotal > 0 ? round($baseTotal * BcccBookingPolicyCatalog::REQUIRED_DOWN_PAYMENT_RATE, 2) : 0.0;
    }

    private function resolveRequiredBond(Booking $booking): float
    {
        $stored = $this->money($booking->required_bond_amount ?? 0);

        return $stored > 0 ? $stored : BcccBookingPolicyCatalog::REQUIRED_BOND_AMOUNT;
    }

    private function normalize(?string $value): string
    {
        $clean = strtolower(trim((string) $value));
        $clean = preg_replace('/[^a-z0-9]+/', '_', $clean) ?: '';

        return trim($clean, '_') ?: 'pending';
    }

    private function money(mixed $value): float
    {
        if ($value === null || $value === '') {
            return 0.0;
        }

        if (is_numeric($value)) {
            return (float) $value;
        }

        $clean = preg_replace('/[^0-9.\-]/', '', (string) $value);

        return $clean !== '' && is_numeric($clean) ? (float) $clean : 0.0;
    }

    private function roundMoney(float $value): float
    {
        return round($value, 2);
    }
}
