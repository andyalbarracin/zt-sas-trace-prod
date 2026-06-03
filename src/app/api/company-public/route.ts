// route.ts — src/app/api/company-public/route.ts
// Endpoint público que devuelve datos básicos de la empresa (sin autenticación).

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sb = createServiceClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from("company_settings")
      .select("nombre, cuit, direccion, ciudad, email")
      .eq("id", 1)
      .single();

    return NextResponse.json(data ?? { nombre: "SAS Supplier", cuit: null, direccion: null, ciudad: null, email: null });
  } catch {
    return NextResponse.json({ nombre: "SAS Supplier", cuit: null, direccion: null, ciudad: null, email: null });
  }
}
