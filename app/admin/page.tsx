"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Rental = {
  id: string;
  title: string;
  price: number;
  status: string;
  payment_status: string;
};

export default function AdminPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadRentals() {
    const { data, error } = await supabase
      .from("rentals")
      .select("id, title, price, status, payment_status")
      .order("created_at", { ascending: false });

    if (error) {
      alert(`Unable to load listings: ${error.message}`);
      setLoading(false);
      return;
    }

    setRentals(data ?? []);
    setLoading(false);
  }

  async function updateStatus(
    rentalId: string,
    newStatus: "approved" | "rejected"
  ) {
    const { error } = await supabase
      .from("rentals")
      .update({ status: newStatus })
      .eq("id", rentalId);

    if (error) {
      alert(`Unable to update listing: ${error.message}`);
      return;
    }

    setRentals((currentRentals) =>
      currentRentals.map((rental) =>
        rental.id === rentalId
          ? { ...rental, status: newStatus }
          : rental
      )
    );
  }

  useEffect(() => {
    loadRentals();
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-[#064d2b]">
        Admin Dashboard
      </h1>

      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-white shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="border p-3">Title</th>
                <th className="border p-3">Price</th>
                <th className="border p-3">Status</th>
                <th className="border p-3">Payment</th>
                <th className="border p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {rentals.map((rental) => (
                <tr key={rental.id}>
                  <td className="border p-3">{rental.title}</td>
                  <td className="border p-3">
                    ${Number(rental.price).toFixed(2)}
                  </td>
                  <td className="border p-3 capitalize">
                    {rental.status}
                  </td>
                  <td className="border p-3 capitalize">
                    {rental.payment_status}
                  </td>
                  <td className="border p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(rental.id, "approved")
                        }
                        className="rounded bg-green-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateStatus(rental.id, "rejected")
                        }
                        className="rounded bg-red-700 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {rentals.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="border p-6 text-center text-gray-500"
                  >
                    No housing listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}