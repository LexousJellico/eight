<?php

namespace App\Support;

use Carbon\Carbon;
use InvalidArgumentException;

final class BookingScheduleCatalog
{
    public const ROLE_EVENT = 'event';
    public const ROLE_INGRESS = 'ingress';
    public const ROLE_EGRESS = 'egress';

    public const BLOCK_AM = 'am';
    public const BLOCK_PM = 'pm';
    public const BLOCK_WHOLE_DAY = 'whole_day';

    public static function baseBlocks(): array
    {
        return [
            self::BLOCK_AM => [
                'value' => self::BLOCK_AM,
                'label' => 'Half Day - AM',
                'description' => '6:00 AM to 12:00 NN',
                'starts_at' => '06:00',
                'ends_at' => '12:00',
                'allows_additional_hours' => false,
            ],
            self::BLOCK_PM => [
                'value' => self::BLOCK_PM,
                'label' => 'Half Day - PM',
                'description' => '12:00 NN to 6:00 PM',
                'starts_at' => '12:00',
                'ends_at' => '18:00',
                'allows_additional_hours' => true,
            ],
            self::BLOCK_WHOLE_DAY => [
                'value' => self::BLOCK_WHOLE_DAY,
                'label' => 'Whole Day',
                'description' => '6:00 AM to 6:00 PM',
                'starts_at' => '06:00',
                'ends_at' => '18:00',
                'allows_additional_hours' => true,
            ],
        ];
    }

    public static function segmentRoles(): array
    {
        return [
            self::ROLE_EVENT => 'Event proper',
            self::ROLE_INGRESS => 'Ingress / Setup / Preparation',
            self::ROLE_EGRESS => 'Egress / Pack-out',
        ];
    }

    public static function additionalHourOptions(): array
    {
        return collect(range(0, 5))
            ->map(fn (int $hours) => [
                'value' => $hours,
                'label' => $hours === 0 ? 'No additional hours' : $hours . ' additional hour' . ($hours === 1 ? '' : 's'),
            ])
            ->values()
            ->all();
    }

    public static function normalizeBaseBlock(?string $value): string
    {
        $value = strtolower(trim((string) $value));
        $value = str_replace([' ', '-'], '_', $value);

        return match ($value) {
            'am', 'morning', 'half_day_am' => self::BLOCK_AM,
            'pm', 'afternoon', 'half_day_pm' => self::BLOCK_PM,
            'whole', 'whole_day', 'day', 'full_day' => self::BLOCK_WHOLE_DAY,
            default => throw new InvalidArgumentException('Invalid schedule base block.'),
        };
    }

    public static function normalizeRole(?string $value): string
    {
        $value = strtolower(trim((string) $value));

        return match ($value) {
            'ingress', 'setup', 'preparation', 'prep' => self::ROLE_INGRESS,
            'egress', 'packout', 'pack_out', 'pullout', 'pull_out' => self::ROLE_EGRESS,
            default => self::ROLE_EVENT,
        };
    }

    public static function intervalForDate(string $date, string $baseBlock, int $additionalHours = 0): array
    {
        $block = self::baseBlocks()[self::normalizeBaseBlock($baseBlock)];
        $day = Carbon::parse($date)->startOfDay();

        [$startHour, $startMinute] = array_map('intval', explode(':', $block['starts_at']));
        [$endHour, $endMinute] = array_map('intval', explode(':', $block['ends_at']));

        $startsAt = $day->copy()->setTime($startHour, $startMinute);
        $endsAt = $day->copy()->setTime($endHour, $endMinute);

        $additionalHours = max(0, min(5, $additionalHours));
        $additionalStartsAt = null;
        $additionalEndsAt = null;

        if ($additionalHours > 0 && ($block['allows_additional_hours'] ?? false)) {
            $additionalStartsAt = $endsAt->copy();
            $additionalEndsAt = $endsAt->copy()->addHours($additionalHours);
            $latest = $day->copy()->setTime(23, 59);

            if ($additionalEndsAt->gt($latest)) {
                $additionalEndsAt = $latest;
            }

            $endsAt = $additionalEndsAt->copy();
        }

        return [$startsAt, $endsAt, $additionalStartsAt, $additionalEndsAt];
    }
}
