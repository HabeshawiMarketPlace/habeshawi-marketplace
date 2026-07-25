import RentalCategoryPage from "@/components/housing/RentalCategoryPage";

export const dynamic = "force-dynamic";

export default function RoomsPage() {
  return (
    <RentalCategoryPage
      title="Rooms for Rent"
      description="Browse approved private rooms, furnished rooms, and shared-home rentals."
      propertyType="Room"
      emptyMessage="No rooms are available right now"
    />
  );
}
