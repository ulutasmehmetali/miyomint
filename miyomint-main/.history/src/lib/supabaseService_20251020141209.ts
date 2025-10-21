import { supabase } from "./supabaseClient";
import { CartItem, Order, User } from "../types"; // ✅ Tek tip kaynağı kullanıyoruz

export const supabaseService = {
  // 🧑‍💻 PROFİL ---------------------------------------------------------
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .limit(1)
      .single();

    // ⚠️ "PGRST116" -> No rows found hatası, hata değil.
    if (error && error.code !== "PGRST116") throw error;

    return (data as User) ?? null;
  },

  async createProfile(profile: Partial<User> & { id: string; email: string }) {
    const payload = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name ?? "",
      created_at: profile.created_at ?? new Date().toISOString(),
      email_verified: profile.email_verified ?? false,
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProfile(userId: string, patch: Partial<User>) {
    const { data, error } = await supabase
      .from("profiles")
      .update(patch)
      .eq("id", userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // 🛒 SEPET -----------------------------------------------------------
  async getCart(userId: string): Promise<CartItem[]> {
    const { data, error } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", userId);
    if (error) throw error;
    return (data || []) as CartItem[];
  },

  async addToCart(item: CartItem) {
    const { error } = await supabase.from("cart").insert([item]);
    if (error) throw error;
  },

  async updateCartItem(itemId: string, quantity: number) {
    const { error } = await supabase
      .from("cart")
      .update({ quantity })
      .eq("id", itemId);
    if (error) throw error;
  },

  async removeCartItem(itemId: string) {
    const { error } = await supabase.from("cart").delete().eq("id", itemId);
    if (error) throw error;
  },

  async clearCart(userId: string) {
    const { error } = await supabase.from("cart").delete().eq("user_id", userId);
    if (error) throw error;
  },

  // 🧾 MİSAFİR SEPETİ (guest_cart) ------------------------------------
  async getGuestCart(): Promise<CartItem[]> {
    const { data, error } = await supabase.from("guest_cart").select("*");
    if (error) throw error;
    return (data || []) as CartItem[];
  },

  async addGuestCartItem(item: CartItem) {
    const { error } = await supabase.from("guest_cart").insert([item]);
    if (error) throw error;
  },

  async updateGuestCartItem(itemId: string, quantity: number) {
    const { error } = await supabase
      .from("guest_cart")
      .update({ quantity })
      .eq("id", itemId);
    if (error) throw error;
  },

  async removeGuestCartItem(itemId: string) {
    const { error } = await supabase.from("guest_cart").delete().eq("id", itemId);
    if (error) throw error;
  },

  async clearGuestCart() {
    const { error } = await supabase.from("guest_cart").delete();
    if (error) throw error;
  },

  // 🧾 MİSAFİR SİPARİŞLERİ -------------------------------------------
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
        note: order.note ?? "",
        total_amount: order.total_amount,
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
  },

  async addGuestOrderItem(item: {
    order_id: string;
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }) {
    const { error } = await supabase.from("guest_order_items").insert([
      {
        order_id: item.order_id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? "",
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
  },

  // 💳 SİPARİŞLER -----------------------------------------------------
  async saveOrder(order: Order) {
    // önce orders tablosuna ekle
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

    // ardından order_items tablosuna ürünleri ekle
    if (order.items && order.items.length > 0) {
      const itemsToInsert = order.items.map((item) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);
      if (itemsError) throw itemsError;
    }

    return orderData;
  },

  async getOrders(userId: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as Order[];
  },

  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId);
    if (error) throw error;
  },
};
