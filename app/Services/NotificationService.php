<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\BookingPayment;
use App\Models\CalendarBlock;
use App\Models\Service;
use App\Models\ServiceType;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

class NotificationService
{
    /* ============================================================
     | Roles & Recipients
     * ============================================================ */

    protected function recipientsByRoles(array $roles, ?User $exclude = null): Collection
    {
        $roles = array_values(array_filter($roles, fn ($r) => is_string($r) && trim($r) !== ''));
        $rolesLower = array_map(fn ($r) => mb_strtolower($r), $roles);

        // spatie/permission relationship: roles()
        $q = User::query()->whereHas('roles', function ($q) use ($rolesLower) {
            $q->whereIn(DB::raw('LOWER(name)'), $rolesLower);
        });

        if ($exclude) {
            $q->whereKeyNot($exclude->id);
        }

        return $q->get()->unique('id')->values();
    }

    protected function adminRecipients(?User $exclude = null): Collection
    {
        return $this->recipientsByRoles(['admin'], $exclude);
    }

    protected function managerRecipients(?User $exclude = null): Collection
    {
        return $this->recipientsByRoles(['manager'], $exclude);
    }

    protected function staffRecipients(?User $exclude = null): Collection
    {
        return $this->recipientsByRoles(['staff'], $exclude);
    }

    /**
     * ✅ Admin audit recipients:
     * - exclude actor if possible
     * - BUT if excluding the actor would produce an empty list (ex: only 1 admin),
     *   include the actor so the action is still visible in the bell.
     */
    protected function adminAuditRecipients(?User $actor = null): Collection
    {
        if (! $actor) {
            return $this->adminRecipients(null);
        }

        $recipients = $this->adminRecipients($actor);

        // If actor is admin and there are no other admins, include the actor.
        if ($recipients->isEmpty() && $this->userHasAnyRole($actor, ['admin'])) {
            return collect([$actor]);
        }

        return $recipients;
    }

    protected function userHasAnyRole(User $user, array $roles): bool
    {
        $rolesLower = array_map(fn ($r) => mb_strtolower((string) $r), $roles);

        return $user->roles()
            ->whereIn(DB::raw('LOWER(name)'), $rolesLower)
            ->exists();
    }

    protected function actorRole(?User $actor): string
    {
        if (! $actor) return 'guest';

        if ($this->userHasAnyRole($actor, ['admin'])) return 'admin';
        if ($this->userHasAnyRole($actor, ['manager'])) return 'manager';
        if ($this->userHasAnyRole($actor, ['staff'])) return 'staff';

        return 'client';
    }

    /* ============================================================
     | Safe route helper (prevents "Route not defined" crashes)
     * ============================================================ */

    /**
     * ✅ Prevents user create/update from failing if a route name differs (ex: admin.users.index).
     */
    protected function safeRouteAny(array $names, string $fallback = '/', array $params = []): string
    {
        try {
            foreach ($names as $name) {
                if (is_string($name) && $name !== '' && Route::has($name)) {
                    return route($name, $params);
                }
            }
        } catch (\Throwable $e) {
            // ignore and fallback
        }

        return $fallback;
    }

    /* ============================================================
     | Booking owner
     * ============================================================ */

    protected function clientRecipientForBooking(Booking $booking): ?User
    {
        if (empty($booking->client_email)) return null;
        return User::where('email', $booking->client_email)->first();
    }

    protected function bookingOwner(Booking $booking): ?User
    {
        if (isset($booking->user_id) && $booking->user_id) {
            $u = User::find($booking->user_id);
            if ($u) return $u;
        }

        return $this->clientRecipientForBooking($booking);
    }

    /* ============================================================
     | Formatting helpers
     * ============================================================ */

    protected function formatBookingDate(?\DateTimeInterface $dt): string
    {
        return $dt ? $dt->format('M d, Y h:ia') : 'N/A';
    }

    protected function bookingLabel(Booking $booking): string
    {
        return $booking->company_name ?: $booking->client_name ?: ($booking->client_email ?: 'Client');
    }

    protected function humanField(string $field): string
    {
        return ucwords(str_replace('_', ' ', $field));
    }

