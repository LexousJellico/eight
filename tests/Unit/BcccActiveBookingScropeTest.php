<?php

use App\Support\ActiveVenueCatalog;
use App\Support\BcccBookingPolicyCatalog;
use App\Support\MiceReportCatalog;
use App\Support\VenuePackageCatalog;

it('limits the active public booking catalog to the five approved charge choices', function () {
    $keys = ActiveVenueCatalog::activeKeys();
    sort($keys);

    expect($keys)->toBe([
        'board_room',
        'full_hall',
        'led_wall',
        'main_hall',
        'vip_lounge',
    ]);
});

it('rejects unavailable ordinance or support spaces as selectable booking charges', function () {
    foreach ([
        'Lobby Receiving Room',
        'Basement Function Room',
        'Basement Hall - Half',
        'Whole Basement',
        'Shop Rentals',
        'Catering Maintenance Fee',
        'Air Conditioning',
        'Stationery Kit',
        'Ordinance Special Package',
    ] as $label) {
        expect(ActiveVenueCatalog::isSelectableLabel($label))->toBeFalse($label . ' must not be selectable.');
    }
});

it('keeps active package combinations within the approved five choices', function () {
    $active = ActiveVenueCatalog::activeKeys();

    foreach (VenuePackageCatalog::defaults() as $package) {
        foreach ($package['area_keys'] as $areaKey) {
            expect($active)->toContain($areaKey);
        }
    }
});

it('keeps discounts private until final computation policy stage', function () {
    expect(BcccBookingPolicyCatalog::finalConfirmationNotice())
        ->toHaveKey('discount_privacy');
});

it('keeps MICE fixed fields aligned with BCCC report requirements', function () {
    expect(MiceReportCatalog::EVENT_CENTER_NAME)->toBe('BAGUIO CONVENTION AND CULTURAL CENTER')
        ->and(MiceReportCatalog::FUNCTION_HALLS_COUNT)->toBe(1)
        ->and(MiceReportCatalog::FUNCTION_HALL_CAPACITY)->toBe(4000)
        ->and(MiceReportCatalog::countries())->toContain('Philippines');
});
