import AmenitiesRow from '@/components/public/amenities-row';
import AvailabilityStrip from '@/components/public/availability-strip';
import EventsCinemaShowcase from '@/components/public/events-cinema-showcase';
import FacilitiesLayeredShowcase from '@/components/public/facilities-layered-showcase';
import HeroAvailabilityBar from '@/components/public/hero-availability-bar';
import HeroBanner from '@/components/public/hero-banner';
import LocationAssistance from '@/components/public/location-assistance';
import OfficialPublicQuickLinks from '@/components/public/official-public-quick-links';
import SpecialOffers from '@/components/public/special-offers';
import StatsBanner from '@/components/public/stats-banner';
import TourismMembersShowcase from '@/components/public/tourism-members-showcase';
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

type TourismMemberItem = {
    id?: number | string;
    title?: string | null;
    name?: string | null;
    position?: string | null;
    role?: string | null;
    description?: string | null;
    bio?: string | null;
    image?: string | null;
    image_url?: string | null;
    image_path?: string | null;
    homepage_visible?: boolean | number | string | null;
    homepageVisible?: boolean;
    is_active?: boolean | number | string | null;
    [key: string]: unknown;
};

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
    members?: TourismMemberItem[];
    tourismMembers?: TourismMemberItem[];
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
    members = [],
    tourismMembers = [],
}: Props) {
    const mergedEvents = events.length > 0 ? events : [...bcccEvents, ...cityEvents];
    const mergedSpaces = spaces.length > 0 ? spaces : venueSpaces.length > 0 ? venueSpaces : facilities;
    const mergedOffers = offers.length > 0 ? offers : packages;
    const mergedMembers = members.length > 0 ? members : tourismMembers;

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

            <AvailabilityStrip venueOptions={venueOptions} />

            <SpecialOffers items={mergedOffers} />

            <TourismMembersShowcase items={mergedMembers} />

            <OfficialPublicQuickLinks />

            <LocationAssistance />
        </PublicLayout>
    );
}
