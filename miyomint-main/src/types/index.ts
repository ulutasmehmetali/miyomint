// 🛍️ Ürün tipi
export interface Product {
  id: string;
  name: string;
  weight?: string;
  price: number;
  originalPrice?: number;
  savings?: string;
  image: string;
  quantity?: number;
}

// 🛒 Sepet öğesi (Supabase ve misafir sepeti ile uyumlu)
export interface CartItem {
  id?: string;
  user_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// ❓ Sık Sorulan Sorular (FAQ)
export interface FAQ {
  question: string;
  answer: string;
}

 // 👤 Kullanıcı Profili
 // 👤 Kullanıcı Profili
export interface User {
    id: string;
    email?: string; // verify sayfası için eklendi
    full_name: string;
    email_verified?: boolean;
    verification_token?: string | null;
    verification_expires_at?: string | null;
    verified_at?: string | null;
    created_at?: string;
}

// 📦 Sipariş kalemi
export interface OrderItem {
  id?: string;
  order_id?: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
}

// 💳 Sipariş
export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  items?: OrderItem[];
}

// 🧭 Uygulama sayfa anahtarları
export type PageKey =
  | "home"
  | "products"
  | "faq"
  | "about"
  | "contact"
  | "profile"
  | "orders"
  | "support"
  | "verify"
  | "recovery";
