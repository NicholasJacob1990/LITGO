import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import supabase from '../supabase';
import { isEqual } from 'lodash';

type UserRole = 'client' | 'lawyer' | null;

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  role: null,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setRole(initialSession?.user?.user_metadata?.role || null);
      setIsLoading(false);
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(prevSession => {
        if (!isEqual(prevSession, newSession)) {
          return newSession;
        }
        return prevSession;
      });
      setUser(prevUser => {
        if (!isEqual(prevUser, newSession?.user ?? null)) {
          return newSession?.user ?? null;
        }
        return prevUser;
      });
      setRole(newSession?.user?.user_metadata?.role || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(() => ({
    user,
    session,
    role,
    isLoading
  }), [user, session, role, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 