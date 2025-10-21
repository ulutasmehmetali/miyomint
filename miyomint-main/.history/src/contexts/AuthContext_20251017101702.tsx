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

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user;
        if (sessionUser) {
          const profile = await supabaseService.getProfile(sessionUser.id);

          // Email doğrulama bilgisi profil tablosuna işlenmemişse güncelle
          if (sessionUser.email_confirmed_at && !profile?.email_verified) {
            await supabaseService.updateProfile(sessionUser.id, {
              email_verified: true,
            });
          }

          if (mounted) setUser(profile || null);
        } else {
          if (mounted) setUser(null);
        }
      } catch (err) {
        console.error("🔴 Auth kontrol hatası:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    // 🔄 Oturum değişikliklerini dinle (login / logout / refresh / verify)
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🪄 Auth değişikliği:", event);

      if (session?.user) {
        const profile = await supabaseService.getProfile(session.user.id);

        if (session.user.email_confirmed_at && !profile?.email_verified) {
          await supabaseService.updateProfile(session.user.id, {
            email_verified: true,
          });
        }

        setUser(profile || null);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
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
        console.error("❌ SignUp Supabase error:", error);
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

        console.log("✅ Kayıt başarılı, doğrulama e-postası gönderildi.");
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
      if (!email || !password) {
        return { error: { message: "E-posta ve şifre zorunludur.", name: "EmptyFields", status: 400 } };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error("❌ Supabase Auth error:", error);
        if (error.status === 406) {
          return { error: { message: "Sunucu isteği reddetti (406). Supabase ayarlarını kontrol edin.", name: "NotAcceptable", status: 406 } };
        }
        return { error: { message: error.message || "E-posta veya şifre hatalı.", name: "InvalidCredentials", status: error.status || 401 } };
      }

      const sessionUser = data.user;
      if (!sessionUser) {
        return { error: { message: "Giriş yapılamadı.", name: "NoUser", status: 400 } };
      }

      const profile = await supabaseService.getProfile(sessionUser.id);

      if (sessionUser.email_confirmed_at && !profile?.email_verified) {
        await supabaseService.updateProfile(sessionUser.id, {
          email_verified: true,
        });
      }

      setUser(profile || null);
      return { error: null };
    } catch (err: any) {
      console.error("❌ SignIn error (catch):", err);
      return { error: { message: err.message || "Giriş sırasında bir hata oluştu.", name: "SignInError", status: 500 } };
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
