import toast, { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
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
import VerifyPage from "./pages/VerifyPage"; // ✅ eklendi
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

  // ✅ uygulama açıldığında /verify linkinden geldiyse bu sayfayı göster
  useEffect(() => {
    if (window.location.pathname.includes("/verify")) {
      setCurrentPage("verify");
    }
  }, []);

  // 🛒 Kullanıcı sepeti yükle
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
    try {
      if (!user) {
        // ✅ Misafir sepetine ekle
        await supabaseService.addGuestCartItem({
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        });

        // ✅ Toast bildirimi
        toast.success(`${product.name} sepete eklendi ✅`, {
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });

        setCartOpen(true);
        return;
      }

      // ✅ Giriş yapan kullanıcı için sepet işlemi
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

      // ✅ Toast bildirimi
      toast.success(`${product.name} sepete eklendi ✅`, {
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });

      setCartOpen(true);
    } catch (err) {
      console.error("Sepete eklenirken hata:", err);
      toast.error("Ürün sepete eklenemedi ❌");
    }
  };

  // ⚡ Hemen satın al → sadece sepete ekle, sonra checkout modal aç
  const handleBuyNow = async (product: Product) => {
    try {
      await handleAddToCart(product);
      setCartOpen(false); // sepeti kapat
      setCheckoutModalOpen(true); // login/misafir seçimi gelsin
    } catch (err) {
      console.error("Satın alma hatası:", err);
    }
  };

  // 🧹 Ürün sil (giriş yapmış kullanıcı sepeti için)
  const handleRemoveItem = async (productId: string) => {
    const target = cartItems.find((i) => i.product_id === productId);
    if (target) {
      await supabaseService.removeCartItem(target.id!);
      setCartItems((prev) => prev.filter((item) => item.product_id !== productId));
    }
  };

  // 🔄 Miktar güncelle (giriş yapmış kullanıcı sepeti için)
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

  // 💳 Sepeti tamamla → login/misafir modalını aç
  const handleCheckout = () => {
    setCartOpen(false);
    if (!user) {
      setCheckoutModalOpen(true);
      return;
    }
    completeCheckout();
  };

  // 🔐 Login veya misafir seçimi
  const handleLoginForCheckout = () => {
    setCheckoutModalOpen(false);
    setLoginOpen(true);
  };

  const handleGuestCheckout = () => {
    // 🧹 Tüm modalları kapat
    setCartOpen(false);
    setLoginOpen(false);
    setCheckoutModalOpen(false);

    // 🔀 Guest yönlendirme
    setCurrentPage("guestRedirect");
  };

  // 🧾 Sipariş oluşturma (giriş yapmış kullanıcı için)
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

  // 🔀 Sayfa geçişleri
  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cartItemCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // 🔄 Sayfa render
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
      case "verify": // ✅ eklendi
        return <VerifyPage />;
      case "guestRedirect":
        return (
          <GuestRedirectPage
            onCompleteRedirect={() => setCurrentPage("guestCheckout")}
          />
        );
      case "guestCheckout":
        return (
          <GuestCheckoutPage
            onCancel={() => handleNavigate("home")}
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
      <FlashSaleBanner />

      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
      />

      <main className="min-h-screen">{renderPage()}</main>

      <Footer onNavigate={handleNavigate} />

      {/* 🛒 Sepet */}
      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onCheckout={handleCheckout}
      />

      {/* 🔑 Login */}
      <LoginModal
        isOpen={loginOpen}
        onClose={() => setLoginOpen(false)}
        onSwitchToSignup={() => {
          setLoginOpen(false);
          setSignupOpen(true);
        }}
      />

      {/* 🧾 Signup */}
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

      {/* ✅ Toast container */}
      <Toaster position="top-right" reverseOrder={false} />
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
