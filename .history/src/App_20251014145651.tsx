import { useState, useEffect } from "react";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { localStorageService, Order } from "./lib/localStorage";
import { Product, CartItem } from "./types";

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  // 🛒 Sepet yükleme
  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem("cart")) ||
      JSON.parse(localStorage.getItem("cartItems")) ||
      [];
    if (savedCart.length > 0) setCartItems(savedCart);
  }, []);

  // 💾 Sepet kaydetme
  useEffect(() => {
    localStorageService.saveCart(cartItems);
  }, [cartItems]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setCartOpen(true);
  };

  const handleBuyNow = (product: Product) => {
    handleAddToCart(product);
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleCheckout = () => {
    if (!user) {
      setCheckoutModalOpen(true);
      return;
    }
    completeCheckout();
  };

  // 💳 Misafir ödeme akışı (popup yok, sayfa geçişi var)
  const handleGuestCheckout = () => {
    setCheckoutModalOpen(false);
    setCurrentPage("guestRedirect");
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
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        created_at: new Date().toISOString(),
      };

      localStorageService.saveOrder(newOrder);
      setCartItems([]);
      localStorageService.clearCart();
      setCartOpen(false);
      alert(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}`);
      handleNavigate("orders");
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

  // 🔄 Sayfa render sistemi
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

      <Cart
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

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
