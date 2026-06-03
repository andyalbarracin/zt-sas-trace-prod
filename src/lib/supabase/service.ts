// service.ts — src/lib/supabase/service.ts
// Cliente Supabase con clave de servicio (bypassa RLS). Solo usar en Server Components y API routes.

import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  );
}
