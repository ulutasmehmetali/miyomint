import { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Cart from "./components/Cart";
import FlashSaleBanner from "./components/FlashSaleBanner";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import ForgotPasswordModal from "./components/ForgotPasswordModal";
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
import VerifyPage from "./pages/VerifyPage";
import RecoveryPage from "./pages/RecoveryPage";
import NewPasswordPage from "./pages/NewPasswordPage"; // ✅ Yeni eklendi
import { useAuth } from "./contexts/AuthContext";
import { supabaseService } from "./lib/supabaseService";
import { Product, CartItem, Order } from "./types";

function AppContent() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // 🛒 Supabase'den sepeti yükle
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const data = await supabaseService.getCart(user.id);
        setCartItems(data);
      } catch (err) {
        console.error("Sepet yüklenirken hata:", err);
      }
    };
    fetchCart();
  }, [user]);

  // 💾 Supabase’e kaydet (react state değiştiğinde)
  useEffect(() => {
    const saveCart = async () => {
      if (!user) return;
      try {
        await supabaseService.clearCart(user.id);
        for (const item of cartItems) {
          if (!item.product_id) continue;
          await supabaseService.addToCart({
            user_id: user.id,
            product_id: item.product_id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          });
        }
      } catch (err) {
        console.error("Sepet kaydedilemedi:", err);
      }
    };
    if (cartItems.length > 0) saveCart();
  }, [cartItems, user]);

  // 🛍️ Sepete ekle
  const handleAddToCart = async (product: Product): Promise<void> => {
    if (!product?.id) return;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product_id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      const guestItem: CartItem = {
        user_id: user?.id ?? "guest",
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      };
      return [...prev, guestItem];
    });
    setCartOpen(true);
  };

  // 💸 Hemen satın al
  const handleBuyNow = async (product: Product): Promise<void> => {
    await handleAddToCart(product);
    setTimeout(() => {
      setCartOpen(true);
      handleCheckout();
    }, 300);
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  // 💳 Ödeme işlemleri
  const handleCheckout = () => {
    if (!user) {
      setCheckoutModalOpen(true);
      return;
    }
    completeCheckout();
  };

  const handleGuestCheckout = () => {
    setCheckoutModalOpen(false);
    setLoginOpen(false);
    setCartOpen(false);
    navigate("/guest-checkout");
  };

  const handleLoginForCheckout = () => {
    setCheckoutModalOpen(false);
    setLoginOpen(true);
  };

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
        items: cartItems
          .filter((item) => item.product_id)
          .map((item) => ({
            product_id: item.product_id!,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
        created_at: new Date().toISOString(),
      };

      await supabaseService.saveOrder(newOrder);

      setCartItems([]);
      await supabaseService.clearCart(user.id);
      setCartOpen(false);
      alert(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}`);
      navigate("/orders");
    } catch (error: unknown) {
      console.error("Checkout error:", error);
      alert("Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="relative min-h-screen bg-white">
      <div className="fixed top-0 left-0 w-full z-50">
        <FlashSaleBanner />
      </div>

      <div className="pt-14">
        <Header
          currentPage="home"
          onNavigate={(page) => navigate(`/${page}`)}
          cartItemCount={cartItemCount}
          onCartClick={() => setCartOpen(true)}
          onLoginClick={() => setLoginOpen(true)}
        />

        <main className="min-h-screen">
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onNavigate={(page) => navigate(`/${page}`)}
                />
              }
            />
            <Route
              path="/home"
              element={
                <HomePage
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                  onNavigate={(page) => navigate(`/${page}`)}
                />
              }
            />
            <Route
              path="/products"
              element={
                <ProductsPage
                  onAddToCart={handleAddToCart}
                  onBuyNow={handleBuyNow}
                />
              }
            />
            <Route
              path="/guest-checkout"
              element={
                cartItems.length === 0 ? (
                  <GuestRedirectPage
                    onCompleteRedirect={() => navigate("/products")}
                  />
                ) : (
                  <GuestCheckoutPage
                    items={cartItems}
                    onCancel={() => {
                      setCartOpen(true);
                      if (window.history.length > 1) {
                        navigate(-1);
                      } else {
                        navigate("/");
                      }
                    }}
                    onClearCart={() => setCartItems([])}
                  />
                )
              }
            />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/verify" element={<VerifyPage />} />
            <Route path="/new-password" element={<NewPasswordPage />} /> {/* ✅ Eklendi */}
            <Route path="/recovery" element={<RecoveryPage />} />
          </Routes>
        </main>

        <Footer onNavigate={(page) => navigate(`/${page}`)} />
      </div>

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      {/* 🔐 Login / Signup / Şifre Sıfırlama */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
        onForgotPassword={() => {
          setLoginOpen(false);
          setForgotPasswordOpen(true);
        }}
      />

      <SignupModal
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
        onSwitchToLogin={() => {
          setSignupOpen(false);
          setLoginOpen(true);
        }}
        onForgotPassword={() => {
          setSignupOpen(false);
          setForgotPasswordOpen(true);
        }}
      />

      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onGuestCheckout={handleGuestCheckout}
        onLoginCheckout={handleLoginForCheckout}
      />

      <Toaster position="top-right" />
    </div>
  );
}

// 🌍 Router & Auth Provider
export default function App() {
  return <AppContent />;
}
