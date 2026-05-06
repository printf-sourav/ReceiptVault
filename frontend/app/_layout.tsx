import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  DMSans_400Regular,
  DMSans_500Medium,
} from '@expo-google-fonts/dm-sans';
import { ScanLine } from '../src/components/ScanLine';
import { Colors } from '../src/constants/colors';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
  });

  const [showScanLine, setShowScanLine] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowScanLine(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bgPrimary }} />
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View style={styles.container}>
          <StatusBar style="light" />
          {showScanLine && <ScanLine />}
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: Colors.bgPrimary },
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="receipt/[id]"
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
              }}
            />
          </Stack>
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
});
