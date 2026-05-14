<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CalendarBlock;
use App\Models\PublicEvent;
use App\Services\BookingService;
use App\Support\WorkspaceAccess;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class WorkspaceHomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        return $this->index($request);
    }

    public function index(Request $request): Response
    {
        $role = $this->resolveWorkspaceRole($request);

        $this->syncBookingLifecycle();

        return Inertia::render($this->resolvePage($role), [
            'workspaceRole' => $role,
            'workspaceStats' => $this->workspaceStats($request, $role),
            'recentBookings' => $this->recentBookings($request, $role),
            'todaySchedule' => $this->todaySchedule($request, $role),
            'workspaceSummary' => $this->workspaceSummary($role),
        ]);
    }

    private function resolveWorkspaceRole(Request $request): string
    {
        $routeName = (string) optional($request->route())->getName();

        if (str_starts_with($routeName, 'admin.')) {
            return 'admin';
        }

        if (str_starts_with($routeName, 'manager.')) {
            return 'manager';
        }

        if (str_starts_with($routeName, 'staff.')) {
            return 'staff';
        }

        if (str_starts_with($routeName, 'user.')) {
            return 'user';
        }

        $path = '/' . ltrim($request->path(), '/');

        if (str_starts_with($path, '/admin/')) {
            return 'admin';
        }

        if (str_starts_with($path, '/manager/')) {
            return 'manager';
        }

        if (str_starts_with($path, '/staff/')) {
            return 'staff';
        }

        if (in_array($path, ['/book', '/my-dashboard', '/my-bookings', '/my-calendar'], true) || str_starts_with($path, '/my-bookings/')) {
            return 'user';
        }

        $user = $request->user();

        if ($user && method_exists($user, 'hasRole')) {
            if ($user->hasRole('admin')) {
                return 'admin';
            }

            if ($user->hasRole('manager')) {
                return 'manager';
            }

            if ($user->hasRole('staff')) {
                return 'staff';
            }
        }

        return 'user';
    }

    private function resolvePage(string $role): string
    {
        return match ($role) {
            'admin' => 'admin/dashboard',
            'manager' => 'manager/dashboard',
            'staff' => 'staff/dashboard',
            default => 'user/dashboard',
        };
    }

    private function workspaceSummary(string $role): array
    {
        return match ($role) {
            'admin' => [
                'eyebrow' => 'Executive Control Center',
                'title' => 'Administrator Dashboard',
                'description' => 'Full authority workspace for public website content, bookings, users, reports, venue setup, and operational monitoring.',
            ],
            'manager' => [
                'eyebrow' => 'Review and Approval Workspace',
                'title' => 'Manager Dashboard',
                'description' => 'Focused workspace for reviewing bookings, payment compliance, MICE reporting, inquiries, and calendar activities.',
            ],
            'staff' => [
                'eyebrow' => 'Daily Operations Desk',
                'title' => 'Staff Dashboard',
                'description' => 'Fast operational workspace for assisted bookings, schedule checking, handling inquiries, and supporting clients.',
            ],
            default => [
                'eyebrow' => 'Client Booking Portal',
                'title' => 'My Booking Dashboard',
                'description' => 'Private client workspace for creating event requests, tracking your submitted bookings, and checking your own schedule references.',
            ],
        };
    }

    private function syncBookingLifecycle(): void
    {
        try {
            /** @var BookingService $bookingService */
            $bookingService = app(BookingService::class);

            if (method_exists($bookingService, 'syncLifecycleStatuses')) {
                $bookingService->syncLifecycleStatuses();
            }
        } catch (Throwable) {
            // Keep dashboards usable even if lifecycle syncing has an issue.
        }
    }

    private function workspaceStats(Request $request, string $role): array
    {
        $statusCounts = $this->statusCounts($request, $role);
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();
        $endOfMonth = Carbon::now()->endOfMonth();
        $bookingQuery = $this->bookingQuery($request, $role);

        return [
            'pending' => (int) ($statusCounts['pending'] ?? 0),
            'confirmed' => (int) ($statusCounts['confirmed'] ?? 0),
            'active' => (int) ($statusCounts['active'] ?? 0),
            'completed' => (int) ($statusCounts['completed'] ?? 0),
            'cancelled' => (int) ($statusCounts['cancelled'] ?? 0),
            'declined' => (int) ($statusCounts['declined'] ?? 0),
            'total_bookings' => $this->safeCount(fn () => (clone $bookingQuery)->count()),
            'today_bookings' => $this->safeCount(fn () => (clone $bookingQuery)
                ->whereDate('booking_date_from', '<=', $today)
                ->whereDate('booking_date_to', '>=', $today)
                ->count()),
            'month_bookings' => $this->safeCount(fn () => (clone $bookingQuery)
                ->whereDate('booking_date_to', '>=', $startOfMonth)
                ->whereDate('booking_date_from', '<=', $endOfMonth)
                ->count()),
            'month_blocks' => $this->safeCount(fn () => CalendarBlock::query()
                ->whereDate('date_to', '>=', $startOfMonth)
                ->whereDate('date_from', '<=', $endOfMonth)
                ->count()),
            'month_public_events' => $this->safeCount(fn () => PublicEvent::query()
                ->whereDate('event_date', '>=', $startOfMonth)
                ->whereDate('event_date', '<=', $endOfMonth)
                ->count()),
        ];
    }

    private function statusCounts(Request $request, string $role): array
    {
        $default = [
            'pending' => 0,
            'confirmed' => 0,
            'active' => 0,
            'completed' => 0,
            'cancelled' => 0,
            'declined' => 0,
        ];

        if (! Schema::hasTable('bookings') || ! Schema::hasColumn('bookings', 'booking_status')) {
            return $default;
        }

        try {
            $counts = (clone $this->bookingQuery($request, $role))
                ->selectRaw('booking_status, COUNT(*) as aggregate')
                ->groupBy('booking_status')
                ->pluck('aggregate', 'booking_status')
                ->mapWithKeys(fn ($value, $key) => [strtolower((string) $key) => (int) $value])
                ->all();

            return array_merge($default, [
                'pending' => $this->sumStatuses($counts, ['pending', 'pencil_booked', 'for_review', 'submitted']),
                'confirmed' => $this->sumStatuses($counts, ['confirmed', 'approved']),
                'active' => $this->sumStatuses($counts, ['active']),
                'completed' => $this->sumStatuses($counts, ['completed']),
                'cancelled' => $this->sumStatuses($counts, ['cancelled', 'canceled']),
                'declined' => $this->sumStatuses($counts, ['declined', 'rejected', 'expired']),
            ]);
        } catch (Throwable) {
            return $default;
        }
    }

    /**
     * @param array<string, int> $counts
     * @param array<int, string> $statuses
     */
    private function sumStatuses(array $counts, array $statuses): int
    {
        return array_sum(array_map(
            fn (string $status) => (int) ($counts[$status] ?? 0),
            $statuses,
        ));
    }

    private function bookingQuery(Request $request, string $role): Builder
    {
        $query = Booking::query();

        if ($role === 'user') {
            WorkspaceAccess::applyBookingVisibility($request, $query);
        }

        return $query;
    }

    private function recentBookings(Request $request, string $role): array
    {
        try {
            $query = $this->bookingQuery($request, $role)
                ->orderByDesc(Schema::hasColumn('bookings', 'created_at') ? 'created_at' : 'id')
                ->limit(8);

            $columns = $this->bookingColumns([
                'id',
                'client_name',
                'company_name',
                'type_of_event',
                'booking_status',
                'payment_status',
                'booking_date_from',
                'booking_date_to',
            ]);

            return $query
                ->get($columns)
                ->map(fn (Booking $booking) => [
                    'id' => $booking->id,
                    'client_name' => (string) ($booking->client_name ?? ''),
                    'company_name' => (string) ($booking->company_name ?? ''),
                    'type_of_event' => (string) ($booking->type_of_event ?? ''),
                    'booking_status' => (string) ($booking->booking_status ?? 'pending'),
                    'payment_status' => (string) ($booking->payment_status ?? ''),
                    'booking_date_from' => $this->formatDateTime($booking->booking_date_from),
                    'booking_date_to' => $this->formatDateTime($booking->booking_date_to),
                ])
                ->values()
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    private function todaySchedule(Request $request, string $role): array
    {
        try {
            $today = Carbon::today();

            return $this->bookingQuery($request, $role)
                ->whereDate('booking_date_from', '<=', $today)
                ->whereDate('booking_date_to', '>=', $today)
                ->orderBy('booking_date_from')
                ->limit(8)
                ->get($this->bookingColumns([
                    'id',
                    'client_name',
                    'company_name',
                    'type_of_event',
                    'booking_status',
                    'booking_date_from',
                    'booking_date_to',
                ]))
                ->map(fn (Booking $booking) => [
                    'id' => $booking->id,
                    'title' => trim(($booking->type_of_event ?: 'Booking') . ' - ' . ($booking->company_name ?: $booking->client_name ?: 'Client')),
                    'status' => (string) ($booking->booking_status ?? 'pending'),
                    'time' => $this->formatTimeRange($booking->booking_date_from, $booking->booking_date_to),
                ])
                ->values()
                ->all();
        } catch (Throwable) {
            return [];
        }
    }

    /**
     * @param array<int, string> $columns
     * @return array<int, string>
     */
    private function bookingColumns(array $columns): array
    {
        return array_values(array_filter(
            $columns,
            fn (string $column) => $column === 'id' || Schema::hasColumn('bookings', $column),
        ));
    }

    private function formatDateTime(mixed $value): string
    {
        if ($value instanceof Carbon) {
            return $value->format('M d, Y h:i A');
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value)->format('M d, Y h:i A');
        }

        if ($value === null || $value === '') {
            return '';
        }

        try {
            return Carbon::parse($value)->format('M d, Y h:i A');
        } catch (Throwable) {
            return (string) $value;
        }
    }

    private function formatTimeRange(mixed $from, mixed $to): string
    {
        $start = $this->formatTime($from);
        $end = $this->formatTime($to);

        if ($start === '' && $end === '') {
            return 'No time set';
        }

        return trim($start . ' - ' . $end, ' -');
    }

    private function formatTime(mixed $value): string
    {
        if ($value instanceof Carbon) {
            return $value->format('h:i A');
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value)->format('h:i A');
        }

        if ($value === null || $value === '') {
            return '';
        }

        try {
            return Carbon::parse($value)->format('h:i A');
        } catch (Throwable) {
            return '';
        }
    }

    private function safeCount(callable $callback): int
    {
        try {
            return (int) $callback();
        } catch (Throwable) {
            return 0;
        }
    }
}
