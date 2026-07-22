import Categories from "@/components/Categories";
import CommunityServices from "@/components/CommunityServices";
import FeaturedBusinesses from "@/components/FeaturedBusinesses";
import FeaturedListings from "@/components/FeaturedListings";
import FeaturedPromotions from "@/components/FeaturedPromotions";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import LatestJobs from "@/components/LatestJobs";
import MarketplaceListings from "@/components/MarketplaceListings";
import RecentlyAdded from "@/components/RecentlyAdded";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f5] text-slate-900">
      <Header />

      <Hero />

      <Categories />

      <section
        id="rentals"
        className="border-t border-slate-200 bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-green-700">
              Rooms • Apartments • Houses • Commercial Spaces
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
              Featured Rentals
            </h2>

            <p className="mt-3 max-w-2xl text-slate-600">
              Browse featured rental opportunities available throughout the
              Habesha community.
            </p>
          </div>

          <FeaturedListings />
        </div>
      </section>

      <section
        id="marketplace"
        className="border-t border-slate-200 bg-[#f7f8f5]"
      >
        <MarketplaceListings />
      </section>

      <section
        id="jobs"
        className="border-t border-slate-200 bg-white"
      >
        <LatestJobs />
      </section>

      <section
        id="businesses"
        className="border-t border-slate-200 bg-[#f7f8f5]"
      >
        <FeaturedBusinesses />
      </section>

      <section
        id="community-services"
        className="border-t border-slate-200 bg-white"
      >
        <CommunityServices />
      </section>

      <section
        id="promotions"
        className="border-t border-slate-200 bg-[#f7f8f5]"
      >
        <FeaturedPromotions />
      </section>

      <section
        id="recently-added"
        className="border-t border-slate-200 bg-white"
      >
        <RecentlyAdded />
      </section>

      <Footer />
    </main>
  );
}