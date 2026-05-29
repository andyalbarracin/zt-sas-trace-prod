// layout.tsx — src/app/(dashboard)/layout.tsx — 2026-05-19
// Layout principal del dashboard: sidebar + header + contenido

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export type Notification = {
  id: string;
  order_number: string;
  date_due: string;
  status: string;
  clients: { business_name: string } | null;
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

  const [{ data: profile }, { data: notifRaw }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, email, role, avatar_url, created_at, updated_at")
      .eq("id", user.id)
      .single(),
    supabase
      .from("work_orders")
      .select("id, order_number, date_due, status, clients(business_name)")
      .is("deleted_at", null)
      .not("date_due", "is", null)
      .not("status", "in", '("facturada","cancelada","remitido")')
      .lte("date_due", sevenDaysFromNow.toISOString().split("T")[0])
      .order("date_due", { ascending: true })
      .limit(15),
  ]);

  const notifications = (notifRaw ?? []) as Notification[];

  return (
    <div className="flex h-screen overflow-hidden bg-sas-bg">
      <Sidebar profile={profile} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header notifications={notifications} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
