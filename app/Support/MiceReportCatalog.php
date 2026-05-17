<?php

namespace App\Support;

final class MiceReportCatalog
{
    public static function eventCenters(): array
    {
        return [
            'BAGUIO CONVENTION AND CULTURAL CENTER',
            '456 HOTEL LE GRANDE',
            'A HOTEL',
            'ALAY SA KAPATID FOUNDATION, INC.',
            'ALPHA AND DALE GUESTHAVEN',
            'BAGUIO COUNTRY CLUB',
            'THE MANOR CAMP JOHN HAY',
            'NEW TOWN PLAZA HOTEL',
            'OTHER',
        ];
    }

    public static function coveredMonths(): array
    {
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December',
        ];
    }

    public static function classifications(): array
    {
        return [
            'INTERNATIONAL' => 'International',
            'REGIONAL ASIA PACIFIC' => 'Regional Asia Pacific',
            'REGIONAL OFFSHORE' => 'Regional Offshore',
            'REGIONAL PHILIPPINES' => 'Regional Philippines',
            'NATIONAL' => 'National',
            'OTHER' => 'Other / for validation',
        ];
    }

    public static function eventTypes(): array
    {
        return [
            'MEETINGS' => 'Meetings',
            'INCENTIVE TRAVEL' => 'Incentive Travel',
            'CONVENTIONS' => 'Conventions',
            'EXHIBITS' => 'Exhibits',
            'SEMINAR' => 'Seminar',
            'WORKSHOP' => 'Workshop',
            'SYMPOSIUM' => 'Symposium',
            'OTHERS' => 'Others',
        ];
    }

    public static function privateEventTypes(): array
    {
        return [
            'WEDDING' => 'Wedding',
            'BIRTHDAY' => 'Birthday',
            'DEBUT' => 'Debut',
            'FAMILY_EVENT' => 'Family event',
            'PRIVATE_SOCIAL_EVENT' => 'Private social event',
            'OTHER_PRIVATE_EVENT' => 'Other private event',
        ];
    }

    public static function requiresMiceReport(?string $eventType, ?string $privateEventType = null): bool
    {
        $private = strtoupper(trim((string) $privateEventType));

        if ($private !== '' && array_key_exists($private, self::privateEventTypes())) {
            return false;
        }

        $type = strtoupper(trim((string) $eventType));

        if ($type === '') {
            return true;
        }

        $privateWords = ['WEDDING', 'BIRTHDAY', 'DEBUT', 'FAMILY', 'PRIVATE', 'PERSONAL'];

        foreach ($privateWords as $word) {
            if (str_contains($type, $word)) {
                return false;
            }
        }

        return true;
    }

    public static function eventCenterOptions(): array
    {
        return collect(self::eventCenters())
            ->map(fn (string $value) => ['value' => $value, 'label' => $value])
            ->values()
            ->all();
    }

    public static function coveredMonthOptions(): array
    {
        return collect(self::coveredMonths())
            ->map(fn (string $value) => ['value' => $value, 'label' => $value])
            ->values()
            ->all();
    }

    public static function classificationOptions(): array
    {
        return collect(self::classifications())
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    public static function typeOptions(): array
    {
        return collect(self::eventTypes())
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    public static function privateEventOptions(): array
    {
        return collect(self::privateEventTypes())
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    public static function options(): array
    {
        return [
            'event_centers' => self::eventCenters(),
            'covered_months' => self::coveredMonths(),
            'classifications' => self::classifications(),
            'event_types' => self::eventTypes(),
            'private_event_types' => self::privateEventTypes(),
            'exhibitions' => [
                ['value' => true, 'label' => 'Yes'],
                ['value' => false, 'label' => 'No'],
            ],
        ];
    }
}
