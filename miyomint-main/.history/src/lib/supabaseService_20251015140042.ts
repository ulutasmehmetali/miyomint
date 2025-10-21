import { supabase } from "./supabaseClient";
import { CartItem, Order, OrderItem, User } from "../types";

// 🧩 Supabase Servisleri
export const supabaseService = {
  // 👤 PROFİL — GETİR
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data as User;
  },

  // 👤 PROFİL — OLUŞTUR (signUp sonrası)
  async createProfile(profile: User) {
    const { error } = await supabase.from("profiles").insert([
      {
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        created_at: profile.created_at,
        email_verified: profile.email_verified ?? false,
      },
    ]);
    if (error) throw error;
  },

  // 👤 PROFİL — GÜNCELLE
  async updateProfile(userId: string, patch: Partial<User>) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    if (error) throw error;
  },

  // 🛒 SEPET — GETİR
  async getCart(userId: string) {
    const { data, error } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return data as CartItem[];
  },

  // 🛒 SEPET — ÜRÜN EKLE
  async addToCart(item: CartItem) {
    const { error } = await supabase.from("cart").insert([
      {
        user_id: item.user_id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      },
    ]);
    if (error) throw error;
  },

  // 🛒 SEPET — ÜRÜN GÜNCELLE
  async updateCartItem(itemId: string, quantity: number) {
    const { error } = await supabase.from("cart").update({ quantity }).eq("id", itemId);
    if (error) throw error;
  },

  // 🛒 SEPET — ÜRÜN SİL
  async removeCartItem(itemId: string) {
    const { error } = await supabase.from("cart").delete().eq("id", itemId);
    if (error) throw error;
  },

  // 🛒 SEPET — TEMİZLE
  async clearCart(userId: string) {
    const { error } = await supabase.from("cart").delete().eq("user_id", userId);
    if (error) throw error;
  },

  // 💳 SİPARİŞ — KAYDET
  async saveOrder(order: Order) {
    // 1️⃣ "orders" tablosuna kayıt
    const { data: orderData, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          id: order.id,
          user_id: order.user_id,
          order_number: order.order_number,
          status: order.status,
          total_amount: order.total_amount,
          created_at: order.created_at,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    // 2️⃣ "order_items" tablosuna ürünleri ekle
    if (order.items && order.items.length > 0) {
      const itemsToInsert = order.items.map((item: OrderItem) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    return orderData;
  },

  // 💳 SİPARİŞ — GETİR
  async getOrders(userId: string) {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Order[];
  },

  // 💳 SİPARİŞ — DURUM GÜNCELLE
  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) throw error;
  },

  // 🧾 Misafir siparişi oluştur (guest_orders tablosuna kayıt)
  async addGuestOrder(order: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    note?: string;
    total_amount: number;
  }) {
    const { error } = await supabase.from("guest_orders").insert([
      {
        id: order.id,
        full_name: order.full_name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        city: order.city,
        district: order.district,
        note: order.note || null,
        total_amount: order.total_amount,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return { error };
  },

  // 🛍️ Misafir siparişine ürün ekle (guest_order_items tablosu)
  async addGuestOrderItem(item: {
    order_id: string;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
  }) {
    const { error } = await supabase.from("guest_order_items").insert([
      {
        order_id: item.order_id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ]);
    if (error) throw error;
    return { error };
  },

  // 🛒 Misafir sepetine ürün ekle (login olmayan kullanıcılar)
  async addGuestCartItem(item: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }) {
    const { error } = await supabase.from("guest_order_items").insert([
      {
        order_id: "guest_cart",
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image || null,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
    return { error };
  },

  // 🧾 Misafir sepetini getir
  async getGuestCart(): Promise<{ data: any[] | null; error: any | null }> {
    const { data, error } = await supabase
      .from("guest_order_items")
      .select("*")
      .eq("order_id", "guest_cart")
      .order("created_at", { ascending: false });
    return { data, error };
  },
};
