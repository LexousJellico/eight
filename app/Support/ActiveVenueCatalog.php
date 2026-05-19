<?php

namespace App\Support;

final class ActiveVenueCatalog
{
    public const FULL_HALL = 'full_hall';
    public const MAIN_HALL = 'main_hall';
    public const LED_WALL = 'led_wall';
    public const LOUNGE = 'vip_lounge';
    public const BOARDROOM = 'board_room';

    public const DURATION_WHOLE_DAY = 'whole_day';
    public const DURATION_HALF_DAY = 'half_day';
    public const DURATION_ADDITIONAL_HOUR = 'additional_hour';

    /**
     * Only these five keys are bookable in the active public/admin reservation flow.
     * Lobby, basement spaces, shop rentals, catering maintenance, air-conditioning,
     * stationery kits, and ordinance special packages are intentionally unavailable.
     */
    public static function activeKeys(): array
    {
        return [
            self::FULL_HALL,
            self::MAIN_HALL,
            self::LED_WALL,
            self::LOUNGE,
            self::BOARDROOM,
        ];
    }

    public static function excludedChargeKeys(): array
    {
        return [
            'foyer_lobby',
            'lobby_receiving_room',
            'basement',
            'basement_function_room',
            'basement_hall_half',
            'whole_basement',
            'shop_rental',
            'catering_maintenance_fee',
            'air_conditioning',
            'stationery_kit',
            'ordinance_special_package',
        ];
    }

    public static function rates(): array
    {
        return [
            self::FULL_HALL => [
                'area_key' => self::FULL_HALL,
                'code' => 'FULL_HALL',
                'label' => 'Full Hall',
                'display_label' => 'FULL HALL',
                'official_label' => 'Full Hall',
                'whole_day' => 80000.00,
                'half_day' => 45000.00,
                'additional_hour' => 5000.00,
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'description' => 'Full Hall rental for large-format programs. Lobby access is included as support circulation and registration flow, not as a separate charge.',
                'support_notes' => ['Lobby access is included.', 'VIP Lounge, Board Room, and LED Wall remain separate selections.'],
                'sort_order' => 10,
            ],
            self::MAIN_HALL => [
                'area_key' => self::MAIN_HALL,
                'code' => 'MAIN_HALL',
                'label' => 'Main Hall',
                'display_label' => 'MAIN HALL',
                'official_label' => 'Ground Hall / Main Hall',
                'whole_day' => 60000.00,
                'half_day' => 35000.00,
                'additional_hour' => 5000.00,
                'image_path' => '/marketing/images/hero/noon2.jpg',
                'description' => 'Primary hall for conferences, ceremonies, seminars, assemblies, and formal civic programs.',
                'support_notes' => [],
                'sort_order' => 20,
            ],
            self::LED_WALL => [
                'area_key' => self::LED_WALL,
                'code' => 'LED_WALL',
                'label' => 'LED Wall',
                'display_label' => 'LED WALL',
                'official_label' => 'LED Video Wall',
                'whole_day' => 30000.00,
                'half_day' => 15000.00,
                'additional_hour' => 3500.00,
                'image_path' => '/marketing/images/facilities/darkvip.JPG',
                'description' => 'Digital display support for presentations, branding, stage visuals, and program media.',
                'support_notes' => [],
                'sort_order' => 30,
            ],
            self::LOUNGE => [
                'area_key' => self::LOUNGE,
                'code' => 'VIP_LOUNGE',
                'label' => 'Lounge',
                'display_label' => 'LOUNGE',
                'official_label' => 'Executive Lounge / VIP Lounge',
                'whole_day' => 6000.00,
                'half_day' => 3500.00,
                'additional_hour' => 500.00,
                'image_path' => '/marketing/images/facilities/darkvip.JPG',
                'description' => 'Executive support area for dignitaries, speakers, guests of honor, and protocol preparation.',
                'support_notes' => [],
                'sort_order' => 40,
            ],
            self::BOARDROOM => [
                'area_key' => self::BOARDROOM,
                'code' => 'BOARD_ROOM',
                'label' => 'Boardroom',
                'display_label' => 'BOARDROOM',
                'official_label' => 'Executive Boardroom / Board Room',
                'whole_day' => 6000.00,
                'half_day' => 3500.00,
                'additional_hour' => 500.00,
                'image_path' => '/marketing/images/facilities/darkvip.JPG',
                'description' => 'Private room for briefings, planning sessions, committees, and focused meetings.',
                'support_notes' => [],
                'sort_order' => 50,
            ],
        ];
    }

