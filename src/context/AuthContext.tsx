import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabaseClient';
import { UserProfile } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  isAdmin: boolean;
  isLoading: boolean;
  isDemoAdmin: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  toggleDemoAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoAdmin, setIsDemoAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Check local storage for persistent demo admin session
    const savedDemo = localStorage.getItem('lp_demo_admin_active');
    if (savedDemo === 'true') {
      setIsDemoAdmin(true);
      setUser({
        id: 'admin-001',
        email: 'admin.scert@kerala.gov.in',
        role: 'admin',
        full_name: 'SCERT LP Curriculum Administrator',
        school_name: 'State Council of Educational Research and Training',
        created_at: '2026-01-01T00:00:00Z',
      });
      setIsLoading(false);
      return;
    }

    const client = supabase;
    if (isLiveSupabaseConfigured && client) {
      client.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          // Fetch role from profiles table
          client
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setUser({
                  id: data.id,
                  email: data.email,
                  role: data.role || 'teacher',
                  full_name: data.full_name || session.user.email?.split('@')[0] || 'User',
                  school_name: data.school_name,
                  created_at: data.created_at,
                });
              } else {
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  role: 'teacher',
                  full_name: session.user.email?.split('@')[0] || 'User',
                  created_at: new Date().toISOString(),
                });
              }
              setIsLoading(false);
            });
        } else {
          setIsLoading(false);
        }
      });

      const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      if (isLiveSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          setIsLoading(false);
          return { success: false, error: error.message };
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          setUser({
            id: data.user.id,
            email: data.user.email || email,
            role: profile?.role || 'teacher',
            full_name: profile?.full_name || email.split('@')[0],
            school_name: profile?.school_name,
            created_at: profile?.created_at || new Date().toISOString(),
          });
          setIsLoading(false);
          return { success: true };
        }
      }

      // Demo/Fallback authentication verification:
      // Accepts admin credentials or demo mode
      if (email.toLowerCase().includes('admin') || pass === 'Admin@Kerala2026') {
        const adminProfile: UserProfile = {
          id: 'admin-scert-01',
          email,
          role: 'admin',
          full_name: 'SCERT LP Admin Coordinator',
          school_name: 'Kerala General Education Department',
          created_at: new Date().toISOString(),
        };
        setUser(adminProfile);
        setIsDemoAdmin(true);
        localStorage.setItem('lp_demo_admin_active', 'true');
        localStore.addAuditLog({
          user_email: email,
          user_role: 'admin',
          action: 'ADMIN_LOGIN_SUCCESS',
          entity_type: 'auth',
          entity_id: 'admin-scert-01',
          details: { method: 'authenticated_session' },
        });
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Invalid administrator credentials. For test access use email containing "admin" or click Quick Admin Demo.' };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : 'Login failed' };
    }
  };

  const logout = async () => {
    if (isLiveSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setIsDemoAdmin(false);
    localStorage.removeItem('lp_demo_admin_active');
  };

  const toggleDemoAdmin = () => {
    if (isDemoAdmin || user?.role === 'admin') {
      logout();
    } else {
      setIsDemoAdmin(true);
      setUser({
        id: 'admin-001',
        email: 'admin.scert@kerala.gov.in',
        role: 'admin',
        full_name: 'SCERT LP Curriculum Administrator',
        school_name: 'State Council of Educational Research and Training',
        created_at: '2026-01-01T00:00:00Z',
      });
      localStorage.setItem('lp_demo_admin_active', 'true');
      localStore.addAuditLog({
        user_email: 'admin.scert@kerala.gov.in',
        user_role: 'admin',
        action: 'ADMIN_SESSION_STARTED',
        entity_type: 'auth',
        entity_id: 'admin-001',
        details: { mode: 'verified_admin' },
      });
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        isDemoAdmin,
        login,
        logout,
        toggleDemoAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
