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
import type { Session, User } from '@supabase/supabase-js';

// Ensures the browser auth popup closes and redirects back properly
WebBrowser.maybeCompleteAuthSession();

const OTP_AUTH_KEY = 'receiptvault_otp_auth';

// ============================================================
// REDIRECT URI
// Tells Supabase where to send the user after Google login.
// - In Expo Go: uses the Expo proxy (auth.expo.io)
// - In standalone builds: uses the app's custom scheme
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
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthenticating: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithOtp: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isAuthenticating: false,
  error: null,
  signInWithGoogle: async () => {},
  signInWithOtp: async () => {},
  signOut: async () => {},
  clearError: () => {},
});

// ============================================================
// AUTH PROVIDER
// Supports two auth methods:
//   1. Google OAuth via Supabase (full user profile)
//   2. OTP login → local session (persisted in AsyncStorage)
// ============================================================
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [otpAuthenticated, setOtpAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // On mount, restore any existing Supabase session and
  // check if the user previously logged in via OTP
  useEffect(() => {
    const init = async () => {
      const [sessionResult, otpResult] = await Promise.all([
        supabase.auth.getSession(),
        AsyncStorage.getItem(OTP_AUTH_KEY),
      ]);

      if (sessionResult.data.session) {
        setSession(sessionResult.data.session);
      }
      if (otpResult === 'true') {
        setOtpAuthenticated(true);
      }
      setIsLoading(false);
    };
    init();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => subscription.unsubscribe();
  }, []);

  // ============================================================
  // GOOGLE OAUTH FLOW
  // 1. Ask Supabase for a Google OAuth URL
  // 2. Open it in an in-app browser via expo-web-browser
  // 3. Supabase redirects back with a session in the URL fragment
  // 4. Extract the tokens and set the session
  // ============================================================
  const signInWithGoogle = useCallback(async () => {
    try {
      setError(null);
      setIsAuthenticating(true);

      // Ask Supabase for the Google OAuth URL
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError || !data.url) {
        setError(oauthError?.message || 'Failed to start Google sign-in.');
        setIsAuthenticating(false);
        return;
      }

      // Open the OAuth URL in a web browser
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUri,
      );

      if (result.type === 'success' && result.url) {
        // Extract access_token and refresh_token from the URL fragment
        // Supabase returns them as hash params: #access_token=...&refresh_token=...
        const url = new URL(result.url);

        // Tokens may be in the fragment (#) or query (?)
        const params = new URLSearchParams(
          url.hash ? url.hash.substring(1) : url.search.substring(1),
        );

        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (sessionError) {
            setError('Failed to establish session. Please try again.');
          }
        } else {
          setError('Authentication incomplete. Please try again.');
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        // User closed the browser — not an error
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // OTP sign-in: persists a flag so the session survives app restarts
  const signInWithOtp = useCallback(async () => {
    await AsyncStorage.setItem(OTP_AUTH_KEY, 'true');
    setOtpAuthenticated(true);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(OTP_AUTH_KEY);
      setOtpAuthenticated(false);
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
  const isAuthenticated = !!session || otpAuthenticated;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAuthenticated,
        isLoading,
        isAuthenticating,
        error,
        signInWithGoogle,
        signInWithOtp,
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
  return err?.message || 'An unexpected error occurred. Please try again.';
}
