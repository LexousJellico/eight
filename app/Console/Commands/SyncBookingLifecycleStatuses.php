<?php

namespace App\Console\Commands;

use App\Services\BookingService;
use App\Services\NotificationService;
use Illuminate\Console\Command;

class SyncBookingLifecycleStatuses extends Command
{
    protected $signature = 'bookings:sync-lifecycle';

    protected $description = 'Sync booking statuses and clean up stale declined/cancelled bookings';

    public function handle(BookingService $bookings, NotificationService $notifications): int
    {
        $summary = $bookings->runAutomatedLifecycleMaintenance();

        $changed = (int) ($summary['changed_count'] ?? 0);
        $deleted = (int) ($summary['deleted_count'] ?? 0);

        if ($changed > 0 || $deleted > 0) {
            $notifications->bookingLifecycleMaintenanceReport($summary);
        }

        $this->info(sprintf(
            'Booking lifecycle maintenance complete. %d status update(s), %d auto-delete(s).',
            $changed,
            $deleted,
        ));

        return self::SUCCESS;
    }
}
