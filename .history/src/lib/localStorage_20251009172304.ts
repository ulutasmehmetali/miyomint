// src/lib/localStorage.ts
export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;

  // ✅ yeni alanlar
  email_verified?: boolean;
  verification_token?: string;
  verification_expires_at?: string; // ISO
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  created_at: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const USERS_KEY = 'miyomint_users';
const CURRENT_USER_KEY = 'miyomint_current_user';
const ORDERS_KEY = 'miyomint_orders';
const CART_KEY = 'miyomint_cart';

export const localStorageService = {
  getUsers(): User[] {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : [];
  },

  saveUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  },

  updateUserById(userId: string, patch: Partial<User>) {
    const users = this.getUsers();
    const i = users.findIndex(u => u.id === userId);
    if (i !== -1) {
      users[i] = { ...users[i], ...patch };
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      const cur = this.getCurrentUser();
      if (cur?.id === userId) this.setCurrentUser(users[i]);
    }
  },

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  },

  // ✅ token ile kullanıcı bulma
  getUserByVerificationToken(token: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.verification_token === token) || null;
  },

  // ✅ doğrulama işaretleme
  markUserVerified(userId: string) {
    this.updateUserById(userId, {
      email_verified: true,
      verification_token: undefined,
      verification_expires_at: undefined,
    });
  },

  getCurrentUser(): User | null {
    const user = localStorage.getItem(CURRENT_USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  setCurrentUser(user: User | null): void {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  },

  getOrders(): Order[] {
    const orders = localStorage.getItem(ORDERS_KEY);
    return orders ? JSON.parse(orders) : [];
  },

  saveOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },

  getOrdersByUserId(userId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(o => o.user_id === userId);
  },

  getCart(): CartItem[] {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
  },

  saveCart(items: CartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  },

  clearCart(): void {
    localStorage.removeItem(CART_KEY);
  },

  updateOrderStatus(orderId: string, status: string): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index].status = status;
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  }
};