    protected function stringify($value): string
    {
        if ($value === null) return '—';
        if (is_bool($value)) return $value ? 'Yes' : 'No';

        if ($value instanceof \DateTimeInterface) {
            return $this->formatBookingDate($value);
        }

        if (is_array($value) || is_object($value)) {
            return 'Updated';
        }

        $s = trim((string) $value);
        if ($s === '') return '—';

        return mb_strlen($s) > 90 ? (mb_substr($s, 0, 87) . '...') : $s;
    }

    /**
     * Always include: By + Email + Date/Time
     */
    protected function meta(?User $actor, string $fallbackName = 'System', string $fallbackEmail = '—'): string
    {
        $name  = $actor?->name  ?: $fallbackName;
        $email = $actor?->email ?: $fallbackEmail;

        $at = now()->format('M d, Y h:ia');

        $email = trim((string) $email);
        if ($email !== '' && $email !== '—') {
            return sprintf('By %s (%s) • %s.', $name, $email, $at);
        }

        return sprintf('By %s • %s.', $name, $at);
    }

    protected function metaForBooking(Booking $booking, ?User $actor): string
    {
        return $this->meta(
            $actor,
            $this->bookingLabel($booking),
            $booking->client_email ?: '—'
        );
    }

    protected function summarizeChanges(array $changes): string
    {
        $parts = [];

        foreach ($changes as $field => $pair) {
            if ($field === 'updated_at') continue;
            if (! is_array($pair) || count($pair) !== 2) continue;

            [$old, $new] = $pair;

            if ($field === 'items') {
                $parts[] = 'Items updated.';
                continue;
            }

            if ($field === 'booking_status') {
                $parts[] = sprintf(
                    'Status: %s → %s.',
                    ucfirst((string) ($old ?? '—')),
                    ucfirst((string) ($new ?? '—'))
                );
                continue;
            }

            $parts[] = sprintf(
                '%s: %s → %s.',
                $this->humanField($field),
                $this->stringify($old),
                $this->stringify($new)
            );
        }

        return trim(implode(' ', $parts));
    }

    /* ============================================================
     | Notify helpers
     * ============================================================ */

    protected function notifyMany(iterable $recipients, string $type, string $title, ?string $message = null, ?string $link = null): void
    {
        collect($recipients)
            ->filter(fn ($r) => $r instanceof User)
            ->unique('id')
            ->each(function (User $recipient) use ($type, $title, $message, $link) {
                $this->createNotification($recipient, $type, $title, $message, $link);
            });
    }

    /**
     * Tiny dedupe window to prevent double-fire (model events + controller).
     * Keep small so we don’t lose real repeated actions.
     */
    protected function createNotification(User $recipient, string $type, string $title, ?string $message = null, ?string $link = null)
    {
        $exists = $recipient->notifications()
            ->where('type', $type)
            ->where('title', $title)
            ->when($link, fn ($q) => $q->where('link', $link), fn ($q) => $q->whereNull('link'))
            ->where('created_at', '>=', now()->subSeconds(2))
            ->exists();

        if ($exists) return null;

        return $recipient->notifications()->create([
            'type'    => $type,
            'title'   => $title,
            'message' => $message,
            'link'    => $link,
        ]);
    }

    /* ============================================================
     | BOOKING: CREATED / UPDATED / DELETED (ROLE BASED)
     * ============================================================ */

