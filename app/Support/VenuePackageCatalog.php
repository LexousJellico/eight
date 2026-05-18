<?php

namespace App\Support;

final class VenuePackageCatalog
{
    public static function defaults(): array
    {
        return [
            [
                'code' => 'MAIN_VIP',
                'name' => 'Main Hall + VIP Lounge',
                'subtitle' => 'Main ceremony or plenary with VIP holding area',
                'description' => 'Recommended for formal programs that need a separate dignitary, speaker, or VIP lounge area.',
                'area_keys' => ['main_hall', 'vip_lounge'],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 10,
            ],
            [
                'code' => 'MAIN_BOARD',
                'name' => 'Main Hall + Board Room',
                'subtitle' => 'Main program with private meeting room',
                'description' => 'Recommended for seminars, conventions, and planning activities that need a smaller breakout or coordination room.',
                'area_keys' => ['main_hall', 'board_room'],
                'image_path' => '/marketing/images/hero/noon2.jpg',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 20,
            ],
            [
                'code' => 'MAIN_VIP_BOARD',
                'name' => 'Main Hall + VIP Lounge + Board Room',
                'subtitle' => 'Complete main-event support package',
                'description' => 'Recommended for higher-profile activities needing a main program area, VIP area, and coordination room.',
                'area_keys' => ['main_hall', 'vip_lounge', 'board_room'],
                'image_path' => '/marketing/images/facilities/darkvip.JPG',
                'is_public' => true,
                'is_featured' => true,
                'sort_order' => 30,
            ],
            [
                'code' => 'MAIN_LED',
                'name' => 'Main Hall + LED Wall',
                'subtitle' => 'Main program with LED wall support',
                'description' => 'Recommended for programs that need stronger visual presentation support.',
                'area_keys' => ['main_hall', 'led_wall'],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => false,
                'sort_order' => 40,
            ],
            [
                'code' => 'FULL_HALL_ONLY',
                'name' => 'Full Hall',
                'subtitle' => 'Full Hall without VIP Lounge, Board Room, or LED Wall',
                'description' => 'Use this when the hall itself is needed. VIP Lounge, Board Room, and LED Wall remain separate add-ons/packages.',
                'area_keys' => ['full_hall'],
                'image_path' => '/marketing/images/events/darkmain.JPG',
                'is_public' => true,
                'is_featured' => false,
                'sort_order' => 50,
            ],
        ];
    }

    public static function normalizeCode(?string $code): ?string
    {
        $code = strtoupper(trim((string) $code));
        $code = preg_replace('/[^A-Z0-9_]+/', '_', $code) ?: '';
        $code = trim($code, '_');

        return $code !== '' ? $code : null;
    }

    public static function find(?string $code): ?array
    {
        $code = self::normalizeCode($code);

        if (! $code) {
            return null;
        }

        return collect(self::defaults())->firstWhere('code', $code);
    }

    public static function areaKeys(?string $code): array
    {
        $package = self::find($code);

        if (! $package) {
            return [];
        }

        return VenueAreaCatalog::canonicalKeys($package['area_keys'] ?? []);
    }

    public static function options(): array
    {
        return collect(self::defaults())
            ->map(fn (array $package) => [
                'code' => $package['code'],
                'name' => $package['name'],
                'label' => $package['name'],
                'subtitle' => $package['subtitle'] ?? null,
                'description' => $package['description'] ?? null,
                'area_keys' => VenueAreaCatalog::canonicalKeys($package['area_keys'] ?? []),
                'area_labels' => VenueAreaCatalog::displayNames($package['area_keys'] ?? []),
                'image_path' => $package['image_path'] ?? null,
                'is_public' => (bool) ($package['is_public'] ?? true),
                'is_featured' => (bool) ($package['is_featured'] ?? false),
                'sort_order' => (int) ($package['sort_order'] ?? 0),
            ])
            ->sortBy('sort_order')
            ->values()
            ->all();
    }
}
