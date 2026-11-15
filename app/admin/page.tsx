import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { getAdminSession } from "@/lib/auth";
import { getGallery } from "@/lib/gallery";
import { getInventory } from "@/lib/inventory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [products, gallery] = await Promise.all([
    getInventory(),
    getGallery()
      .then((photos) => ({ photos, available: true }))
      .catch(() => ({ photos: [], available: false })),
  ]);

  return (
    <AdminDashboard
      initialProducts={products}
      initialGallery={gallery.photos}
      galleryAvailable={gallery.available}
      username={session.username}
    />
  );
}