    public function bookingCreated(Booking $booking, ?User $actor = null): void
    {
        $link  = route('bookings.show', $booking);
        $role  = $this->actorRole($actor);
        $owner = $this->bookingOwner($booking);

        $meta  = $this->metaForBooking($booking, $actor);
        $event = $booking->type_of_event ?: 'Event';
        $when  = $this->formatBookingDate($booking->booking_date_from);
        $label = $this->bookingLabel($booking);

        // Client/guest created -> notify Admin + Manager
        if (in_array($role, ['client', 'guest'], true)) {
            $recipients = $this->adminRecipients(null)
                ->merge($this->managerRecipients(null))
                ->unique('id')
                ->values();

            $title = 'New booking request';
            $message = sprintf(
                '%s New booking request (#%d, %s) scheduled on %s. Client: %s.',
                $meta,
                $booking->id,
                $event,
                $when,
                $label
            );

            $this->notifyMany($recipients, 'booking_created', $title, $message, $link);
            return;
        }

        // Staff/manager/admin created -> notify booking owner + admins/managers audit
        $actorMeta = $this->meta($actor);
        $actorName = $actor?->name ?? 'Staff';

        if ($owner && (! $actor || $owner->id !== $actor->id)) {
            $this->createNotification(
                $owner,
                'booking_created',
                'Booking created for you',
                sprintf('%s Booking #%d (%s) was created for you, scheduled on %s.', $actorMeta, $booking->id, $event, $when),
                $link
            );
        }

        // Audit routing
        $auditRecipients = match ($role) {
            'manager' => $this->adminRecipients(null),                               // manager -> admins
            'staff'   => $this->adminRecipients(null)->merge($this->managerRecipients(null)), // staff -> admins + managers
            'admin'   => $this->adminRecipients($actor)->merge($this->managerRecipients(null)), // admin -> other admins + managers
            default   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
        };

        $this->notifyMany(
            $auditRecipients->unique('id')->values(),
            'booking_created',
            'Booking created by ' . $actorName,
            sprintf('%s Booking #%d (%s) for %s scheduled on %s.', $actorMeta, $booking->id, $event, $label, $when),
            $link
        );
    }

    public function bookingUpdated(Booking $booking, ?User $actor, array $changes): void
    {
        unset($changes['updated_at']);
        if (empty($changes)) return;

        $link  = route('bookings.show', $booking);
        $role  = $this->actorRole($actor);
        $owner = $this->bookingOwner($booking);

        $meta   = $this->metaForBooking($booking, $actor);
        $label  = $this->bookingLabel($booking);
        $event  = $booking->type_of_event ?: 'Event';
        $ref    = sprintf('Booking #%d (%s) for %s', $booking->id, $event, $label);

        $summary = $this->summarizeChanges($changes);
        $hasStatus = isset($changes['booking_status']);
        $hasOther  = count($changes) > ($hasStatus ? 1 : 0);

        // If ONLY status changed -> send booking_status_changed instead of booking_updated
        if ($hasStatus && ! $hasOther) {
            $old = $changes['booking_status'][0] ?? null;
            $new = $changes['booking_status'][1] ?? null;

            $title = sprintf('%s status changed', $ref);
            $message = sprintf(
                '%s %s. Status: %s → %s.',
                $meta,
                $ref,
                ucfirst((string) ($old ?? '—')),
                ucfirst((string) ($new ?? '—'))
            );

            // Who gets status-only notifications?
            if (in_array($role, ['client', 'guest'], true)) {
                // client/guest -> admins + managers
                $recipients = $this->adminRecipients(null)
                    ->merge($this->managerRecipients(null))
                    ->unique('id')
                    ->values();

                $this->notifyMany($recipients, 'booking_status_changed', $title, $message, $link);
            } else {
                // staff/manager/admin -> owner + admins/managers depending
                if ($owner && (! $actor || $owner->id !== $actor->id)) {
                    $this->createNotification($owner, 'booking_status_changed', $title, $message, $link);
                }

                $auditRecipients = match ($role) {
                    'manager' => $this->adminRecipients(null),
                    'staff'   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
                    'admin'   => $this->adminRecipients($actor)->merge($this->managerRecipients(null)),
                    default   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
                };

                $this->notifyMany(
                    $auditRecipients->unique('id')->values(),
                    'booking_status_changed',
                    $title,
                    $message,
                    $link
                );
            }

            return;
        }

        // Otherwise -> send booking_updated notifications
        $baseMessage = sprintf(
            '%s %s was updated.%s',
            $meta,
            $ref,
            $summary ? (' ' . $summary) : ''
        );

        // Client edits -> admins + managers
        if (in_array($role, ['client', 'guest'], true)) {
            $recipients = $this->adminRecipients(null)
                ->merge($this->managerRecipients(null))
                ->unique('id')
                ->values();

            $this->notifyMany(
                $recipients,
                'booking_updated',
                'Booking updated by client',
                $baseMessage,
                $link
            );

            return;
        }

        // Staff/manager/admin edits -> owner gets notified
        if ($owner && (! $actor || $owner->id !== $actor->id)) {
            $this->createNotification(
                $owner,
                'booking_updated',
                'Your booking was updated',
                $baseMessage,
                $link
            );
        }

        $actorName = $actor?->name ?? 'Staff';

        // Audit routing by role
        $auditRecipients = match ($role) {
            'manager' => $this->adminRecipients(null),
            'staff'   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
            'admin'   => $this->adminRecipients($actor)->merge($this->managerRecipients(null)),
            default   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
        };

        $this->notifyMany(
            $auditRecipients->unique('id')->values(),
            'booking_updated',
            'Booking updated by ' . $actorName,
            $baseMessage,
            $link
        );
    }

