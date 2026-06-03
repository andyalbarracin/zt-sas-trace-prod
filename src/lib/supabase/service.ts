// service.ts — src/lib/supabase/service.ts
// Cliente Supabase con clave de servicio (bypassa RLS). Solo usar en Server Components y API routes.

import { createClient } from "@supabase/supabase-js";

export function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { persistSession: false } }
  );
}
