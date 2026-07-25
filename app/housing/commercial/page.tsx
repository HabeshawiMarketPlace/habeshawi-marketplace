import RentalCategoryPage from "@/components/housing/RentalCategoryPage";

export const dynamic = "force-dynamic";

export default function CommercialPropertiesPage() {
  return (
    <RentalCategoryPage
      title="Commercial Properties"
      description="Browse restaurants, retail storefronts, offices, warehouses, salons, medical spaces, churches, daycares, and other business locations."
      propertyType="Commercial"
      emptyMessage="No commercial properties are available right now"
    />
  );
}