    public function bookingDeleted(Booking $booking, ?User $actor = null): void
    {
        $link  = route('bookings.index');
        $role  = $this->actorRole($actor);
        $owner = $this->bookingOwner($booking);

        $meta  = $this->metaForBooking($booking, $actor);
        $event = $booking->type_of_event ?: 'Event';
        $when  = $this->formatBookingDate($booking->booking_date_from);
        $label = $this->bookingLabel($booking);

        $ref = sprintf('Booking #%d (%s) for %s', $booking->id, $event, $label);

        $message = sprintf('%s %s was deleted (scheduled on %s).', $meta, $ref, $when);

        // Client/guest deletes -> admins + managers
        if (in_array($role, ['client', 'guest'], true)) {
            $recipients = $this->adminRecipients(null)
                ->merge($this->managerRecipients(null))
                ->unique('id')
                ->values();

            $this->notifyMany($recipients, 'booking_deleted', 'Booking deleted by client', $message, $link);
            return;
        }

        // Staff/manager/admin deletes -> owner + audit
        if ($owner && (! $actor || $owner->id !== $actor->id)) {
            $this->createNotification($owner, 'booking_deleted', 'Your booking was deleted', $message, $link);
        }

        $actorName = $actor?->name ?? 'Staff';

        $auditRecipients = match ($role) {
            'manager' => $this->adminRecipients(null),
            'staff'   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
            'admin'   => $this->adminRecipients($actor)->merge($this->managerRecipients(null)),
            default   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
        };

        $this->notifyMany(
            $auditRecipients->unique('id')->values(),
            'booking_deleted',
            'Booking deleted by ' . $actorName,
            $message,
            $link
        );
    }

    /* ============================================================
     | PAYMENTS (ROLE BASED + META)
     * ============================================================ */

    public function paymentCreated(BookingPayment $payment, Booking $booking, ?User $actor = null): void
    {
        $link  = route('bookings.show', $booking) . '#payments';
        $role  = $this->actorRole($actor);
        $owner = $this->bookingOwner($booking);

        $meta  = $this->metaForBooking($booking, $actor);
        $label = $this->bookingLabel($booking);

        $message = sprintf(
            '%s Payment added on booking #%d (%s): %0.2f via %s.',
            $meta,
            $booking->id,
            $label,
            $payment->amount,
            $payment->payment_method ?: 'payment'
        );

        // client/guest -> admins + managers
        if (in_array($role, ['client', 'guest'], true)) {
            $recipients = $this->adminRecipients(null)
                ->merge($this->managerRecipients(null))
                ->unique('id')
                ->values();

            $this->notifyMany($recipients, 'payment_created', 'New payment recorded', $message, $link);
            return;
        }

        // staff/manager/admin -> owner + audit
        if ($owner && (! $actor || $owner->id !== $actor->id)) {
            $this->createNotification($owner, 'payment_created', 'Payment recorded on your booking', $message, $link);
        }

        $auditRecipients = match ($role) {
            'manager' => $this->adminRecipients(null),
            'staff'   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
            'admin'   => $this->adminRecipients($actor)->merge($this->managerRecipients(null)),
            default   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
        };

        $this->notifyMany(
            $auditRecipients->unique('id')->values(),
            'payment_created',
            'Payment recorded',
            $message,
            $link
        );
    }