    public static function packages(): array
    {
        return [
            [
                'code' => 'FULL_HALL_ONLY',
                'name' => 'Full Hall',
                'subtitle' => 'Full hall booking with lobby access included',
                'description' => 'Best for large civic programs, conventions, ceremonies, and full-house events. VIP Lounge, Boardroom, and LED Wall are selected separately when needed.',
                'area_keys' => [self::FULL_HALL],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 10,
            ],
            [
                'code' => 'MAIN_HALL_ONLY',
                'name' => 'Main Hall',
                'subtitle' => 'Primary hall only',
                'description' => 'Best for main programs that do not require separate executive rooms or LED Wall support.',
                'area_keys' => [self::MAIN_HALL],
                'image_path' => '/marketing/images/hero/noon2.jpg',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 20,
            ],
            [
                'code' => 'MAIN_BOARD',
                'name' => 'Main Hall + Boardroom',
                'subtitle' => 'Main program with private meeting room',
                'description' => 'Recommended for seminars, conventions, and planning activities needing a private breakout or coordination room.',
                'area_keys' => [self::MAIN_HALL, self::BOARDROOM],
                'image_path' => '/marketing/images/hero/noon2.jpg',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 30,
            ],
            [
                'code' => 'MAIN_LOUNGE',
                'name' => 'Main Hall + Lounge',
                'subtitle' => 'Main program with VIP holding area',
                'description' => 'Recommended for formal programs with dignitaries, speakers, or VIP protocol requirements.',
                'area_keys' => [self::MAIN_HALL, self::LOUNGE],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 40,
            ],
            [
                'code' => 'MAIN_LOUNGE_BOARD',
                'name' => 'Main Hall + Lounge + Boardroom',
                'subtitle' => 'Complete main-event support combination',
                'description' => 'Recommended for higher-profile activities needing the main hall, VIP area, and coordination room.',
                'area_keys' => [self::MAIN_HALL, self::LOUNGE, self::BOARDROOM],
                'image_path' => '/marketing/images/facilities/darkvip.JPG',
                'is_public' => true,
                'is_featured' => false,
                'sort_order' => 50,
            ],
            [
                'code' => 'MAIN_LED',
                'name' => 'Main Hall + LED Wall',
                'subtitle' => 'Main program with display support',
                'description' => 'Recommended for programs that need stronger visual presentation and stage media support.',
                'area_keys' => [self::MAIN_HALL, self::LED_WALL],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => false,
                'sort_order' => 60,
            ],
            [
                'code' => 'FULL_LED',
                'name' => 'Full Hall + LED Wall',
                'subtitle' => 'Full hall with display support',
                'description' => 'Recommended for full-hall programs with stage visuals, branded presentations, or media-heavy production needs.',
                'area_keys' => [self::FULL_HALL, self::LED_WALL],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => false,
                'sort_order' => 70,
            ],
            [
                'code' => 'LOUNGE_BOARD',
                'name' => 'Lounge + Boardroom',
                'subtitle' => 'Executive support rooms only',
                'description' => 'Recommended for smaller executive programs, planning sessions, and protocol support without the main hall.',
                'area_keys' => [self::LOUNGE, self::BOARDROOM],
                'image_path' => '/marketing/images/facilities/darkvip.JPG',
                'is_public' => true,
                'is_featured' => false,
                'sort_order' => 80,
            ],
        ];
    }

    public static function aliases(): array
    {
        return [
            'full' => self::FULL_HALL,
            'fullhall' => self::FULL_HALL,
            'full_hall' => self::FULL_HALL,
            'wholehall' => self::FULL_HALL,
            'conventionhall' => self::FULL_HALL,
            'main' => self::MAIN_HALL,
            'mainhall' => self::MAIN_HALL,
            'main_hall' => self::MAIN_HALL,
            'groundhall' => self::MAIN_HALL,
            'ground_hall' => self::MAIN_HALL,
            'led' => self::LED_WALL,
            'ledwall' => self::LED_WALL,
            'led_wall' => self::LED_WALL,
            'ledvideowall' => self::LED_WALL,
            'video_wall' => self::LED_WALL,
            'lounge' => self::LOUNGE,
            'vip' => self::LOUNGE,
            'viplounge' => self::LOUNGE,
            'vip_lounge' => self::LOUNGE,
            'executivelounge' => self::LOUNGE,
            'executive_lounge' => self::LOUNGE,
            'board' => self::BOARDROOM,
            'boardroom' => self::BOARDROOM,
            'board_room' => self::BOARDROOM,
            'executiveboardroom' => self::BOARDROOM,
            'executive_boardroom' => self::BOARDROOM,
        ];
    }

    public static function normalizedToken(?string $value): string
    {
        $value = mb_strtolower(trim((string) $value));
        $value = str_replace(['&', '/', '+'], [' and ', ' ', ' '], $value);
        $value = preg_replace('/[^a-z0-9_]+/u', '', str_replace([' ', '-'], '_', $value)) ?? '';

        return trim($value, '_');
    }

