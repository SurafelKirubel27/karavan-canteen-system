'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'teacher' | 'canteen' | 'admin';
  department?: string;
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'email'>) => Promise<{ success: boolean; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>; // Alias for signIn
  signOut: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await loadUserProfile(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (data) {
        setUser({
          id: data.id,
          email: data.email,
          name: data.name,
          role: data.role,
          department: data.department,
          phone: data.phone,
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };



  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'email'>) => {
    try {
      console.log('Starting signup process for:', email);

      // Sign up with Supabase Auth (email confirmation disabled in dashboard)
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error('Supabase auth signup error:', error);
        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Auth user created successfully:', data.user.id);

        // Wait a moment for the user to be fully created
        await new Promise(resolve => setTimeout(resolve, 500));

        // Create user profile in our users table with retry logic
        console.log('Creating user profile...');
        let profileError = null;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
          const { error } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              name: userData.name,
              role: userData.role,
              department: userData.department || 'General',
              phone: userData.phone || '+251 911 000 000'
            });

          if (!error) {
            console.log('User profile created successfully');
            return { success: true };
          }

          profileError = error;
          retryCount++;
          console.warn(`Profile creation attempt ${retryCount} failed:`, error.message);

          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          }
        }

        console.error('Profile creation failed after all retries:', profileError);
        return { success: false, error: `Account created but profile setup failed. Please contact support.` };
      }

      return { success: false, error: 'Failed to create user account' };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);

      // Special handling for canteen staff
      if (email === 'karavanstaff@sandfordschool.edu' && password === 'KaravanStaff123') {
        console.log('Canteen staff login detected');

        // Check if canteen staff user exists in database
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Error checking for existing canteen user:', checkError);
        }

        if (!existingUser) {
          console.log('Creating canteen staff user...');
          // Create canteen staff user directly in database
          const { data: newUser, error: createError } = await supabase
            .from('users')
            .insert({
              id: 'canteen-staff-' + Date.now(), // Temporary ID
              email: email,
              name: 'Karavan Canteen Staff',
              role: 'canteen',
              department: 'Canteen Operations',
              phone: '+251 911 123456'
            })
            .select()
            .single();

          if (createError) {
            console.error('Failed to create canteen staff user:', createError);
            return { success: false, error: 'Failed to create canteen staff account' };
          }

          console.log('Canteen staff user created:', newUser);
          setUser(newUser);
          return { success: true };
        } else {
          console.log('Existing canteen staff user found:', existingUser);
          setUser(existingUser);
          return { success: true };
        }
      }

      // Regular Supabase authentication for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Auth error:', error);

        // Handle email not confirmed errors (should not occur with disabled confirmation)
        if (error.message.includes('email not confirmed') || error.message.includes('Email not confirmed')) {
          console.log('Unexpected email confirmation error - this should not happen');
          return { success: false, error: 'Authentication error. Please try again or contact support.' };
        }

        // Handle invalid credentials
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        console.log('Auth successful, loading user profile...');

        // Load user profile from our users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (userError) {
          console.error('Failed to load user profile:', userError);
          console.error('User profile error details:', {
            message: userError.message,
            details: userError.details,
            hint: userError.hint,
            code: userError.code
          });

          // If profile doesn't exist, try to create a basic one
          if (userError.code === 'PGRST116') { // No rows returned
            console.log('No user profile found, creating basic profile...');

            const { error: createError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email: data.user.email || email,
                name: data.user.email?.split('@')[0] || 'User',
                role: 'teacher', // Default role
                department: 'General'
              });

            if (createError) {
              console.error('Failed to create fallback profile:', createError);
              return { success: false, error: `Profile creation failed: ${createError.message}. Please run the database fix script.` };
            }

            // Try to load the profile again
            const { data: newUserData, error: newUserError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            if (newUserError) {
              return { success: false, error: `Still failed to load profile: ${newUserError.message}. Please contact support.` };
            }

            console.log('Fallback user profile created and loaded:', newUserData);
            setUser(newUserData);
            return { success: true };
          }

          return { success: false, error: `Failed to load user profile: ${userError.message}. Please run the database fix script.` };
        }

        console.log('User profile loaded:', userData);
        setUser(userData);
        return { success: true };
      }

      return { success: false, error: 'Authentication failed' };
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);

      if (error) {
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    login: signIn, // Alias for backward compatibility
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
