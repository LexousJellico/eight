import AmenitiesRow from '@/components/public/amenities-row';
import EventsCinemaShowcase from '@/components/public/events-cinema-showcase';
import FacilitiesLayeredShowcase from '@/components/public/facilities-layered-showcase';
import HeroAvailabilityBar from '@/components/public/hero-availability-bar';
import HeroBanner from '@/components/public/hero-banner';
import LocationAssistance from '@/components/public/location-assistance';
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
    venueSpaces?: PublicSpaceItem[];
    facilities?: PublicSpaceItem[];
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
    venueSpaces = [],
    facilities = [],
    stats = [],
    offers = [],
    packages = [],
}: Props) {
    const mergedEvents = events.length > 0 ? events : [...bcccEvents, ...cityEvents];
    const mergedSpaces = spaces.length > 0 ? spaces : venueSpaces.length > 0 ? venueSpaces : facilities;
    const mergedOffers = offers.length > 0 ? offers : packages;

    return (
        <PublicLayout>
            <Head title="Baguio Convention and Cultural Center" />

            <HeroBanner />

            <HeroAvailabilityBar venueOptions={venueOptions} />

            <WelcomeSection />

            <StatsBanner items={stats} />

            <AmenitiesRow />

            <FacilitiesLayeredShowcase items={mergedSpaces} />

            <EventsCinemaShowcase
                items={mergedEvents}
                bcccEvents={bcccEvents}
                cityEvents={cityEvents}
            />

            <SpecialOffers items={mergedOffers} />

            <LocationAssistance />
        </PublicLayout>
    );
}
