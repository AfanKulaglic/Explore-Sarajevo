"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from "react";
import { createAuthSupabaseClient, clearStaleAuthData } from "./supabase-auth";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initRef.current) return;
    initRef.current = true;
    
    const supabase = createAuthSupabaseClient();
    let isMounted = true;

    const checkUser = async () => {
      try {
        const {
          data: { user: authUser },
          error,
        } = await supabase.auth.getUser();
        
        if (error) {
          // If we get an auth error, clear stale data
          if (error.message?.includes('refresh_token') || error.status === 400) {
            clearStaleAuthData();
          }
          if (isMounted) {
            setUser(null);
            setLoading(false);
          }
          return;
        }
        
        if (isMounted && authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email!,
            name: authUser.user_metadata?.name,
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        clearStaleAuthData();
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name,
        });
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createAuthSupabaseClient();
    await supabase.auth.signOut();
    clearStaleAuthData();
    localStorage.removeItem("saraya_account");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
