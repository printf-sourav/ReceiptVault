import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AnimatedToggle } from '../../src/components/AnimatedToggle';
import { BottomSheet } from '../../src/components/BottomSheet';
import { PillButton } from '../../src/components/PillButton';
import { Colors } from '../../src/constants/colors';
import { Fonts, FontSizes } from '../../src/constants/typography';
import { useAuth } from '../../context/AuthContext';

interface SettingItem {
  label: string;
  value?: string;
  badge?: string;
  badgeColor?: string;
  labelColor?: string;
  subtitle?: string;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (val: boolean) => void;
  activeColor?: string;
  onPress?: () => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [spendingAlerts, setSpendingAlerts] = useState(true);
  const [vaultMode, setVaultMode] = useState(false);
  const [notifChannel, setNotifChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [alertFrequency, setAlertFrequency] = useState('Immediate');
  const [quietHoursSheet, setQuietHoursSheet] = useState(false);
  const [frequencySheet, setFrequencySheet] = useState(false);
  const [clearSheet, setClearSheet] = useState(false);

  const handleSignOut = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setIsSigningOut(true);
    try {
      await signOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  // Supabase stores Google profile data in user_metadata
  const displayName = user?.user_metadata?.full_name || user?.user_metadata?.name || null;
  const email = user?.email || null;
  const photoUrl = user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

  const initials = displayName
    ? displayName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'RV';

  const settingSections: SettingSection[] = [
    {
      title: 'Profile',
      items: [
        {
          label: email || 'Not signed in',
          badge: user ? 'Google ✓' : undefined,
          badgeColor: Colors.accentEmerald,
        },
        {
          label: 'Notification Channel',
          value: notifChannel === 'whatsapp' ? 'WhatsApp' : 'Telegram',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setNotifChannel(notifChannel === 'whatsapp' ? 'telegram' : 'whatsapp');
          },
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          label: 'Quiet Hours',
          value: '10 PM - 8 AM',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setQuietHoursSheet(true);
          },
        },
        {
          label: 'Alert Frequency',
          value: alertFrequency,
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setFrequencySheet(true);
          },
        },
        {
          label: 'Deadline Alerts',
          toggle: true,
          toggleValue: deadlineAlerts,
          onToggle: setDeadlineAlerts,
        },
        {
          label: 'Spending Alerts',
          toggle: true,
          toggleValue: spendingAlerts,
          onToggle: setSpendingAlerts,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          label: 'VAULT MODE 🔒',
          subtitle: 'Enhanced Vault Experience',
          toggle: true,
          toggleValue: vaultMode,
          onToggle: (val: boolean) => {
            setVaultMode(val);
            if (val) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
          },
          activeColor: Colors.accentPurple,
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          label: 'Download My Data',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Export Started', 'Your data export will be ready shortly.');
          },
        },
        {
          label: 'Clear Receipt History',
          labelColor: Colors.accentRose,
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setClearSheet(true);
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        { label: 'ReceiptVault v1.0.0', value: '' },
        { label: 'Built for Samsung PRISM Hackathon 2026', value: '' },
        {
          label: 'Powered by Gemini 2.0 Flash ✦',
          labelColor: Colors.accentPurple,
          value: '',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with user info */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Settings</Text>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>

        {/* User profile card — shows Google account details */}
        {user && (
          <View style={styles.profileCard}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.profilePhoto} />
            ) : (
              <View style={styles.profilePhotoFallback}>
                <Text style={styles.profilePhotoFallbackText}>{initials}</Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName || 'ReceiptVault User'}
              </Text>
              <Text style={styles.profileEmail} numberOfLines={1}>
                {email}
              </Text>
            </View>
          </View>
        )}

        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.label}
                  style={[
                    styles.settingRow,
                    index < section.items.length - 1 && styles.settingRowBorder,
                  ]}
                  onPress={item.onPress}
                  disabled={!item.onPress && !item.toggle}
                >
                  <View style={styles.settingLeft}>
                    <Text
                      style={[
                        styles.settingLabel,
                        item.labelColor ? { color: item.labelColor } : {},
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle && (
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    )}
                  </View>
                  <View style={styles.settingRight}>
                    {item.badge && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor:
                              (item.badgeColor || Colors.accentEmerald) + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeText,
                            { color: item.badgeColor || Colors.accentEmerald },
                          ]}
                        >
                          {item.badge}
                        </Text>
                      </View>
                    )}
                    {item.value && !item.toggle && (
                      <Text style={styles.settingValue}>{item.value}</Text>
                    )}
                    {item.toggle && (
                      <AnimatedToggle
                        value={item.toggleValue!}
                        onToggle={item.onToggle!}
                        activeColor={item.activeColor || Colors.accentCyan}
                      />
                    )}
                    {item.onPress && !item.toggle && (
                      <Text style={styles.chevron}>›</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        {/* Sign Out Button */}
        <Pressable
          onPress={handleSignOut}
          disabled={isSigningOut}
          style={({ pressed }) => [
            styles.signOutBtn,
            pressed && { opacity: 0.8 },
            isSigningOut && { opacity: 0.5 },
          ]}
        >
          {isSigningOut ? (
            <ActivityIndicator size="small" color={Colors.accentRose} />
          ) : (
            <Text style={styles.signOutText}>Sign Out</Text>
          )}
        </Pressable>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Quiet Hours Sheet */}
      <BottomSheet
        visible={quietHoursSheet}
        onClose={() => setQuietHoursSheet(false)}
        title="Quiet Hours"
        height={250}
      >
        <Text style={styles.sheetText}>
          No alerts will be sent during quiet hours.
        </Text>
        <View style={styles.timeRow}>
          <View style={styles.timePill}>
            <Text style={styles.timeText}>10:00 PM</Text>
          </View>
          <Text style={styles.timeTo}>to</Text>
          <View style={styles.timePill}>
            <Text style={styles.timeText}>8:00 AM</Text>
          </View>
        </View>
        <PillButton
          label="Save"
          onPress={() => setQuietHoursSheet(false)}
        />
      </BottomSheet>

      {/* Frequency Sheet */}
      <BottomSheet
        visible={frequencySheet}
        onClose={() => setFrequencySheet(false)}
        title="Alert Frequency"
        height={300}
      >
        {['Immediate', 'Hourly', 'Daily'].map((freq) => (
          <Pressable
            key={freq}
            style={[
              styles.freqRow,
              alertFrequency === freq && styles.freqRowActive,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAlertFrequency(freq);
              setFrequencySheet(false);
            }}
          >
            <Text
              style={[
                styles.freqText,
                alertFrequency === freq && styles.freqTextActive,
              ]}
            >
              {freq}
            </Text>
            {alertFrequency === freq && (
              <Text style={styles.freqCheck}>✓</Text>
            )}
          </Pressable>
        ))}
      </BottomSheet>

      {/* Clear History Sheet */}
      <BottomSheet
        visible={clearSheet}
        onClose={() => setClearSheet(false)}
        title="Clear Receipt History"
        height={220}
      >
        <Text style={styles.clearWarning}>
          This cannot be undone. All your receipt data will be permanently
          deleted from this device.
        </Text>
        <View style={styles.clearActions}>
          <PillButton
            label="Cancel"
            variant="secondary"
            onPress={() => setClearSheet(false)}
            style={{ flex: 1 }}
          />
          <PillButton
            label="Clear All"
            variant="danger"
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              setClearSheet(false);
            }}
            style={{ flex: 1 }}
          />
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgPrimary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xxl - 2,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.sm,
    color: Colors.bgPrimary,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.accentCyan,
  },

  // User profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  profilePhoto: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.accentCyan,
  },
  profilePhotoFallback: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePhotoFallbackText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.md,
    color: Colors.bgPrimary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },

  // Sign-out button
  signOutBtn: {
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: Colors.accentRose + '40',
    backgroundColor: Colors.accentRose + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.base,
    color: Colors.accentRose,
    letterSpacing: -0.3,
  },

  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: Colors.bgSecondary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  settingLeft: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.base,
    color: Colors.textPrimary,
  },
  settingSubtitle: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textMuted,
    marginLeft: 4,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: Fonts.bodyMedium,
    fontSize: FontSizes.xs,
  },
  sheetText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 24,
  },
  timePill: {
    backgroundColor: Colors.bgTertiary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  timeText: {
    fontFamily: Fonts.heading,
    fontSize: FontSizes.md,
    color: Colors.accentCyan,
  },
  timeTo: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textMuted,
  },
  freqRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  freqRowActive: {
    backgroundColor: 'rgba(99,179,237,0.05)',
  },
  freqText: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.base,
    color: Colors.textSecondary,
  },
  freqTextActive: {
    color: Colors.accentCyan,
    fontFamily: Fonts.bodyMedium,
  },
  freqCheck: {
    fontSize: FontSizes.md,
    color: Colors.accentCyan,
  },
  clearWarning: {
    fontFamily: Fonts.bodyRegular,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  clearActions: {
    flexDirection: 'row',
    gap: 12,
  },
});
