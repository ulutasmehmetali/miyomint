import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabaseClient";
import { supabaseService } from "../lib/supabaseService";
import { User } from "../types";
import { getAppBaseUrl } from "../utils/url";

interface AuthError {
  message: string;
  name?: string;
  status?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🌐 E-posta doğrulama yönlendirmesi
  const redirectUrl = `${getAppBaseUrl()}/verify`;

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;

        const sessionUser = data.session?.user;
        if (sessionUser) {
          let profile = await supabaseService.getProfile(sessionUser.id);

          // 🧾 Eğer profil yoksa oluştur
          if (!profile) {
            await supabaseService.createProfile({
              id: sessionUser.id,
              email: sessionUser.email ?? "",
              full_name:
                (sessionUser.user_metadata.full_name as string) ??
                sessionUser.user_metadata.name ??
                "",
              email_verified: Boolean(sessionUser.email_confirmed_at),
            });
            profile = await supabaseService.getProfile(sessionUser.id);
          }

          // 🔄 Eğer email_confirmed_at varsa, email_verified alanını güncelle
          if (sessionUser.email_confirmed_at && !profile?.email_verified) {
            await supabaseService.updateProfile(sessionUser.id, {
              email_verified: true,
            });
            profile = await supabaseService.getProfile(sessionUser.id);
          }

          if (mounted) setUser(profile || null);
        } else if (mounted) {
          setUser(null);
        }
      } catch (err) {
        console.error("🔴 Auth kontrol hatası:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    // 🔔 Oturum olaylarını dinle
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("🪄 Auth değişikliği:", event, session);

        if (session?.user) {
          try {
            let profile = await supabaseService.getProfile(session.user.id);

            if (!profile) {
              await supabaseService.createProfile({
                id: session.user.id,
                email: session.user.email ?? "",
                full_name:
                  (session.user.user_metadata.full_name as string) ??
                  session.user.user_metadata.name ??
                  "",
                email_verified: Boolean(session.user.email_confirmed_at),
              });
              profile = await supabaseService.getProfile(session.user.id);
            }

            if (session.user.email_confirmed_at && !profile?.email_verified) {
              await supabaseService.updateProfile(session.user.id, {
                email_verified: true,
              });
              profile = await supabaseService.getProfile(session.user.id);
            }

            setUser(profile || null);
          } catch (err) {
            console.error("Profil yükleme hatası:", err);
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // ✅ Yeni kullanıcı kaydı
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error("❌ SignUp Supabase error:", error);
        return {
          error: {
            message: error.message,
            name: error.name,
            status: error.status || 400,
          },
        };
      }

      if (data.user) {
        try {
          await supabaseService.createProfile({
            id: data.user.id,
            email,
            full_name: fullName,
            email_verified: false,
          });
        } catch (profileError) {
          console.warn("⚠️ Profil oluşturulamadı (signup sonrası):", profileError);
        }

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
    } catch (err: unknown) {
      console.error("❌ SignUp error:", err);
      const message =
        err instanceof Error ? err.message : "Kayıt sırasında bir hata oluştu.";
      return {
        error: { message, name: "SignUpError", status: 500 },
      };
    }
  };

  // ✅ Giriş işlemi
  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return {
          error: {
            message: "E-posta ve şifre zorunludur.",
            name: "EmptyFields",
            status: 400,
          },
        };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Supabase Auth error:", error);
        return {
          error: {
            message: error.message || "E-posta veya şifre hatalı.",
            name: "InvalidCredentials",
            status: error.status || 401,
          },
        };
      }

      const sessionUser = data.user;
      if (!sessionUser) {
        return {
          error: {
            message: "Giriş yapılamadı.",
            name: "NoUser",
            status: 400,
          },
        };
      }

      let profile = await supabaseService.getProfile(sessionUser.id);

      if (!profile) {
        await supabaseService.createProfile({
          id: sessionUser.id,
          email: sessionUser.email!,
          full_name:
            (sessionUser.user_metadata.full_name as string) ??
            sessionUser.user_metadata.name ??
            "",
          email_verified: Boolean(sessionUser.email_confirmed_at),
        });
        profile = await supabaseService.getProfile(sessionUser.id);
      }

      if (sessionUser.email_confirmed_at && !profile?.email_verified) {
        await supabaseService.updateProfile(sessionUser.id, {
          email_verified: true,
        });
      }

      setUser(profile || null);
      return { error: null };
    } catch (err: unknown) {
      console.error("❌ SignIn error (catch):", err);
      const message =
        err instanceof Error ? err.message : "Giriş sırasında bir hata oluştu.";
      return {
        error: { message, name: "SignInError", status: 500 },
      };
    }
  };

  // ✅ Çıkış işlemi
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      console.log("🚪 Kullanıcı çıkış yaptı.");
    } catch (err: unknown) {
      console.error("❌ SignOut error:", err);
    }
  };

  // ✅ Profil güncelleme işlemi
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      await supabaseService.updateProfile(user.id, updates);
      const updated = await supabaseService.getProfile(user.id);
      setUser(updated || user);
      console.log("✅ Profil güncellendi.");
    } catch (err: unknown) {
      console.error("Profil güncelleme hatası:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ✅ Kullanım için Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
