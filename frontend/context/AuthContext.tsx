import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  sendOtp,
  verifyOtp,
  saveUserPhone,
  getUserPhone,
  clearUserData,
  registerOAuthUser,
} from '../lib/api';
import type { Session, User } from '@supabase/supabase-js';

// Ensures the browser auth popup closes and redirects back properly
if (Platform.OS !== 'web') {
  WebBrowser.maybeCompleteAuthSession();
}

const OTP_AUTH_KEY = 'receiptvault_otp_auth';
const PHONE_KEY = 'receiptvault_user_phone';

// ============================================================
// REDIRECT URI
// Tells OAuth where to send the user after Google login.
// ============================================================
function getRedirectUri() {
  if (Platform.OS === 'web') {
    return `${window.location.origin}/auth/callback`;
  }

  return makeRedirectUri({
    scheme: 'receiptvault',
    path: 'auth/callback',
  });
}

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
  isRegistering: boolean;
  pendingPhoneForOAuth: string | null; // OAuth user waiting for phone
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: (phone: string, otp: string) => Promise<void>;
  sendOtpCode: (phone: string) => Promise<{ success: boolean; error?: string }>;
  completeOAuthRegistration: (phone: string) => Promise<void>; // Complete OAuth + phone registration
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
  isRegistering: false,
  pendingPhoneForOAuth: null,
  error: null,
  signInWithGoogle: async () => {},
  signInWithOtp: async () => {},
  sendOtpCode: async () => ({ success: false }),
  completeOAuthRegistration: async () => {},
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
  const [isRegistering, setIsRegistering] = useState(false);
  const [pendingPhoneForOAuth, setPendingPhoneForOAuth] = useState<string | null>(null);
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
          if (session) {
            await supabase.auth.signOut();
            setSession(null);
          }

          // Save canonical phone from backend user record.
          const canonicalPhone = data?.user?.phone || phone;
          await saveUserPhone(canonicalPhone);
          setUserPhone(canonicalPhone);
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
    [session]
  );

  // ============================================================
  // GOOGLE OAUTH FLOW (via Supabase)
  // 1. Open Google sign-in in web browser
  // 2. Supabase handles the OAuth exchange
  // 3. User is authenticated and session is created
  // ============================================================
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setIsAuthenticating(true);
      const redirectUri = getRedirectUri();

      // Use Supabase's built-in OAuth method for Google
      const { data, error: supabaseError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (supabaseError) {
        throw supabaseError;
      }

      if (Platform.OS === 'web') {
        if (data.url) {
          console.log('Redirecting to Google OAuth URL:', data.url);
          window.location.href = data.url;
        }
        return;
      }

      // On native platforms, opening the URL in browser handles the redirect automatically
      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUri,
        );

        if (result.type === 'success') {
          // Session will be set automatically via auth state listener
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
            setSession(sessionData.session);
          }
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          // User cancelled — not an error
        }
      }
    } catch (err: any) {
      const message = getErrorMessage(err);
      setError(message);
      console.error('Google sign-in error:', err);
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // ============================================================
  // COMPLETE OAUTH REGISTRATION
  // New OAuth users must provide a phone number to complete signup
  // ============================================================
  const completeOAuthRegistration = useCallback(
    async (phone: string) => {
      try {
        setError(null);
        setIsRegistering(true);

        if (!session?.user) {
          throw new Error('No OAuth session found');
        }

        const email = session.user.email;
        if (!email) {
          throw new Error('OAuth account does not include an email address');
        }

        if (!isEmailVerified(session.user)) {
          throw new Error('Email verification is required before registration.');
        }

        const displayName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || undefined;
        const { data } = await registerOAuthUser({
          phone,
          email,
          displayName,
          emailVerified: isEmailVerified(session.user),
        });

        await saveUserPhone(data?.user?.phone || phone);
        setUserPhone(data?.user?.phone || phone);
        setPendingPhoneForOAuth(null);

        // User is now fully registered
      } catch (err: any) {
        const message = getErrorMessage(err);
        setError(message);
        throw err;
      } finally {
        setIsRegistering(false);
      }
    },
    [session]
  );

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
  const isAuthenticated = !!userPhone;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        userPhone,
        isAuthenticated,
        isLoading,
        isAuthenticating,
        isRegistering,
        pendingPhoneForOAuth,
        error,
        signInWithGoogle,
        signInWithOtp,
        sendOtpCode,
        completeOAuthRegistration,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function isEmailVerified(user: User): boolean {
  if (user.email_confirmed_at) return true;
  return user.user_metadata?.email_verified === true;
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
