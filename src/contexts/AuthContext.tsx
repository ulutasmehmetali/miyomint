import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, SUPABASE_URL, SUPABASE_ANON_KEY } from "../lib/supabaseClient";
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
  signUp: (email: string, password: string, fullName: string, captchaToken?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  resendVerificationEmail: () => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = async (
    sessionUser: any,
    fallbackEmail?: string,
    fallbackFullName?: string,
    accessToken?: string
  ): Promise<User> => {
    try {
      const profile = await supabaseService.getProfile(sessionUser.id);

      if (sessionUser.email_confirmed_at && !profile.email_verified) {
        try {
          await supabaseService.updateProfile(sessionUser.id, { email_verified: true });
          return { ...profile, email_verified: true };
        } catch (updateError) {
          console.warn("Profil update hatasi (RLS olabilir), REST denenecek:", updateError);
          if (accessToken) {
            try {
              const response = await fetch(
                `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(sessionUser.id)}`,
                {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                    apikey: SUPABASE_ANON_KEY,
                    Authorization: `Bearer ${accessToken}`,
                    Prefer: "return=representation",
                  },
                  body: JSON.stringify({ email_verified: true }),
                }
              );

              if (response.ok) {
                const updated = await response.json();
                console.log("Profil update REST basarili:", updated);
                const row =
                  Array.isArray(updated) && updated.length > 0 ? updated[0] : { ...profile, email_verified: true };
                return row as User;
              } else {
                const text = await response.text();
                console.error("Profil update REST hata:", response.status, text);
              }
            } catch (restErr) {
              console.error("Profil update REST istisna:", restErr);
            }
          }
        }
        return { ...profile, email_verified: true };
      }

      return profile;
    } catch (profileError: any) {
      console.warn("Profil bulunamadi, yeni profil olusturuluyor:", profileError);

      const payload: User = {
        id: sessionUser.id,
        email: sessionUser.email || fallbackEmail || "",
        full_name: fallbackFullName || sessionUser.user_metadata?.full_name || "",
        created_at: sessionUser.created_at || new Date().toISOString(),
        email_verified: Boolean(sessionUser.email_confirmed_at),
      };

      if (accessToken) {
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${accessToken}`,
              Prefer: "return=representation",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const text = await response.text();
            console.error("Profil create REST hata:", response.status, text);
          } else {
            const created = await response.json();
            console.log("Profil create REST basarili:", created);
            return Array.isArray(created) && created.length > 0 ? created[0] : payload;
          }
        } catch (restError) {
          console.error("Profil create REST istisna:", restError);
        }
      }

      try {
        await supabaseService.createProfile(payload);
      } catch (createError) {
        console.error("Profil olusturma hatasi:", createError);
      }

      return payload;
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }

        const sessionUser = data.session?.user;
        if (sessionUser) {
          const profile = await ensureProfile(sessionUser);
          if (mounted) {
            setUser(profile);
          }
        } else if (mounted) {
          setUser(null);
        }
      } catch (err) {
        console.error("Auth session kontrolu basarisiz:", err);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const sessionUser = session?.user;
      if (!sessionUser) {
        setUser(null);
        return;
      }

      const profile = await ensureProfile(sessionUser);
      setUser(profile);
    });

    return () => {
      mounted = false;
      subscription?.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string, captchaToken?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/verify`,
          captchaToken,
        },
      });

      if (error) {
        return {
          error: {
            message: error.message,
            name: error.name,
            status: error.status || 400,
          },
        };
      }

      if (data.user) {
        const pendingUser: User = {
          id: data.user.id,
          email,
          full_name: fullName,
          created_at: data.user.created_at || new Date().toISOString(),
          email_verified: Boolean(data.user.email_confirmed_at),
        };

        setUser(pendingUser);

        if (data.session?.user) {
          ensureProfile(data.session.user, email, fullName)
            .then((profile) => setUser(profile))
            .catch((profileError) =>
              console.warn("Kayit sonrasi profil senkronizasyonu basarisiz:", profileError)
            );
        }
      }

      return { error: null };
    } catch (err: any) {
      console.error("SignUp hatasi:", err);
      return {
        error: {
          message: err?.message || "Kayit sirasinda bir hata olustu.",
          name: "SignUpError",
          status: 500,
        },
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        return {
          error: {
            message: "E-posta ve sifre zorunludur.",
            name: "EmptyFields",
            status: 400,
          },
        };
      }

      console.log("[Auth] signIn started", { email });

      const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ email, password }),
      });

      const payload = await response.json();
      console.log("[Auth] raw token response", payload);

      if (!response.ok) {
        const message =
          payload?.error_description ||
          payload?.error ||
          payload?.message ||
          "E-posta veya sifre hatali.";
        return {
          error: {
            message,
            name: payload?.error?.toString() || "InvalidCredentials",
            status: response.status,
          },
        };
      }

      const accessToken = payload.access_token;
      const refreshToken = payload.refresh_token;

      if (!accessToken || !refreshToken) {
        return {
          error: {
            message: "Sunucudan beklenen oturum bilgileri alinmadi.",
            name: "MissingTokens",
            status: 500,
          },
        };
      }

      const sessionUser = payload.user;

      if (!sessionUser) {
        return {
          error: {
            message: "Giris yapilamadi.",
            name: "NoUser",
            status: 400,
          },
        };
      }

      const baseUser: User = {
        id: sessionUser.id,
        email: sessionUser.email || email,
        full_name: sessionUser.user_metadata?.full_name || "",
        created_at: sessionUser.created_at || new Date().toISOString(),
        email_verified: Boolean(sessionUser.email_confirmed_at),
      };

      setUser(baseUser);
      console.log("[Auth] baseUser set", baseUser);

      supabase.auth
        .setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        .then(({ data: sessionData, error: sessionError }) => {
          console.log("[Auth] setSession async result", { sessionData, sessionError });
          if (sessionError) {
            console.error("Oturum senkronizasyonu hatasi:", sessionError);
          }
        })
        .catch((sessionErr) => {
          console.error("setSession beklenmedik hata:", sessionErr);
        });

      ensureProfile(
        sessionUser,
        email,
        sessionUser.user_metadata?.full_name,
        accessToken
      )
        .then((profile) => {
          console.log("[Auth] ensureProfile resolved", profile);
          setUser(profile);
        })
        .catch((profileError) => {
          console.warn("Profil senkronizasyonu tamamlanamadi:", profileError);
        });

      return { error: null };
    } catch (err: any) {
      console.error("SignIn hatasi:", err);
      return {
        error: {
          message: err?.message || "Giris sirasinda bir hata olustu.",
          name: "SignInError",
          status: 500,
        },
      };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      console.error("SignOut hatasi:", err);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) {
      return;
    }

    try {
      await supabaseService.updateProfile(user.id, updates);
      const refreshed = await supabaseService.getProfile(user.id);
      setUser(refreshed);
    } catch (err) {
      console.error("Profil guncelleme hatasi:", err);
    }
  };

  const resendVerificationEmail = async () => {
    if (!user?.email) {
      return {
        error: {
          message: "Gecerli bir e-posta bulunamadi.",
          name: "MissingEmail",
          status: 400,
        },
      };
    }

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify`,
        },
      });

      if (error) {
        return {
          error: {
            message: error.message || "Dogrulama e-postasi gonderilemedi.",
            name: error.name,
            status: error.status || 400,
          },
        };
      }

      return { error: null };
    } catch (err: any) {
      console.error("Dogrulama e-postasi tekrar gonderilemedi:", err);
      return {
        error: {
          message: err?.message || "Dogrulama e-postasi gonderilemedi.",
          name: "ResendVerificationError",
          status: 500,
        },
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signUp, signIn, signOut, updateProfile, resendVerificationEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
