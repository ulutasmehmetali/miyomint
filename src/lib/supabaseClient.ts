import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL = "https://nnkbpdhbczjrbqsfvord.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua2JwZGhiY3pqcmJxc2Z2b3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDMyMjcsImV4cCI6MjA3NTQ3OTIyN30.ho5_paTNtBhkd49wDDjjPVDTFq18dMxf1lStd3CYaJ8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // kullanıcıyı oturumda tutar
    autoRefreshToken: true, // token’ları otomatik yeniler
    detectSessionInUrl: true, // URL’den token yakalar
  },
});
