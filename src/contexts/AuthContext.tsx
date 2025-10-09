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

  useEffect(() => {
    const currentUser = localStorageService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const existingUser = localStorageService.getUserByEmail(email);

      if (existingUser) {
        return {
          error: {
            message: 'Bu e-posta adresi zaten kayıtlı',
            name: 'UserExists',
            status: 400,
          }
        };
      }

      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        full_name: fullName,
        created_at: new Date().toISOString(),
      };

      localStorage.setItem(`user_password_${newUser.id}`, password);

      localStorageService.saveUser(newUser);
      localStorageService.setCurrentUser(newUser);
      setUser(newUser);

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'Kayıt sırasında bir hata oluştu',
          name: 'SignUpError',
          status: 500,
        }
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = localStorageService.getUserByEmail(email);

      if (!user) {
        return {
          error: {
            message: 'E-posta veya şifre hatalı',
            name: 'InvalidCredentials',
            status: 401,
          }
        };
      }

      const storedPassword = localStorage.getItem(`user_password_${user.id}`);

      if (storedPassword !== password) {
        return {
          error: {
            message: 'E-posta veya şifre hatalı',
            name: 'InvalidCredentials',
            status: 401,
          }
        };
      }

      localStorageService.setCurrentUser(user);
      setUser(user);

      return { error: null };
    } catch (error) {
      return {
        error: {
          message: 'Giriş sırasında bir hata oluştu',
          name: 'SignInError',
          status: 500,
        }
      };
    }
  };

  const signOut = async () => {
    localStorageService.setCurrentUser(null);
    setUser(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    localStorageService.updateUser(user.id, updates);
    const updatedUser = localStorageService.getCurrentUser();
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