    public function paymentUpdated(BookingPayment $payment, Booking $booking, ?User $actor, array $changes): void
    {
        unset($changes['updated_at']);
        if (empty($changes)) return;

        $link  = route('bookings.show', $booking) . '#payments';
        $role  = $this->actorRole($actor);
        $owner = $this->bookingOwner($booking);

        $meta  = $this->metaForBooking($booking, $actor);
        $label = $this->bookingLabel($booking);

        $parts = [];
        foreach ($changes as $field => $pair) {
            if (! is_array($pair) || count($pair) !== 2) continue;
            [$old, $new] = $pair;

            if ($field === 'status') {
                $parts[] = sprintf(
                    'Status: %s → %s.',
                    ucfirst((string) ($old ?? '—')),
                    ucfirst((string) ($new ?? '—'))
                );
            } else {
                $parts[] = sprintf(
                    '%s: %s → %s.',
                    $this->humanField($field),
                    $this->stringify($old),
                    $this->stringify($new)
                );
            }
        }

        $summary = trim(implode(' ', $parts));

        $message = sprintf(
            '%s Payment updated on booking #%d (%s). %s',
            $meta,
            $booking->id,
            $label,
            $summary
        );

        // client -> admins + managers
        if (in_array($role, ['client', 'guest'], true)) {
            $recipients = $this->adminRecipients(null)
                ->merge($this->managerRecipients(null))
                ->unique('id')
                ->values();

            $this->notifyMany($recipients, 'payment_updated', 'Payment updated by client', $message, $link);
            return;
        }

        // staff/manager/admin -> owner + audit
        if ($owner && (! $actor || $owner->id !== $actor->id)) {
            $this->createNotification($owner, 'payment_updated', 'Payment on your booking was updated', $message, $link);
        }

        $auditRecipients = match ($role) {
            'manager' => $this->adminRecipients(null),
            'staff'   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
            'admin'   => $this->adminRecipients($actor)->merge($this->managerRecipients(null)),
            default   => $this->adminRecipients(null)->merge($this->managerRecipients(null)),
        };

        $this->notifyMany(
            $auditRecipients->unique('id')->values(),
            'payment_updated',
            'Payment updated',
            $message,
            $link
        );
    }

    /* ============================================================
     | SERVICES / SERVICE TYPES / CALENDAR BLOCKS (meta-upgraded)
     * ============================================================ */

