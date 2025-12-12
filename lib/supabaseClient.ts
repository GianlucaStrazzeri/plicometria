"use client"

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  // Do not throw here; allow local dev w/o env set (docs cover how to add them)
  // but warn in console when used in client.
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.warn("Supabase public env vars are not set (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
