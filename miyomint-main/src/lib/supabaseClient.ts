// src/lib/supabaseClient.ts
import { createClient } from "@supabase/supabase-js";

// 🌍 Ortam değişkenlerini al
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

// ⚠️ Kontrol (çalışmazsa hata bastır)
if (!supabaseUrl) console.error("❌ Supabase URL bulunamadı!");
if (!supabaseAnonKey) console.error("❌ Supabase Anon Key bulunamadı!");

// 🚀 Supabase istemcisi oluştur
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (...args) => fetch(...args),
  },
  auth: {
    persistSession: true, // ✅ Tarayıcıda session sakla
    autoRefreshToken: true, // ✅ Token yenile
    detectSessionInUrl: true, // ✅ URL’de session yakala
    flowType: "pkce", // ✅ Yeni Supabase Auth akışı
  },
});

console.group("🧩 Supabase Client Başlatma Bilgileri");
console.log("🌍 ENV URL:", supabaseUrl);
console.log("🔑 ENV KEY:", supabaseAnonKey?.slice(0, 10) + "…");
console.log("⚙️ Supabase client oluşturuldu:", supabaseUrl);
console.groupEnd();
