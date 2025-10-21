import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import FlashSaleBanner from "./components/FlashSaleBanner";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import CheckoutModal from "./components/CheckoutModal";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import FAQPage from "./pages/FAQPage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import ProfilePage from "./pages/ProfilePage";
import OrdersPage from "./pages/OrdersPage";
import SupportPage from "./pages/SupportPage";
import GuestCheckoutPage from "./pages/GuestCheckoutPage";
import GuestRedirectPage from "./pages/GuestRedirectPage";
import { supabaseService } from "./lib/supabaseService";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Product, CartItem, Order } from "./types";

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // 🛒 Supabase’ten sepeti yükle
  useEffect(() => {
    if (!user) return;
    const fetchCart = async () => {
      try {
        const data = await supabaseService.getCart(user.id);
        setCartItems(data || []);
      } catch (err) {
        console.error("Sepet yüklenirken hata:", err);
      }
    };
    fetchCart();
  }, [user]);

  // 🛍️ Sepete ürün ekle
  const handleAddToCart = async (product: Product) => {
    if (!user) {
      setLoginOpen(true);
      return;
    }

    const existing = cartItems.find((item) => item.product_id === product.id);
    let updatedCart: CartItem[];

    if (existing) {
      updatedCart = cartItems.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      setCartItems(updatedCart);
      await supabaseService.updateCartItem(existing.id!, existing.quantity + 1);
    } else {
      const newItem: CartItem = {
        user_id: user.id,
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      };
      await supabaseService.addToCart(newItem);
      updatedCart = [...cartItems, newItem];
      setCartItems(updatedCart);
    }

    setCartOpen(true);
  };

  // 💸 Hemen satın al
  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
    setTimeout(() => {
      setCartOpen(true);
      handleCheckout();
    }, 300);
  };

  // 🧹 Ürün sil
  const handleRemoveItem = async (productId: string) => {
    const target = cartItems.find((i) => i.product_id === productId);
    if (target) {
      await supabaseService.removeCartItem(target.id!);
      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    }
  };

  // 🔄 Miktar güncelle
  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    const target = cartItems.find((i) => i.product_id === productId);
    if (!target) return;
    if (quantity <= 0) return handleRemoveItem(productId);

    await supabaseService.updateCartItem(target.id!, quantity);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  // 💳 Checkout işlemleri
  const handleCheckout = () => {
    if (!user) {
      setCheckoutModalOpen(true);
      return;
    }
    completeCheckout();
  };

  // 🔐 Giriş veya misafir seçenekleri
  const handleLoginForCheckout = () => {
    setCheckoutModalOpen(false);
    setLoginOpen(true);
  };

  const handleGuestCheckout = () => {
  setCheckoutModalOpen(false);
  setCurrentPage("guestRedirect"); // ✅ Misafir yönlendirme sayfasına geç
};


  // 🧾 Sipariş oluşturma (Supabase’e kayıt)
  const completeCheckout = async () => {
    if (!user) return;

    try {
      const orderNumber = `MYM${Date.now().toString().slice(-8)}`;
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const newOrder: Order = {
        id: crypto.randomUUID(),
        user_id: user.id,
        order_number: orderNumber,
        status: "pending",
        total_amount: totalAmount,
        created_at: new Date().toISOString(),
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      };

      await supabaseService.saveOrder(newOrder);
      await supabaseService.clearCart(user.id);

      setCartItems([]);
      setCartOpen(false);
      alert(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}`);
      setCurrentPage("orders");
    } catch (error: any) {
      console.error("Checkout error:", error);
      alert("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cartItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // 🔄 Sayfa geçiş sistemi
  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return (
          <HomePage
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onNavigate={handleNavigate}
          />
        );

      case "guestRedirect":
        return (
          <GuestRedirectPage
            onCompleteRedirect={() => setCurrentPage("guestCheckout")}
          />
        );

      case "guestCheckout":
        return (
          <GuestCheckoutPage
            onCancel={() => handleNavigate("cart")}
            onPaymentRedirect={() =>
              setTimeout(() => handleNavigate("orders"), 3000)
            }
          />
        );

      case "products":
        return (
          <ProductsPage
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
          />
        );

      case "faq":
        return <FAQPage />;

      case "about":
        return <AboutPage />;

      case "contact":
        return <ContactPage />;

      case "profile":
        return <ProfilePage />;

      case "orders":
        return <OrdersPage />;

      case "support":
        return <SupportPage />;

      default:
        return (
          <HomePage
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 🔥 Üstte banner */}
      <FlashSaleBanner />

      {/* 🧭 Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
      />

      {/* 🌐 Sayfa içeriği */}
      <main className="min-h-screen">{renderPage()}</main>

      {/* 🦶 Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* 🛒 Sepet */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* 🔑 Giriş / Kayıt */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
      />

      {/* 💳 Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onGuestCheckout={handleGuestCheckout}
        onLoginCheckout={handleLoginForCheckout}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
