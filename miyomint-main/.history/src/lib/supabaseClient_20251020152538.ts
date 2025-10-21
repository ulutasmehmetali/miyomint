import { createClient } from "@supabase/supabase-js";

// 🌍 Ortam değişkenlerini al
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// ⚠️ Kontrol
if (!supabaseUrl) console.error("❌ HATA: Supabase URL bulunamadı!");
if (!supabaseAnonKey) console.error("❌ HATA: Supabase Key bulunamadı!");

// 🚀 Supabase istemcisi oluştur (tarayıcı uyumlu)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (...args) => fetch(...args),
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce", // ✅ yeni Supabase auth akışı
  },
});

console.log("🔍 ENV URL:", import.meta.env.VITE_SUPABASE_URL);
console.log(
  "🔍 ENV KEY:",
  import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 10),
  "..."
);
console.log("✅ Supabase client başlatıldı:", supabaseUrl);
