import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, localStorageService } from '../lib/localStorage';

interface AuthError {
  message: string;
  name?: string;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ ilk yüklemede mevcut kullanıcıyı al
  useEffect(() => {
    const currentUser = localStorageService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  // ✅ basit token üretici
  function makeToken(len = 48) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < len; i++) token += chars[Math.floor(Math.random() * chars.length)];
    return token;
  }

  // ✅ kullanıcı kaydı
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const existingUser = localStorageService.getUserByEmail(email);
      if (existingUser) {
        return { error: { message: 'Bu e-posta adresi zaten kayıtlı.', name: 'UserExists', status: 400 } };
      }

      const token = makeToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 saat

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
        email_verified: false,
        verification_token: token,
        verification_expires_at: expiresAt,
      };

      // (demo) şifreyi ayrı sakla
      localStorage.setItem(`user_password_${newUser.id}`, password);

      localStorageService.saveUser(newUser);
      localStorageService.setCurrentUser(newUser);
      setUser(newUser);

      // ✅ doğrulama linki (hash route)
      const verificationUrl = `${window.location.origin}/#verify=${encodeURIComponent(token)}`;

      // ✅ Supabase Edge Function (Brevo SMTP)
      await fetch('https://nnkbpdhbczjrbqsfvord.supabase.co/functions/v1/rapid-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ua2JwZGhiY3pqcmJxc2Z2b3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MDMyMjcsImV4cCI6MjA3NTQ3OTIyN30.ho5_paTNtBhkd49wDDjjPVDTFq18dMxf1lStd3CYaJ8`,
        },
        body: JSON.stringify({
          kind: 'verification',
          email,
          full_name: fullName,
          verificationUrl,
        }),
      });

      return { error: null };
    } catch (error) {
      console.error('❌ SignUp error:', error);
      return { error: { message: 'Kayıt sırasında bir hata oluştu.', name: 'SignUpError', status: 500 } };
    }
  };

  // ✅ giriş işlemi
  const signIn = async (email: string, password: string) => {
    try {
      const user = localStorageService.getUserByEmail(email);
      if (!user) {
        return { error: { message: 'E-posta veya şifre hatalı.', name: 'InvalidCredentials', status: 401 } };
      }

      const storedPassword = localStorage.getItem(`user_password_${user.id}`);
      if (storedPassword !== password) {
        return { error: { message: 'E-posta veya şifre hatalı.', name: 'InvalidCredentials', status: 401 } };
      }

      // 🚨 e-posta doğrulaması yapılmadıysa girişe izin verme
      if (!user.email_verified) {
        return {
          error: { message: 'Lütfen önce e-posta adresinizi doğrulayın.', name: 'EmailNotVerified', status: 403 },
        };
      }

      localStorageService.setCurrentUser(user);
      setUser(user);
      return { error: null };
    } catch {
      return { error: { message: 'Giriş sırasında bir hata oluştu.', name: 'SignInError', status: 500 } };
    }
  };

  // ✅ çıkış işlemi
  const signOut = async () => {
    localStorageService.setCurrentUser(null);
    setUser(null);
  };

  // ✅ profil güncelleme
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    localStorageService.updateUserById(user.id, updates);
    const updatedUser = localStorageService.getCurrentUser();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Hook export
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
