import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "../lib/supabaseClient";
import { supabaseService } from "../lib/supabaseService";
import { User } from "../types";

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

  // ✅ İlk yüklemede oturum bilgisini kontrol et
  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user;
        if (sessionUser) {
          // profile tablosundan kullanıcı bilgilerini al
          const profile = await supabaseService.getProfile(sessionUser.id);
          setUser(profile || null);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth kontrol hatası:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // 🔄 Oturum değişikliklerini dinle
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await supabaseService.getProfile(session.user.id);
        setUser(profile || null);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // ✅ Kayıt işlemi
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      if (error) {
        return { error: { message: error.message, name: error.name, status: 400 } };
      }

      if (data.user) {
        await supabaseService.createProfile({
          id: data.user.id,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          email_verified: false,
        });
        setUser({
          id: data.user.id,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          email_verified: false,
        });
      }

      return { error: null };
    } catch (err) {
      console.error("❌ SignUp error:", err);
      return { error: { message: "Kayıt sırasında bir hata oluştu.", name: "SignUpError", status: 500 } };
    }
  };

  // ✅ Giriş işlemi
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { error: { message: "E-posta veya şifre hatalı.", name: "InvalidCredentials", status: 401 } };
      }

      const sessionUser = data.user;
      if (!sessionUser) {
        return { error: { message: "Giriş yapılamadı.", name: "NoUser", status: 400 } };
      }

      const profile = await supabaseService.getProfile(sessionUser.id);
      setUser(profile || null);

      return { error: null };
    } catch (err) {
      console.error("❌ SignIn error:", err);
      return { error: { message: "Giriş sırasında bir hata oluştu.", name: "SignInError", status: 500 } };
    }
  };

  // ✅ Çıkış işlemi
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("❌ SignOut error:", err);
    }
  };

  // ✅ Profil güncelleme
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      await supabaseService.updateProfile(user.id, updates);
      const updated = await supabaseService.getProfile(user.id);
      setUser(updated || user);
    } catch (err) {
      console.error("Profil güncelleme hatası:", err);
    }
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
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
