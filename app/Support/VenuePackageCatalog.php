<?php

namespace App\Support;

final class VenuePackageCatalog
{
    public static function defaults(): array
    {
        return ActiveVenueCatalog::packages();
    }

    public static function normalizeCode(?string $code): ?string
    {
        $code = strtoupper(trim((string) $code));
        $code = preg_replace('/[^A-Z0-9_]+/', '_', $code) ?: '';
        $code = trim($code, '_');

        if ($code === '') {
            return null;
        }

        $aliases = [
            'FULL_HALL' => 'FULL_HALL_ONLY',
            'FULL_HALL_PACKAGE' => 'FULL_HALL_ONLY',
            'MAIN_HALL' => 'MAIN_HALL_ONLY',
            'MAIN_HALL_PACKAGE' => 'MAIN_HALL_ONLY',
            'LED_WALL' => 'LED_WALL_ONLY',
            'LED' => 'LED_WALL_ONLY',
            'LOUNGE' => 'VIP_LOUNGE_ONLY',
            'VIP_LOUNGE' => 'VIP_LOUNGE_ONLY',
            'BOARDROOM' => 'BOARD_ROOM_ONLY',
            'BOARD_ROOM' => 'BOARD_ROOM_ONLY',
            'MAIN_HALL_BOARDROOM' => 'MAIN_BOARD',
            'MAIN_BOARDROOM' => 'MAIN_BOARD',
            'MAIN_HALL_BOARD_ROOM' => 'MAIN_BOARD',
            'MAIN_HALL_LOUNGE' => 'MAIN_LOUNGE',
            'MAIN_HALL_LED_WALL' => 'MAIN_LED',
            'MAIN_LED_WALL' => 'MAIN_LED',
            'FULL_HALL_LED_WALL' => 'FULL_LED',
            'FULL_LED_WALL' => 'FULL_LED',
            'FULL_HALL_LOUNGE' => 'FULL_LOUNGE',
            'FULL_HALL_BOARDROOM' => 'FULL_BOARD',
            'FULL_HALL_BOARD_ROOM' => 'FULL_BOARD',
            'LOUNGE_BOARDROOM' => 'LOUNGE_BOARD',
            'LOUNGE_BOARD_ROOM' => 'LOUNGE_BOARD',
        ];

        return $aliases[$code] ?? $code;
    }

    public static function find(?string $code): ?array
    {
        $code = self::normalizeCode($code);

        if (! $code) {
            return null;
        }

        return collect(self::defaults())->firstWhere('code', $code);
    }

    public static function exists(?string $code): bool
    {
        return self::find($code) !== null;
    }

    public static function areaKeys(?string $code): array
    {
        $package = self::find($code);

        if (! $package) {
            return [];
        }

        return ActiveVenueCatalog::sanitizeKeys($package['area_keys'] ?? []);
    }

    public static function rateSummary(array $areaKeys): array
    {
        return ActiveVenueCatalog::rateSummary($areaKeys);
    }

    public static function options(): array
    {
        return collect(self::defaults())
            ->map(function (array $package): array {
                $areaKeys = ActiveVenueCatalog::sanitizeKeys($package['area_keys'] ?? []);

                return [
                    'code' => $package['code'],
                    'name' => $package['name'],
                    'label' => $package['name'],
                    'subtitle' => $package['subtitle'] ?? null,
                    'description' => $package['description'] ?? null,
                    'area_keys' => $areaKeys,
                    'area_labels' => VenueAreaCatalog::displayNames($areaKeys),
                    'rates' => self::rateSummary($areaKeys),
                    'image_path' => $package['image_path'] ?? null,
                    'is_public' => (bool) ($package['is_public'] ?? true),
                    'is_featured' => (bool) ($package['is_featured'] ?? false),
                    'sort_order' => (int) ($package['sort_order'] ?? 0),
                ];
            })
            ->filter(fn (array $package): bool => ! empty($package['area_keys']) && ActiveVenueCatalog::validCombination($package['area_keys']))
            ->sortBy('sort_order')
            ->values()
            ->all();
    }
}
