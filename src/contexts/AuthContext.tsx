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
    // FAST LOADING - No database calls, immediate ready state
    console.log('🚀 FAST AUTH: Setting up instant authentication...');
    setIsLoading(false);
    console.log('✅ Authentication ready instantly');
  }, []);


  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'email'>) => {
    try {
      console.log('🚀 REAL SIGNUP: Starting for:', email);

      // Email validation for Sandford School
      const emailRegex = /^[a-zA-Z]+(\.[a-zA-Z]+)?@sandfordschool\.org$/;
      if (!emailRegex.test(email)) {
        return {
          success: false,
          error: 'Please use a valid Sandford School email address (name@sandfordschool.org or name.name@sandfordschool.org)'
        };
      }

      // Create auth user in Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Auth signup error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Failed to create user account' };
      }

      // Create user profile in database
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name: userData.name,
          role: userData.role,
          department: userData.department || 'General',
          phone: userData.phone || '+251 911 000 000',
        });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // If profile creation fails, we should clean up the auth user
        await supabase.auth.signOut();
        return { success: false, error: 'Failed to create user profile. Please try again.' };
      }

      console.log('✅ User account and profile created successfully');
      return { success: true };

    } catch (error) {
      console.error('💥 Signup error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error occurred' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🚀 REAL LOGIN: Attempting to sign in:', email);

      // Special handling for canteen staff - hardcoded credentials
      if (email === 'karavanstaff@sandfordschool.edu' && password === 'KaravanStaff123') {
        console.log('✅ Canteen staff login - AUTHORIZED');

        // Get the real canteen user from database
        const { data: canteenProfile, error: canteenError } = await supabase
          .from('users')
          .select('*')
          .eq('email', 'karavanstaff@sandfordschool.edu')
          .single();

        if (canteenError || !canteenProfile) {
          console.error('❌ Canteen profile not found:', canteenError);
          return { success: false, error: 'Canteen staff profile not found. Please contact administrator.' };
        }

        setUser({
          id: canteenProfile.id,
          email: canteenProfile.email,
          name: canteenProfile.name,
          role: canteenProfile.role as 'canteen',
          department: canteenProfile.department,
          phone: canteenProfile.phone,
        });
        return { success: true };
      }

      // For all other users, authenticate through Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('❌ Auth signin error:', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Authentication failed' };
      }

      // Get user profile from database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch error:', profileError);
        await supabase.auth.signOut();
        return { success: false, error: 'User profile not found. Please contact support.' };
      }

      // Set user in context
      setUser({
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        role: userProfile.role,
        department: userProfile.department,
        phone: userProfile.phone,
        created_at: userProfile.created_at,
      });

      console.log('✅ User logged in successfully:', userProfile.name);
      return { success: true };
    } catch (error) {
      console.error('Signin error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  const signOut = async () => {
    try {
      console.log('🚀 FAST SIGNOUT: Signing out instantly...');
      // Clear user state immediately for fast logout
      setUser(null);
      // Clear any local storage or session data
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      console.log('✅ User signed out successfully');
    } catch (error) {
      console.error('Signout error:', error);
      // Still clear user state even if there's an error
      setUser(null);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' };
      }

      console.log('🚀 REAL UPDATE: Updating profile in database...');

      // Update profile in database
      const { error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        return { success: false, error: error.message };
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...userData } : null);
      console.log('✅ Profile updated successfully');
      return { success: true };
    } catch (error) {
      console.error('Profile update exception:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Update failed' };
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