    public static function canonicalKey(?string $value): string
    {
        $token = self::normalizedToken($value);

        if ($token === '') {
            return '';
        }

        $compact = str_replace('_', '', $token);
        $aliases = self::aliases();

        return $aliases[$token] ?? $aliases[$compact] ?? VenueAreaCatalog::canonicalKey($value);
    }

    public static function isSelectableKey(?string $key): bool
    {
        return in_array(self::canonicalKey($key), self::activeKeys(), true);
    }

    public static function isSelectableLabel(?string $label): bool
    {
        return self::isSelectableKey($label);
    }

    public static function serviceMatchesActiveChoice(?string $serviceName, ?string $serviceTypeName): bool
    {
        return self::isSelectableLabel($serviceTypeName) || self::isSelectableLabel($serviceName);
    }

    public static function sanitizeKeys(mixed $values): array
    {
        if ($values === null || $values === '') {
            return [];
        }

        if (is_string($values)) {
            $decoded = json_decode($values, true);
            $values = is_array($decoded) ? $decoded : preg_split('/[,;|]+/', $values);
        }

        if (! is_array($values)) {
            $values = [$values];
        }

        return collect($values)
            ->flatten()
            ->map(fn ($value) => self::canonicalKey(is_scalar($value) ? (string) $value : ''))
            ->filter(fn (string $key) => in_array($key, self::activeKeys(), true))
            ->unique()
            ->values()
            ->all();
    }

    public static function unavailableKeys(mixed $values): array
    {
        if ($values === null || $values === '') {
            return [];
        }

        if (is_string($values)) {
            $decoded = json_decode($values, true);
            $values = is_array($decoded) ? $decoded : preg_split('/[,;|]+/', $values);
        }

        if (! is_array($values)) {
            $values = [$values];
        }

        return collect($values)
            ->flatten()
            ->map(fn ($value) => VenueAreaCatalog::canonicalKey(is_scalar($value) ? (string) $value : ''))
            ->filter()
            ->reject(fn (string $key) => in_array($key, self::activeKeys(), true))
            ->unique()
            ->values()
            ->all();
    }

    public static function rate(?string $key): ?array
    {
        $key = self::canonicalKey($key);

        return self::rates()[$key] ?? null;
    }

    public static function amount(?string $key, ?string $duration): float
    {
        $rate = self::rate($key);
        $duration = self::normalizeDuration($duration);

        if (! $rate || $duration === '') {
            return 0.0;
        }

        return (float) ($rate[$duration] ?? 0.0);
    }

    public static function normalizeDuration(?string $duration): string
    {
        $value = mb_strtolower(trim((string) $duration));
        $value = str_replace([' ', '-'], '_', $value);

        return match ($value) {
            'whole', 'wholeday', 'whole_day', 'full_day', 'day', 'am_pm', 'am+pm' => self::DURATION_WHOLE_DAY,
            'half', 'halfday', 'half_day', 'am', 'pm', 'half_day_am', 'half_day_pm' => self::DURATION_HALF_DAY,
            'additional', 'additional_hour', 'additional_hours', 'hour', 'hours', 'hourly' => self::DURATION_ADDITIONAL_HOUR,
            default => '',
        };
    }

    public static function packageAmount(array $areaKeys, ?string $duration): float
    {
        $duration = self::normalizeDuration($duration);

        if ($duration === '') {
            return 0.0;
        }

        return collect(self::sanitizeKeys($areaKeys))
            ->reduce(fn (float $sum, string $key): float => $sum + self::amount($key, $duration), 0.0);
    }

    public static function rateSummary(array $areaKeys): array
    {
        $whole = self::packageAmount($areaKeys, self::DURATION_WHOLE_DAY);
        $half = self::packageAmount($areaKeys, self::DURATION_HALF_DAY);
        $hour = self::packageAmount($areaKeys, self::DURATION_ADDITIONAL_HOUR);

        return [
            'whole_day' => $whole,
            'half_day' => $half,
            'additional_hour' => $hour,
            'whole_day_label' => self::money($whole),
            'half_day_label' => self::money($half),
            'additional_hour_label' => self::money($hour),
        ];
    }

    public static function options(): array
    {
        return collect(self::rates())
            ->sortBy('sort_order')
            ->map(fn (array $rate) => [
                ...$rate,
                'value' => $rate['area_key'],
                'area_key' => $rate['area_key'],
                'name' => $rate['label'],
                'label' => $rate['display_label'],
                'whole_day_label' => self::money((float) $rate['whole_day']),
                'half_day_label' => self::money((float) $rate['half_day']),
                'additional_hour_label' => self::money((float) $rate['additional_hour']),
                'is_selectable' => true,
            ])
            ->values()
            ->all();
    }

    public static function money(float|int $amount): string
    {
        return '₱' . number_format((float) $amount, 2);
    }
}
