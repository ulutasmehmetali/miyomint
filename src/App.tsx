import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import Cart from "./components/Cart";
import CheckoutModal from "./components/CheckoutModal";
import FlashSaleBanner from "./components/FlashSaleBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { supabaseService } from "./lib/supabaseService";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import FAQPage from "./pages/FAQPage";
import GuestCheckoutPage from "./pages/GuestCheckoutPage";
import GuestRedirectPage from "./pages/GuestRedirectPage";
import HomePage from "./pages/HomePage";
import OrdersPage from "./pages/OrdersPage";
import ProductsPage from "./pages/ProductsPage";
import ProfilePage from "./pages/ProfilePage";
import SupportPage from "./pages/SupportPage";
import VerifyPage from "./pages/VerifyPage";
import { CartItem, Order, Product } from "./types";

const GUEST_CART_STORAGE_KEY = "miyomint-guest-cart";

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    if (window.location.pathname.includes("/verify")) {
      setCurrentPage("verify");
    }
  }, []);

  useEffect(() => {
    if (!user) {
      if (typeof window === "undefined") {
        return;
      }
      try {
        const raw = window.localStorage.getItem(GUEST_CART_STORAGE_KEY);
        setCartItems(raw ? (JSON.parse(raw) as CartItem[]) : []);
      } catch (error) {
        console.error("Misafir sepeti okunamadi:", error);
        setCartItems([]);
      }
      return;
    }

    const fetchCart = async () => {
      try {
        const data = await supabaseService.getCart(user.id);
        setCartItems(data || []);
      } catch (error) {
        console.error("Sepet yuklenirken hata:", error);
        setCartItems([]);
      }
    };

    fetchCart();
  }, [user]);

  useEffect(() => {
    if (user) {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    try {
      if (cartItems.length === 0) {
        window.localStorage.removeItem(GUEST_CART_STORAGE_KEY);
      } else {
        window.localStorage.setItem(
          GUEST_CART_STORAGE_KEY,
          JSON.stringify(cartItems)
        );
      }
    } catch (error) {
      console.error("Misafir sepeti kaydedilemedi:", error);
    }
  }, [cartItems, user]);

  const handleAddToCart = async (product: Product) => {
    if (!product?.id) {
      return;
    }

    const previousCart = [...cartItems];
    const existing = cartItems.find(
      (item) => item.product_id === product.id
    );

    let nextCart: CartItem[];
    if (existing) {
      nextCart = cartItems.map((item) =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      const newItem: CartItem = {
        user_id: user?.id ?? "guest",
        product_id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
      };
      nextCart = [...cartItems, newItem];
    }

    setCartItems(nextCart);
    setCartOpen(true);

    if (!user) {
      toast.success(`${product.name} sepete eklendi.`);
      return;
    }

    try {
      if (existing?.id) {
        await supabaseService.updateCartItem(
          existing.id,
          existing.quantity + 1
        );
      } else {
        await supabaseService.addToCart({
          user_id: user.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          image: product.image,
        });
      }

      const syncedCart = await supabaseService.getCart(user.id);
      setCartItems(syncedCart || nextCart);
      toast.success(`${product.name} sepete eklendi.`);
    } catch (error) {
      console.error("Sepete eklenirken hata:", error);
      setCartItems(previousCart);
      toast.error("Urun sepete eklenemedi.");
    }
  };

  const handleBuyNow = async (product: Product) => {
    try {
      await handleAddToCart(product);
      setCartOpen(false);
      setCheckoutModalOpen(true);
    } catch (error) {
      console.error("Satin alma hatasi:", error);
      toast.error("Satin alma baslatilamadi.");
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const target = cartItems.find((item) => item.product_id === productId);
    if (!target) {
      return;
    }

    const previousCart = [...cartItems];
    setCartItems((prev) =>
      prev.filter((item) => item.product_id !== productId)
    );

    if (!user) {
      return;
    }

    try {
      if (target.id) {
        await supabaseService.removeCartItem(target.id);
      }
      const syncedCart = await supabaseService.getCart(user.id);
      setCartItems(syncedCart || []);
    } catch (error) {
      console.error("Urun sepetten silinemedi:", error);
      setCartItems(previousCart);
      toast.error("Urun sepetten silinemedi.");
    }
  };

  const handleUpdateQuantity = async (
    productId: string,
    quantity: number
  ) => {
    if (quantity <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    const target = cartItems.find((item) => item.product_id === productId);
    if (!target) {
      return;
    }

    const previousCart = [...cartItems];
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );

    if (!user) {
      return;
    }

    try {
      if (target.id) {
        await supabaseService.updateCartItem(target.id, quantity);
      }
    } catch (error) {
      console.error("Miktar guncellenemedi:", error);
      setCartItems(previousCart);
      toast.error("Miktar guncellenemedi.");
    }
  };

  const handleCheckout = () => {
    setCartOpen(false);
    if (!user) {
      setCheckoutModalOpen(true);
      return;
    }

    void completeCheckout();
  };

  const handleLoginForCheckout = () => {
    setCheckoutModalOpen(false);
    setLoginOpen(true);
  };

  const handleGuestCheckout = () => {
    setCartOpen(false);
    setLoginOpen(false);
    setCheckoutModalOpen(false);
    setCurrentPage("guestRedirect");
  };

  const completeCheckout = async () => {
    if (!user) {
      return;
    }

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
      toast.success(`Siparisiniz alindi! #${orderNumber}`);
      setCurrentPage("orders");
    } catch (error) {
      console.error("Checkout hatasi:", error);
      toast.error("Siparis olusturulurken bir hata olustu.");
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
      case "guestRedirect":
        return (
          <GuestRedirectPage
            onCompleteRedirect={() => setCurrentPage("guestCheckout")}
          />
        );
      case "guestCheckout":
        return (
          <GuestCheckoutPage
            items={cartItems}
            onCancel={() => handleNavigate("home")}
            onPaymentRedirect={() =>
              setTimeout(() => handleNavigate("orders"), 3000)
            }
            onClearCart={() => setCartItems([])}
          />
        );
      case "verify":
        return <VerifyPage />;
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
      {currentPage !== "verify" && <FlashSaleBanner />}
      {currentPage !== "verify" && (
        <Header
          currentPage={currentPage}
          onNavigate={handleNavigate}
          cartItemCount={cartItemCount}
          onCartClick={() => setCartOpen(true)}
          onLoginClick={() => setLoginOpen(true)}
        />
      )}

      <main className="min-h-screen">{renderPage()}</main>

      {currentPage !== "verify" && <Footer onNavigate={handleNavigate} />}

      {currentPage !== "verify" && (
        <>
          <Cart
            isOpen={cartOpen}
            items={cartItems}
            onClose={() => setCartOpen(false)}
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
        </>
      )}

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
