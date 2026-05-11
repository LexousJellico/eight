import AmenitiesRow from '@/components/public/amenities-row';
import AvailabilityStrip from '@/components/public/availability-strip';
import EventsHighlights from '@/components/public/events-highlights';
import HeroAvailabilityBar from '@/components/public/hero-availability-bar';
import HeroBanner from '@/components/public/hero-banner';
import LocationAssistance from '@/components/public/location-assistance';
import OfficialPublicQuickLinks from '@/components/public/official-public-quick-links';
import SpacesGrid from '@/components/public/spaces-grid';
import SpecialOffers from '@/components/public/special-offers';
import StatsBanner from '@/components/public/stats-banner';
import WelcomeSection from '@/components/public/welcome-section';
import PublicLayout from '@/layouts/public-layout';
import { Head } from '@inertiajs/react';
import type {
    FeaturePackageItem,
    HomepageStatItem,
    PublicEventItem,
    PublicSpaceItem,
    VenueOption,
} from '@/types/public-content';

type Props = {
    venueOptions?: VenueOption[];
    events?: PublicEventItem[];
    bcccEvents?: PublicEventItem[];
    cityEvents?: PublicEventItem[];
    spaces?: PublicSpaceItem[];
    stats?: HomepageStatItem[];
    offers?: FeaturePackageItem[];
    packages?: FeaturePackageItem[];
};

export default function Home({
    venueOptions = [],
    events = [],
    bcccEvents = [],
    cityEvents = [],
    spaces = [],
    stats = [],
    offers = [],
    packages = [],
}: Props) {
    const mergedEvents = events.length > 0 ? events : [...bcccEvents, ...cityEvents];
    const mergedOffers = offers.length > 0 ? offers : packages;

    return (
        <PublicLayout>
            <Head title="Baguio Convention and Cultural Center" />

            <HeroBanner />

            <HeroAvailabilityBar venueOptions={venueOptions} />

            <WelcomeSection />

            <StatsBanner items={stats} />

            <AmenitiesRow />

            <SpacesGrid items={spaces} />

            <EventsHighlights
                events={mergedEvents}
                bcccEvents={bcccEvents}
                cityEvents={cityEvents}
            />

            <AvailabilityStrip venueOptions={venueOptions} />

            <SpecialOffers items={mergedOffers} />

            <OfficialPublicQuickLinks />

            <LocationAssistance />
        </PublicLayout>
    );
}
