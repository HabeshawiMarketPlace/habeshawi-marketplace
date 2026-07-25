import RentalCategoryPage from "@/components/housing/RentalCategoryPage";

export const dynamic = "force-dynamic";

export default function RoommatesPage() {
  return (
    <RentalCategoryPage
      title="Roommate Listings"
      description="Find people offering shared housing or looking for a compatible roommate."
      propertyType="Roommate"
      emptyMessage="No roommate listings are available right now"
    />
  );
}
