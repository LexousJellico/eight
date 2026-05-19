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
            ->filter(fn (array $package): bool => ! empty($package['area_keys']))
            ->sortBy('sort_order')
            ->values()
            ->all();
    }
}
