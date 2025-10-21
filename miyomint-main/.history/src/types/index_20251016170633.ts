// ✅ src/types/index.ts

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

// ❓ Sık Sorulan Sorular (FAQ)
export interface FAQ {
  question: string;
  answer: string;
}

// 🛒 Sepet öğesi (Supabase ve App.tsx ile uyumlu)
export interface CartItem {
  id?: string;          // Supabase cart tablosu ID
  user_id: string;      // kullanıcı kimliği
  product_id: string;   // ürün kimliği
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

// 👤 Kullanıcı Profili
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  email_verified?: boolean;
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