    public function serviceCreated(Service $service, User $actor): void
    {
        $meta = $this->meta($actor);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'service_created',
            'Service created',
            sprintf('%s Service "%s" (ID %d) was created.', $meta, $service->name, $service->id),
            $this->safeRouteAny(['services.index'], '/services')
        );
    }

    public function serviceUpdated(Service $service, User $actor, array $changes): void
    {
        if (empty($changes)) return;

        $meta = $this->meta($actor);
        $summary = $this->summarizeChanges($changes);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'service_updated',
            'Service updated',
            sprintf('%s Service "%s" (ID %d) was updated.%s', $meta, $service->name, $service->id, $summary ? (' ' . $summary) : ''),
            $this->safeRouteAny(['services.index'], '/services')
        );
    }

    public function serviceDeleted(Service $service, User $actor): void
    {
        $meta = $this->meta($actor);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'service_deleted',
            'Service deleted',
            sprintf('%s Service "%s" (ID %d) was deleted.', $meta, $service->name, $service->id),
            $this->safeRouteAny(['services.index'], '/services')
        );
    }

    public function serviceTypeCreated(ServiceType $serviceType, User $actor): void
    {
        $meta = $this->meta($actor);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'service_type_created',
            'Service type created',
            sprintf('%s Service type "%s" (ID %d) was created.', $meta, $serviceType->name, $serviceType->id),
            $this->safeRouteAny(['service-types.index', 'service_types.index'], '/service-types')
        );
    }

    public function serviceTypeUpdated(ServiceType $serviceType, User $actor, array $changes): void
    {
        if (empty($changes)) return;

        $meta = $this->meta($actor);
        $summary = $this->summarizeChanges($changes);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'service_type_updated',
            'Service type updated',
            sprintf('%s Service type "%s" (ID %d) was updated.%s', $meta, $serviceType->name, $serviceType->id, $summary ? (' ' . $summary) : ''),
            $this->safeRouteAny(['service-types.index', 'service_types.index'], '/service-types')
        );
    }

    public function serviceTypeDeleted(ServiceType $serviceType, User $actor): void
    {
        $meta = $this->meta($actor);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'service_type_deleted',
            'Service type deleted',
            sprintf('%s Service type "%s" (ID %d) was deleted.', $meta, $serviceType->name, $serviceType->id),
            $this->safeRouteAny(['service-types.index', 'service_types.index'], '/service-types')
        );
    }

    public function calendarBlockCreated(CalendarBlock $block, User $actor): void
    {
        $meta = $this->meta($actor);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'calendar_block_created',
            'Calendar block created',
            sprintf('%s Calendar block "%s" was created.', $meta, $block->title),
            $this->safeRouteAny(['dashboard'], '/dashboard')
        );
    }

    public function calendarBlockDeleted(CalendarBlock $block, User $actor): void
    {
        $meta = $this->meta($actor);

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'calendar_block_deleted',
            'Calendar block deleted',
            sprintf('%s Calendar block "%s" was deleted.', $meta, $block->title),
            $this->safeRouteAny(['dashboard'], '/dashboard')
        );
    }
        public function bookingLifecycleMaintenanceReport(array $summary): void
{
    $changed = (int) ($summary['changed_count'] ?? 0);
    $deleted = (int) ($summary['deleted_count'] ?? 0);

    if ($changed < 1 && $deleted < 1) {
        return;
    }

    $title = 'Booking lifecycle maintenance completed';

    $parts = [];

    if ($changed > 0) {
        $parts[] = sprintf(
            '%d booking%s had automatic status updates.',
            $changed,
            $changed === 1 ? '' : 's'
        );
    }

    if ($deleted > 0) {
        $parts[] = sprintf(
            '%d declined/cancelled booking%s were automatically deleted after the cleanup window.',
            $deleted,
            $deleted === 1 ? '' : 's'
        );
    }

    $syncPreview = collect($summary['synced'] ?? [])
        ->take(3)
        ->map(function (array $item) {
            return sprintf(
                '#%d %s: %s → %s',
                (int) ($item['booking_id'] ?? 0),
                (string) ($item['title'] ?? 'Booking'),
                ucfirst((string) ($item['from_status'] ?? '—')),
                ucfirst((string) ($item['to_status'] ?? '—')),
            );
        })
        ->implode('; ');

    $deletePreview = collect($summary['deleted'] ?? [])
        ->take(3)
        ->map(function (array $item) {
            return sprintf(
                '#%d %s (%s)',
                (int) ($item['booking_id'] ?? 0),
                (string) ($item['title'] ?? 'Booking'),
                ucfirst((string) ($item['status'] ?? '—')),
            );
        })
        ->implode('; ');

    $message = trim(implode(' ', $parts));

    if ($syncPreview !== '') {
        $message .= ' Updated: ' . $syncPreview . '.';
    }

    if ($deletePreview !== '') {
        $message .= ' Deleted: ' . $deletePreview . '.';
    }

    $recipients = $this->adminRecipients(null)
        ->merge($this->managerRecipients(null))
        ->unique('id')
        ->values();

    $this->notifyMany(
        $recipients,
        'booking_lifecycle_maintenance',
        $title,
        $message,
        $this->safeRouteAny(['bookings.index', 'dashboard'], '/dashboard')
    );
}


    /* ============================================================
     | ✅ USERS / ROLES (FIXED)
     * ============================================================ */

    /**
     * Safely read a user's roles. Works even if roles are not yet loaded.
     * You can also pass $assignedRoles from your controller after syncRoles().
     */
    protected function userRoleNames(User $user, ?array $assignedRoles = null): array
    {
        if (is_array($assignedRoles)) {
            return array_values(array_filter(array_map(
                fn ($r) => is_string($r) ? trim($r) : (is_object($r) && isset($r->name) ? trim((string) $r->name) : ''),
                $assignedRoles
            ), fn ($r) => $r !== ''));
        }

        try {
            return $user->roles()->pluck('name')->map(fn ($x) => (string) $x)->values()->all();
        } catch (\Throwable $e) {
            return [];
        }
    }

    /**
     * ✅ FIX:
     * - does NOT crash if routes differ (safeRouteAny)
     * - admin gets notified even if they are the only admin (adminAuditRecipients)
     * - includes roles in the message (when available)
     */
    public function userCreated(User $user, ?User $actor = null, ?array $assignedRoles = null): void
    {
        $meta = $this->meta($actor);
        $roles = $this->userRoleNames($user, $assignedRoles);
        $rolesStr = $roles ? implode(', ', $roles) : '—';

        // ✅ Make link safe (prevents "Route [users.index] not defined" breaking user creation)
        $link = $this->safeRouteAny(
            ['users.index', 'admin.users.index', 'users.list', 'admin.users.list'],
            '/users'
        );

        $title = 'User created';
        $message = sprintf(
            '%s Created user %s (%s). Roles: %s.',
            $meta,
            (string) ($user->name ?? '—'),
            (string) ($user->email ?? '—'),
            $rolesStr
        );

        // ✅ Audit to admins (exclude actor if possible; include actor if they are the only admin)
        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'user_created',
            $title,
            $message,
            $link
        );

        /**
         * Optional (safe and useful):
         * Notify the new user (they’ll see it after login).
         * Comment out if you don’t want it.
         */
        if ($user->id && (! $actor || (int) $user->id !== (int) $actor->id)) {
            $this->createNotification(
                $user,
                'user_created',
                'Welcome to the system',
                sprintf('%s Your account was created. Roles: %s.', $meta, $rolesStr),
                $this->safeRouteAny(['dashboard'], '/dashboard')
            );
        }
    }

    public function userUpdated(User $user, ?User $actor = null, array $changes = []): void
    {
        unset($changes['updated_at'], $changes['remember_token'], $changes['password']);
        if (empty($changes)) return;

        $meta = $this->meta($actor);
        $summary = $this->summarizeChanges($changes);

        $link = $this->safeRouteAny(
            ['users.index', 'admin.users.index', 'users.list', 'admin.users.list'],
            '/users'
        );

        $title = 'User updated';
        $message = sprintf(
            '%s Updated user %s (%s). %s',
            $meta,
            (string) ($user->name ?? '—'),
            (string) ($user->email ?? '—'),
            $summary ?: 'Details updated.'
        );

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'user_updated',
            $title,
            $message,
            $link
        );
    }

    public function userDeleted(User $user, ?User $actor = null): void
    {
        $meta = $this->meta($actor);

        $link = $this->safeRouteAny(
            ['users.index', 'admin.users.index', 'users.list', 'admin.users.list'],
            '/users'
        );

        $title = 'User deleted';
        $message = sprintf(
            '%s Deleted user %s (%s).',
            $meta,
            (string) ($user->name ?? '—'),
            (string) ($user->email ?? '—')
        );

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'user_deleted',
            $title,
            $message,
            $link
        );
    }

    public function userRolesUpdated(User $target, ?User $actor = null, array $oldRoles = [], array $newRoles = []): void
    {
        $meta = $this->meta($actor);

        $oldStr = implode(', ', array_values(array_filter(array_map('strval', $oldRoles))));
        $newStr = implode(', ', array_values(array_filter(array_map('strval', $newRoles))));

        $link = $this->safeRouteAny(
            ['users.roles.index', 'admin.users.roles.index', 'users.index', 'admin.users.index'],
            '/users'
        );

        $title = 'User roles updated';
        $message = sprintf(
            '%s Updated roles for %s (%s): [%s] → [%s].',
            $meta,
            (string) ($target->name ?? '—'),
            (string) ($target->email ?? '—'),
            $oldStr !== '' ? $oldStr : '—',
            $newStr !== '' ? $newStr : '—'
        );

        $this->notifyMany(
            $this->adminAuditRecipients($actor),
            'user_roles_updated',
            $title,
            $message,
            $link
        );

        // Optional: notify the target user too
        if ($target->id && (! $actor || (int) $target->id !== (int) $actor->id)) {
            $this->createNotification(
                $target,
                'user_roles_updated',
                'Your roles were updated',
                $message,
                $this->safeRouteAny(['dashboard'], '/dashboard')
            );
        }
    }
}
