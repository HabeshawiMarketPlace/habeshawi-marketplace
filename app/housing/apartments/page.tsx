import RentalCategoryPage from "@/components/housing/RentalCategoryPage";

export const dynamic = "force-dynamic";

export default function ApartmentsPage() {
  return (
    <RentalCategoryPage
      title="Apartments"
      description="Browse approved apartment rentals posted by owners and property managers."
      propertyType="Apartment"
      emptyMessage="No apartment rentals are available right now"
    />
  );
}
