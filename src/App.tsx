import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Cart from './components/Cart';
import FlashSaleBanner from './components/FlashSaleBanner';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import EmailVerificationModal from './components/EmailVerificationModal';
import CheckoutModal from './components/CheckoutModal';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import FAQPage from './pages/FAQPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import SupportPage from './pages/SupportPage';
import EmailVerifiedPage from './pages/EmailVerifiedPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { supabase } from './lib/supabase';
import { Product, CartItem } from './types';

function AppContent() {
  const { user, profile } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loginOpen, setLoginOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/email-verified') {
      setCurrentPage('email-verified');
      return;
    }

    const hash = window.location.hash;
    if (hash.includes('error=access_denied')) {
      const params = new URLSearchParams(hash.substring(1));
      const errorCode = params.get('error_code');
      const errorDescription = params.get('error_description');

      if (errorCode === 'otp_expired' || errorDescription?.includes('expired')) {
        setVerificationError('otp_expired');
        setVerificationModalOpen(true);
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
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
      prev.map((item) => (item.id === productId ? { ...item, quantity } : item))
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

  const handleGuestCheckout = () => {
    setCheckoutModalOpen(false);
    alert('Misafir olarak sipariş özelliği yakında eklenecek. Şimdilik lütfen giriş yapın.');
    setLoginOpen(true);
  };

  const handleLoginForCheckout = () => {
    setCheckoutModalOpen(false);
    setLoginOpen(true);
  };

  const completeCheckout = async () => {
    if (!user) return;

    try {
      const orderNumber = `MYM${Date.now().toString().slice(-8)}`;
      const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: orderNumber,
          status: 'pending',
          total_amount: totalAmount,
          shipping_address: {},
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          payment_status: 'pending',
        });

      if (orderError) throw orderError;

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to: user.email,
          orderNumber,
          items: cartItems.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
          })),
          totalAmount,
          customerName: profile?.full_name || 'Değerli Müşterimiz',
        }),
      });

      setCartItems([]);
      setCartOpen(false);
      alert(`Siparişiniz alındı! Sipariş numaranız: ${orderNumber}\n\nE-posta adresinize onay mesajı gönderildi.`);
      handleNavigate('orders');
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onNavigate={handleNavigate} />;
      case 'products':
        return <ProductsPage onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} />;
      case 'faq':
        return <FAQPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'profile':
        return <ProfilePage />;
      case 'orders':
        return <OrdersPage />;
      case 'support':
        return <SupportPage />;
      case 'email-verified':
        return <EmailVerifiedPage onNavigate={handleNavigate} onLoginClick={() => setLoginOpen(true)} />;
      default:
        return <HomePage onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        cartItemCount={cartItemCount}
        onCartClick={() => setCartOpen(true)}
        onLoginClick={() => setLoginOpen(true)}
      />
      <FlashSaleBanner />

      <main className="min-h-screen">
        {renderPage()}
      </main>

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

      <EmailVerificationModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        errorType={verificationError}
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
