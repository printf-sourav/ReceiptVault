import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../src/constants/colors';
import { Fonts, FontSizes } from '../../src/constants/typography';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ code?: string; error?: string; error_description?: string }>();
  const [message, setMessage] = useState('Signing you in...');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const finishSignIn = async () => {
      try {
        // On web, OAuth response comes in hash fragment, not query params
        if (Platform.OS === 'web') {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const errorParam = hashParams.get('error');
          const errorDesc = hashParams.get('error_description');

          if (errorParam) {
            const msg = `OAuth Error: ${errorParam} - ${errorDesc || 'Unknown error'}`;
            setDebugInfo(msg);
            console.error(msg);
            setMessage('Sign in failed. Redirecting...');
            setTimeout(() => router.replace('/login'), 2000);
            return;
          }

          if (accessToken) {
            console.log('Found access token in hash, setting session...');
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });

            if (error) {
              const msg = `Session Error: ${error.message}`;
              setDebugInfo(msg);
              console.error(msg);
              throw error;
            }

            console.log('Session set successfully from OAuth token');
            const { data } = await supabase.auth.getSession();
            if (data.session) {
              console.log('Session confirmed, navigating to app');
              router.replace('/(tabs)');
              return;
            }
          }
        }

        // Fallback: Try code exchange (native or alternate flow)
        const code = params.code;
        const errorParam = params.error;
        const errorDesc = params.error_description;

        if (errorParam) {
          const msg = `OAuth Error: ${errorParam} - ${errorDesc || 'Unknown error'}`;
          setDebugInfo(msg);
          console.error(msg);
          setMessage('Sign in failed. Redirecting...');
          setTimeout(() => router.replace('/login'), 2000);
          return;
        }

        if (typeof code === 'string' && code.length > 0) {
          console.log('Exchanging auth code for session...');
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            const msg = `Exchange Error: ${error.message}`;
            setDebugInfo(msg);
            console.error(msg);
            throw error;
          }
          console.log('Session exchanged successfully');
        } else {
          const msg = `No code or token received. Hash params: ${window.location.hash}`;
          setDebugInfo(msg);
          console.log(msg);
        }

        const { data } = await supabase.auth.getSession();
        if (data.session) {
          console.log('Session confirmed, navigating to app');
          router.replace('/(tabs)');
          return;
        }

        const msg = 'No session found after exchange';
        setDebugInfo(msg);
        setMessage('Unable to complete sign in. Redirecting...');
        setTimeout(() => router.replace('/login'), 1200);
      } catch (error: any) {
        const msg = `Catch Error: ${error?.message || JSON.stringify(error)}`;
        setDebugInfo(msg);
        console.error(msg);
        setMessage('Sign in failed. Check console for details.');
        setTimeout(() => router.replace('/login'), 2000);
      }
    };

    finishSignIn();
  }, [params.code, params.error, router]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ActivityIndicator size="large" color={Colors.accentCyan} />
        <Text style={styles.title}>ReceiptVault</Text>
        <Text style={styles.message}>{message}</Text>
        {debugInfo ? (
          <View style={styles.debugBox}>
            <Text style={styles.debugLabel}>Debug Info:</Text>
            <Text style={styles.debugText}>{debugInfo}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    marginTop: 20,
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xl,
    color: Colors.textPrimary,
  },
  message: {
    marginTop: 12,
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  debugBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 8,
    borderColor: Colors.accentRose,
    borderWidth: 1,
    maxWidth: 300,
  },
  debugLabel: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.accentRose,
    marginBottom: 4,
  },
  debugText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
  },
});