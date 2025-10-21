import { supabase } from "./supabaseClient";
import { CartItem, Order, User } from "../types";

export const supabaseService = {
  // 🧑‍💻 PROFİL ---------------------------------------------------------
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return (data as User) ?? null;
    } catch (err) {
      console.error("❌ getProfile hatası:", err);
      throw err;
    }
  },

  async createProfile(profile: Partial<User> & { id: string }) {
    if (!profile.id) throw new Error("❌ createProfile: user id eksik.");

    const payload = {
      id: profile.id,
      full_name: profile.full_name ?? "",
      email_verified: profile.email_verified ?? false,
      verification_token: profile.verification_token ?? null,
      verification_expires_at: profile.verification_expires_at ?? null,
      created_at: profile.created_at ?? new Date().toISOString(),
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

  // 🧾 MİSAFİR SEPETİ -------------------------------------------------
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

  // 💳 MİSAFİR SİPARİŞLERİ --------------------------------------------
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
        ...order,
        note: order.note ?? "",
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
        ...item,
        image: item.image ?? "",
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) throw error;
  },

  // 💳 SİPARİŞLER -----------------------------------------------------
  async saveOrder(order: Order) {
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

    if (order.items?.length) {
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
