import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { sendOtp, verifyOtp, saveUserPhone, getUserPhone, clearUserData, getGoogleOAuthUrl } from '../lib/api';
import type { Session, User } from '@supabase/supabase-js';

// Ensures the browser auth popup closes and redirects back properly
WebBrowser.maybeCompleteAuthSession();

const OTP_AUTH_KEY = 'receiptvault_otp_auth';
const PHONE_KEY = 'receiptvault_user_phone';

// ============================================================
// REDIRECT URI
// Tells OAuth where to send the user after Google login.
// ============================================================
const redirectUri = makeRedirectUri({
  scheme: 'receiptvault',
  path: 'auth/callback',
});

// ============================================================
// AUTH CONTEXT TYPES
// ============================================================
interface AuthContextType {
  session: Session | null;
  user: User | null;
  userPhone: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: (phone: string, otp: string) => Promise<void>;
  sendOtpCode: (phone: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  userPhone: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthenticating: false,
  error: null,
  signInWithGoogle: async () => {},
  signInWithOtp: async () => {},
  sendOtpCode: async () => ({ success: false }),
  signOut: async () => {},
  clearError: () => {},
});

// ============================================================
// AUTH PROVIDER
// Supports two auth methods:
//   1. Google OAuth via Supabase (full user profile)
//   2. OTP login via backend (phone verification)
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, restore any existing Supabase session and user phone
  useEffect(() => {
    const init = async () => {
      try {
        const [sessionResult, phoneResult] = await Promise.all([
          supabase.auth.getSession(),
          getUserPhone(),
        ]);

        if (sessionResult.data.session) {
          setSession(sessionResult.data.session);
        }
        if (phoneResult) {
          setUserPhone(phoneResult);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => subscription?.unsubscribe();
  }, []);

  // ============================================================
  // OTP FLOW
  // 1. Send OTP via backend WhatsApp integration
  // 2. User verifies code
  // 3. Backend returns user or creates one
  // ============================================================
  const sendOtpCode = useCallback(
    async (phone: string) => {
      try {
        setError(null);
        const { data } = await sendOtp(phone);
        return { success: true };
      } catch (err: any) {
        const message = err?.response?.data?.error || err.message || 'Failed to send OTP';
        setError(message);
        return { success: false, error: message };
      }
    },
    []
  );

  const signInWithOtp = useCallback(
    async (phone: string, otp: string) => {
      try {
        setError(null);
        setIsAuthenticating(true);

        // Verify OTP via backend
        const { data } = await verifyOtp(phone, otp);

        if (data.success) {
          // Save phone for future requests
          await saveUserPhone(phone);
          setUserPhone(phone);
        } else {
          throw new Error(data.error || 'OTP verification failed');
        }
      } catch (err: any) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setIsAuthenticating(false);
      }
    },
    []
  );

  // ============================================================
  // GOOGLE OAUTH FLOW
  // 1. Ask backend for a Google OAuth URL
  // 2. Open it in an in-app browser
  // 3. Handle the redirect and session setup
  // ============================================================
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setIsAuthenticating(true);

      // Get Google OAuth URL from backend
      const { data } = await getGoogleOAuthUrl();

      if (!data.success || !data.url) {
        setError('Failed to start Google sign-in.');
        setIsAuthenticating(false);
        return;
      }

      // Open the OAuth URL in a web browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      );

      if (result.type === 'success' && result.url) {
        // Supabase/backend handles the redirect and sets up session
        // Check if session was created
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setSession(sessionData.session);
        } else {
          setError('Authentication incomplete. Please try again.');
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User cancelled — not an error
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await clearUserData();
      setUserPhone(null);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setError('Failed to sign out. Please try again.');
      }
    } catch (err: any) {
      setError('Failed to sign out. Please try again.');
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const user = session?.user ?? null;
  const isAuthenticated = !!session || !!userPhone;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userPhone,
        isAuthenticated,
        isLoading,
        isAuthenticating,
        error,
        signInWithGoogle,
        signInWithOtp,
        sendOtpCode,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Convenience hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ============================================================
// ERROR HELPERS
// ============================================================
function getErrorMessage(err: any): string {
  if (err?.message?.includes('network')) {
    return 'Network error. Check your internet connection.';
  }
  if (err?.message?.includes('popup') || err?.message?.includes('cancel')) {
    return 'Sign-in was cancelled.';
  }
  if (err?.response?.data?.error) {
    return err.response.data.error;
  }
  return err?.message || 'An unexpected error occurred. Please try again.';
}
