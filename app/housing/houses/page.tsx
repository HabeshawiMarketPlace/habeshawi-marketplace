import RentalCategoryPage from "@/components/housing/RentalCategoryPage";

export const dynamic = "force-dynamic";

export default function HousesPage() {
  return (
    <RentalCategoryPage
      title="Houses"
      description="Find approved single-family homes and other house rentals."
      propertyType="House"
      emptyMessage="No house rentals are available right now"
    />
  );
}
