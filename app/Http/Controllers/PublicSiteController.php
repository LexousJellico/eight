<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CalendarBlock;
use App\Models\FeaturePackage;
use App\Models\HomepageStat;
use App\Models\PublicEvent;
use App\Models\SiteSetting;
use App\Models\TourismMember;
use App\Models\VenuePackageTemplate;
use App\Models\VenueSpace;
use App\Services\SiteViewMetricService;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use App\Support\VenueAreaCatalog;
use App\Support\VenuePackageCatalog;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PublicSiteController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('public/home', [
            'siteSettings' => $this->siteSettingsPayload(),
            'venueOptions' => $this->venueOptionsPayload()->all(),
            'events' => $this->eventsPayload()->all(),
            'spaces' => $this->spacesPayload()
                ->where('homepageVisible', true)
                ->values()
                ->all(),
            'stats' => $this->statsPayload()->all(),
            'siteMetric' => app(SiteViewMetricService::class)->payload('home'),
            'offers' => $this->packagesPayload()->all(),
            'packages' => $this->venuePackagesPayload()->all(),
        ]);
    }

    public function facilities(): Response
    {
        return Inertia::render('public/facilities', [
            'siteSettings' => $this->siteSettingsPayload(),
            'spaces' => $this->spacesPayload()->all(),
        ]);
    }

    public function facilityShow(string $slug): Response
    {
        $spaces = $this->spacesPayload();
        $facility = $spaces->firstWhere('slug', $slug);

        abort_unless($facility, 404);

        return Inertia::render('public/facility-show', [
            'siteSettings' => $this->siteSettingsPayload(),
            'facility' => $facility,
            'relatedFacilities' => $spaces
                ->reject(fn (array $item) => $item['slug'] === $slug)
                ->take(3)
                ->values()
                ->all(),
        ]);
    }

    public function events(): Response
    {
        return Inertia::render('public/events', [
            'siteSettings' => $this->siteSettingsPayload(),
            'events' => $this->eventsPayload()->all(),
        ]);
    }

    public function calendar(): Response
    {
        return Inertia::render('public/calendar', [
            'siteSettings' => $this->siteSettingsPayload(),
            'events' => $this->eventsPayload()->all(),
            'calendarBlocks' => $this->calendarBlocksPayload()->all(),
            'venueOptions' => $this->venueOptionsPayload()->all(),
        ]);
    }

    public function tourismOffice(): Response
    {
        $spaces = $this->spacesPayload();

        $officeSpace = $spaces->first(function (array $item) {
            return $this->isTourismOfficeSpace($item);
        });

        return Inertia::render('public/tourism-office', [
            'siteSettings' => $this->siteSettingsPayload(),
            'officeSpace' => $officeSpace,
            'events' => $this->eventsPayload()
                ->filter(fn (array $item) => $item['isPublic'] === true)
                ->take(4)
                ->values()
                ->all(),
            'members' => $this->membersPayload()->all(),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('public/contact', [
            'siteSettings' => $this->siteSettingsPayload(),
            'venueOptions' => $this->venueOptionsPayload()->all(),
        ]);
    }

    public function guidelines(): Response
    {
        return Inertia::render('public/guidelines', [
            'siteSettings' => $this->siteSettingsPayload(),
        ]);
    }

    protected function siteSettingsPayload(): array
    {
        $settings = SiteSetting::query()->first();

        $openMapUrl = $this->safeExternalUrl($settings?->open_map_url)
            ?: 'https://www.google.com/maps/search/?api=1&query=CH3X%2BRRW%2C%20Baguio%2C%20Benguet%2C%20Philippines';

        $visitaUrl = $this->safeExternalUrl($settings?->visita_url) ?: '';
        $creativeBaguioUrl = $this->safeExternalUrl($settings?->creative_baguio_url) ?: '';
        $mapEmbedUrl = $this->safeMapEmbedUrl($settings?->map_embed_url);

        return [
            'mapEmbedUrl' => $mapEmbedUrl,
            'openMapUrl' => $openMapUrl,
            'address' => $settings?->address ?: 'CH3X+RRW, Baguio, Benguet, Philippines',
            'phone' => $settings?->phone ?: '(074) 446 2009',
            'email' => $settings?->email ?: 'info@bccc-ease.com',
            'visitaUrl' => $visitaUrl,
            'creativeBaguioUrl' => $creativeBaguioUrl,
            'footerDescription' => $settings?->footer_description ?: 'A public-facing venue platform for space discovery, event highlights, schedule visibility, and booking guidance for the Baguio Convention and Cultural Center.',
            'footerCopyright' => $settings?->footer_copyright ?: '© 2026 BCCC EASE • City Government of Baguio • All Rights Reserved',
        ];
    }

    protected function venueOptionsPayload(): Collection
    {
        return collect(VenueAreaCatalog::publicOptions());
    }

    protected function spacesPayload(): Collection
    {
        return VenueSpace::query()
            ->orderBy('sort_order')
            ->get()
            ->map(function (VenueSpace $space) {
                $fallbackLight = '/marketing/images/branding/noon.jpg';
                $fallbackDark = '/marketing/images/hero/night.png';

                $light = $space->light_image ?: $fallbackLight;
                $dark = $space->dark_image ?: ($space->light_image ?: $fallbackDark);
                $homepageVisible = (bool) $space->homepage_visible;
                $slug = Str::slug($space->title);

                return [
                    'id' => $space->id,
                    'slug' => $slug,
                    'title' => $space->title,
                    'shortDescription' => $space->short_description,
                    'summary' => $space->summary ?: $space->short_description,
                    'details' => is_array($space->details) ? array_values($space->details) : [],
                    'image' => $light,
                    'lightImage' => $light,
                    'darkImage' => $dark,
                    'capacity' => $space->capacity ?: 'Flexible venue capacity',
                    'category' => $space->category ?: 'Venue Space',
                    'ctaLabel' => $this->isTourismOfficeSpace([
                        'slug' => $slug,
                        'title' => $space->title,
                        'category' => $space->category,
                    ]) ? 'View Office' : 'View Space',
                    'homepageVisible' => $homepageVisible,
                    'featured' => $homepageVisible,
                ];
            })
            ->values();
    }

    protected function eventsPayload(): Collection
    {
        $query = PublicEvent::query()
            ->where('is_public', true)
            ->orderByDesc('is_highlighted');

        if (Schema::hasColumn('public_events', 'event_start_date')) {
            $query->orderByRaw('COALESCE(event_start_date, event_date) asc');
        } else {
            $query->orderBy('event_date');
        }

        return $query
            ->orderBy('sort_order')
            ->get()
            ->map(function (PublicEvent $event) {
                $images = is_array($event->images) && count($event->images) > 0
                    ? array_values($event->images)
                    : ['/marketing/images/events/1.JPG'];

                $image = $images[0];
                $scope = $event->scope === 'city' ? 'city' : 'bccc';
                $highlighted = (bool) $event->is_highlighted;
                $dateText = $this->publicEventDateText($event);
                $startKey = $this->publicEventStartDateKey($event);
                $endKey = $this->publicEventEndDateKey($event);

                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'date' => $dateText,
                    'dateKey' => $startKey,
                    'endDateKey' => $endKey,
                    'time' => $event->event_time,
                    'summary' => $event->note ?: Str::limit((string) $event->description, 140),
                    'description' => $event->description,
                    'note' => $event->note ?: 'Public event details remain subject to final operational confirmation.',
                    'venue' => $event->venue,
                    'images' => $images,
                    'image' => $image,
                    'lightImage' => $image,
                    'darkImage' => $image,
                    'category' => $scope === 'city' ? 'Baguio City Event' : 'BCCC Public Event',
                    'featured' => $highlighted,
                    'highlighted' => $highlighted,
                    'scope' => $scope,
                    'isPublic' => (bool) $event->is_public,
                ];
            })
            ->values();
    }

    protected function statsPayload(): Collection
    {
        return HomepageStat::query()
            ->orderBy('sort_order')
            ->get()
            ->map(fn (HomepageStat $stat) => [
                'id' => $stat->id,
                'value' => (string) $stat->value,
                'suffix' => $stat->suffix ?: '',
                'label' => $stat->label,
            ])
            ->values();
    }

    protected function venuePackagesPayload(): Collection
    {
        try {
            $packages = VenuePackageTemplate::query()
                ->where('is_public', true)
                ->orderByDesc('is_featured')
                ->orderBy('sort_order')
                ->orderBy('name')
                ->get();

            if ($packages->isNotEmpty()) {
                return $packages->map(function (VenuePackageTemplate $package) {
                    $areaKeys = VenueAreaCatalog::canonicalKeys($package->area_keys ?? []);
                    $image = $package->image_path ?: '/marketing/images/facilities/darkvip.JPG';

                    return [
                        'id' => $package->id,
                        'code' => $package->code,
                        'title' => $package->name,
                        'name' => $package->name,
                        'subtitle' => $package->subtitle,
                        'description' => $package->description,
                        'areaKeys' => $areaKeys,
                        'area_keys' => $areaKeys,
                        'areaLabels' => VenueAreaCatalog::displayNames($areaKeys),
                        'area_labels' => VenueAreaCatalog::displayNames($areaKeys),
                        'image' => $image,
                        'lightImage' => $image,
                        'darkImage' => $image,
                        'buttonLabel' => 'Reserve This Package',
                        'href' => '/book?package=' . urlencode((string) $package->code),
                        'featured' => (bool) $package->is_featured,
                        'homepageVisible' => (bool) $package->is_public,
                        'sortOrder' => (int) $package->sort_order,
                    ];
                })->values();
            }
        } catch (\Throwable) {
            // Table may not exist before Batch 1 migration is applied.
        }

        return collect(VenuePackageCatalog::options())
            ->filter(fn (array $package) => (bool) ($package['is_public'] ?? true))
            ->map(function (array $package, int $index) {
                $image = $package['image_path'] ?? '/marketing/images/facilities/darkvip.JPG';

                return [
                    'id' => 'catalog-' . ($package['code'] ?? $index),
                    'code' => $package['code'],
                    'title' => $package['name'],
                    'name' => $package['name'],
                    'subtitle' => $package['subtitle'] ?? null,
                    'description' => $package['description'] ?? null,
                    'areaKeys' => $package['area_keys'] ?? [],
                    'area_keys' => $package['area_keys'] ?? [],
                    'areaLabels' => $package['area_labels'] ?? [],
                    'area_labels' => $package['area_labels'] ?? [],
                    'image' => $image,
                    'lightImage' => $image,
                    'darkImage' => $image,
                    'buttonLabel' => 'Reserve This Package',
                    'href' => '/book?package=' . urlencode((string) ($package['code'] ?? '')),
                    'featured' => (bool) ($package['is_featured'] ?? false),
                    'homepageVisible' => (bool) ($package['is_public'] ?? true),
                    'sortOrder' => (int) ($package['sort_order'] ?? 0),
                ];
            })
            ->values();
    }

    protected function packagesPayload(): Collection
    {
        return FeaturePackage::query()
            ->orderBy('sort_order')
            ->get()
            ->map(function (FeaturePackage $package) {
                $images = is_array($package->images) && count($package->images) > 0
                    ? array_values($package->images)
                    : ['/marketing/images/events/4.jpg'];
                $image = $images[0];

                return [
                    'id' => $package->id,
                    'title' => $package->title,
                    'subtitle' => 'Venue package option',
                    'description' => $package->description,
                    'images' => $images,
                    'image' => $image,
                    'lightImage' => $image,
                    'darkImage' => $image,
                    'buttonLabel' => 'Ask About This Package',
                    'href' => '/contact',
                ];
            })
            ->values();
    }

    protected function calendarBlocksPayload(): Collection
    {
        $manualBlocks = CalendarBlock::query()
            ->whereNotNull('public_status')
            ->orderBy('date_from')
            ->get()
            ->map(function (CalendarBlock $block) {
                $status = strtolower((string) ($block->public_status ?? 'red'));

                return [
                    'title' => match ($status) {
                        'blue' => (string) ($block->title ?? 'Public Event Block'),
                        'gold' => 'Private Booking',
                        default => 'Blocked Date',
                    },
                    'area' => match ($status) {
                        'blue' => (string) ($block->area ?? ''),
                        'gold' => 'Reserved area details are hidden',
                        default => 'Unavailable for public requests',
                    },
                    'notes' => match ($status) {
                        'blue' => (string) ($block->notes ?? ''),
                        'gold' => 'Private booking details are hidden from public view.',
                        default => 'This date is blocked for maintenance, control, or other internal reasons.',
                    },
                    'publicStatus' => $status ?: 'red',
                    'dateFrom' => $this->normalizePublicCalendarStartDate($block->date_from),
                    'dateTo' => $this->normalizePublicCalendarEndDate($block->date_from, $block->date_to),
                ];
            });

        $bookingBlocks = Booking::query()
            ->with(['bookingServices.service.serviceType', 'service.serviceType'])
            ->whereIn('booking_status', ['confirmed', 'active'])
            ->orderBy('booking_date_from')
            ->get()
            ->map(function (Booking $booking) {
                return [
                    'title' => 'Private Booking',
                    'area' => 'Reserved area details are hidden',
                    'notes' => 'Confirmed and active bookings appear as private dates on the public calendar.',
                    'publicStatus' => 'gold',
                    'dateFrom' => $this->normalizePublicCalendarStartDate($booking->booking_date_from),
                    'dateTo' => $this->normalizePublicCalendarEndDate($booking->booking_date_from, $booking->booking_date_to),
                ];
            });

        return $manualBlocks->concat($bookingBlocks)->values();
    }

    protected function membersPayload(): Collection
    {
        $query = TourismMember::query()
            ->where('is_active', true);

        if (Schema::hasColumn('tourism_members', 'tree_level')) {
            $query->orderByRaw('COALESCE(tree_level, 99) asc');
        }

        return $query
            ->orderBy('sort_order')
            ->orderByDesc('is_featured')
            ->get()
            ->map(function (TourismMember $member) {
                $details = is_array($member->details) ? array_values(array_filter($member->details)) : [];

                return [
                    'id' => $member->id,
                    'fullName' => (string) ($member->full_name ?? $member->getAttribute('name') ?? ''),
                    'designation' => (string) ($member->designation ?? $member->getAttribute('position') ?? ''),
                    'unitName' => $member->unit_name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                    'shortBio' => $member->short_bio,
                    'details' => $details,
                    'photo' => $member->photo_path ?: '/marketing/images/branding/breathe-dark.png',
                    'featured' => (bool) $member->is_featured,
                    'officeSection' => $member->getAttribute('office_section'),
                    'teamName' => $member->getAttribute('team_name'),
                    'reportsToId' => $member->getAttribute('reports_to_id'),
                    'treeLevel' => (int) ($member->getAttribute('tree_level') ?? 0),
                ];
            })
            ->values();
    }

    protected function isTourismOfficeSpace(array $item): bool
    {
        $title = strtolower((string) ($item['title'] ?? ''));
        $slug = strtolower((string) ($item['slug'] ?? ''));
        $category = strtolower((string) ($item['category'] ?? ''));

        return str_contains($title, 'tourism')
            || str_contains($slug, 'tourism')
            || str_contains($category, 'tourism office');
    }

    protected function normalizePublicCalendarStartDate($value): ?string
    {
        if ($value instanceof \DateTimeInterface) {
            return $value->format('Y-m-d');
        }

        if (! $value) {
            return null;
        }

        try {
            return Carbon::parse($value)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    protected function normalizePublicCalendarEndDate($from, $to): ?string
    {
        $fromDate = $this->normalizePublicCalendarStartDate($from);
        $toDate = $this->normalizePublicCalendarStartDate($to);

        return $toDate ?: $fromDate;
    }

    protected function safeExternalUrl(?string $value): ?string
    {
        $value = is_string($value) ? trim($value) : null;

        if (! $value || ! filter_var($value, FILTER_VALIDATE_URL)) {
            return null;
        }

        $scheme = strtolower((string) parse_url($value, PHP_URL_SCHEME));

        return in_array($scheme, ['http', 'https'], true) ? $value : null;
    }

    protected function safeMapEmbedUrl(?string $value): ?string
    {
        $value = $this->safeExternalUrl($value);

        if (! $value) {
            return null;
        }

        $host = strtolower((string) parse_url($value, PHP_URL_HOST));

        $allowedHosts = [
            'www.google.com',
            'google.com',
            'maps.google.com',
            'www.google.com.ph',
            'google.com.ph',
        ];

        return in_array($host, $allowedHosts, true) ? $value : null;
    }

    protected function publicEventStartDateKey(PublicEvent $event): ?string
    {
        $start = $event->getAttribute('event_start_date') ?: $event->event_date;

        if (! $start) {
            return null;
        }

        try {
            return Carbon::parse($start)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    protected function publicEventEndDateKey(PublicEvent $event): ?string
    {
        $end = $event->getAttribute('event_end_date') ?: $event->getAttribute('event_start_date') ?: $event->event_date;

        if (! $end) {
            return null;
        }

        try {
            return Carbon::parse($end)->format('Y-m-d');
        } catch (\Throwable) {
            return null;
        }
    }

    protected function publicEventDateText(PublicEvent $event): string
    {
        $startKey = $this->publicEventStartDateKey($event);
        $endKey = $this->publicEventEndDateKey($event);

        if (! $startKey && ! $endKey) {
            return '';
        }

        if (! $startKey || ! $endKey || $startKey === $endKey) {
            return $startKey ? Carbon::parse($startKey)->format('F j, Y') : '';
        }

        return Carbon::parse($startKey)->format('F j, Y') . ' to ' . Carbon::parse($endKey)->format('F j, Y');
    }
}
