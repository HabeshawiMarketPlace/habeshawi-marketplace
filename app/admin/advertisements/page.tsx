import { redirect } from "next/navigation";

export default function OldAdvertisementsAdminPage() {
  redirect("/admin?section=promotions");
}