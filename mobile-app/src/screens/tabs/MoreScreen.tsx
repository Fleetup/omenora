import React, { useCallback } from 'react'
import { View, ScrollView, Alert, Linking, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Constants from 'expo-constants'
import {
  Heart,
  Calendar,
  Compass,
  User,
  CreditCard,
  Bell,
  Globe,
  Shield,
  FileText,
  Info,
  LifeBuoy,
  Trash2,
  LogOut,
  HelpCircle,
  Mail,
  Layers,
  Lock,
} from 'lucide-react-native'
import { Text } from '../../components/atoms'
import { Card } from '../../components/organisms'
import { ListItem } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { usePurchases } from '../../context/usePurchases'
import { useAuth } from '../../context/useAuth'
import { tokens, space, layout } from '../../design/tokens'
import type { MoreScreenProps } from '../../navigation/types'

export default function MoreScreen({ navigation }: MoreScreenProps) {
  const { firstName, languageOverride } = useProfileStore()
  const { isPremium } = usePurchases()
  const { signOut, deleteAccount, showAuthGate, isAnonymous } = useAuth()
  const version = Constants.expoConfig?.version ?? 'unknown'

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, profile, and reading history. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount()
            } catch {
              // Error already alerted inside deleteAccount
            }
          },
        },
      ],
    )
  }, [deleteAccount])

  const handleSignOut = useCallback(() => {
    Alert.alert(
      'Sign out',
      'Sign out of OMENORA?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign out',
          onPress: async () => {
            try {
              // skipWarning: true — signOut has its own internal Alert; we provide ours
              await signOut({ skipWarning: true })
            } catch (err) {
              Alert.alert('Could not sign out', String(err))
            }
          },
        },
      ],
    )
  }, [signOut])

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Account header ─────────────────────────────────────────── */}
        <Card variant="default" padding="default">
          <Text variant="heading2" color="primary">Account</Text>
          <View style={styles.accountSubRow}>
            <Text variant="body" color="secondary">
              {firstName ?? 'Welcome'}
            </Text>
            <View style={[styles.planBadge, isPremium && styles.planBadgePremium]}>
              <Text variant="micro" color={isPremium ? 'accent' : 'tertiary'}>
                {isPremium ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>
          </View>
        </Card>

        {/* ── Section 1: Premium Features ────────────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            Premium Features
          </Text>
          <Card variant="default" style={styles.listCard}>
            <ListItem
              icon={Heart}
              label="Compatibility"
              onPress={() => navigation.navigate('Compatibility')}
              showChevron
            />
            <View style={styles.divider} />
            <ListItem
              icon={Calendar}
              label="Lucky Timing Calendar"
              onPress={() => navigation.navigate('Calendar')}
              showChevron
            />
            <View style={styles.divider} />
            <ListItem
              icon={Compass}
              label="Tradition switcher"
              onPress={() => navigation.navigate('TraditionSwitcher')}
              showChevron
            />
          </Card>
        </View>

        {/* ── Section 2: Account & Settings ──────────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            Account &amp; Settings
          </Text>
          <Card variant="default" style={styles.listCard}>
            {/* Profile route not yet registered — Phase 6 */}
            <ListItem
              icon={User}
              label="Profile"
              meta="Coming soon"
              disabled
            />
            <View style={styles.divider} />
            {/* Subscription route not in RootStackParamList — open iOS subscription management */}
            <ListItem
              icon={CreditCard}
              label="Subscription"
              onPress={() => Linking.openURL('https://apps.apple.com/account/subscriptions')}
              showChevron
            />
            <View style={styles.divider} />
            {/* Notifications route not yet registered — Phase 6 */}
            <ListItem
              icon={Bell}
              label="Notifications"
              meta="Coming soon"
              disabled
            />
            <View style={styles.divider} />
            {/* Language selector — Phase 6 */}
            <ListItem
              icon={Globe}
              label="Language"
              meta={`${languageOverride ?? 'English'} \u00b7 Coming soon`}
              disabled
            />
          </Card>
        </View>

        {/* ── Section 3: Trust & Compliance ──────────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            Trust &amp; Compliance
          </Text>
          <Card variant="default" style={styles.listCard}>
            {/* navigate() not Linking — web /privacy URL doesn't exist yet */}
            <ListItem
              icon={Shield}
              label="Privacy & Data"
              onPress={() => navigation.navigate('Privacy')}
              showChevron
            />
            <View style={styles.divider} />
            {/* navigate() not Linking — web /terms URL doesn't exist yet */}
            <ListItem
              icon={FileText}
              label="Terms of Service"
              onPress={() => navigation.navigate('Terms')}
              showChevron
            />
            <View style={styles.divider} />
            {/* Counsel guidelines — Phase 5 builds CounselDisclosureModal */}
            <ListItem
              icon={Info}
              label="Counsel guidelines"
              meta="Coming soon"
              disabled
            />
            <View style={styles.divider} />
            {/* CrisisResources route not yet registered — Phase 5 */}
            <ListItem
              icon={LifeBuoy}
              label="Crisis resources"
              meta="Coming soon"
              disabled
            />
            {!isAnonymous && (
              <>
                <View style={styles.divider} />
                <ListItem
                  icon={Trash2}
                  label="Account deletion"
                  destructive
                  onPress={handleDeleteAccount}
                />
              </>
            )}
            <View style={styles.divider} />
            <ListItem
              icon={LogOut}
              label="Sign out"
              onPress={handleSignOut}
            />
          </Card>
        </View>

        {/* ── Section 4: Support ─────────────────────────────────────── */}
        <View>
          <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
            Support
          </Text>
          <Card variant="default" style={styles.listCard}>
            {/* /faq page does not exist on web yet — disabled until it ships */}
            <ListItem
              icon={HelpCircle}
              label="Help / FAQ"
              meta="Coming soon"
              disabled
            />
            <View style={styles.divider} />
            <ListItem
              icon={Mail}
              label="Contact support"
              onPress={() => Linking.openURL('mailto:support@omenora.com')}
              showChevron
            />
            <View style={styles.divider} />
            <ListItem
              icon={Info}
              label="About OMENORA"
              meta={`v${version}`}
            />
          </Card>
        </View>

        {/* ── Section 5: Developer (dev-only) ───────────────────────── */}
        {__DEV__ && (
          <View>
            <Text variant="micro" color="tertiary" style={styles.sectionHeading}>
              Developer (dev-only)
            </Text>
            <Card variant="default" style={styles.listCard}>
              <ListItem
                icon={Layers}
                label="Component Gallery"
                onPress={() => navigation.navigate('Components')}
                showChevron
              />
              <View style={styles.divider} />
              <ListItem
                icon={Lock}
                label="Test AuthGate"
                onPress={() => showAuthGate({ title: 'Test', body: 'Dev test trigger' })}
              />
            </Card>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex:            1,
    backgroundColor: tokens.surface.base,
  },
  scroll: {
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['6'],
    paddingBottom:     space['10'],
    gap:               layout.cardGap,
  },
  accountSubRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginTop:      space['2'],
  },
  planBadge: {
    borderWidth:       1,
    borderColor:       tokens.border.subtle,
    borderRadius:      4,
    paddingVertical:   2,
    paddingHorizontal: space['2'],
  },
  planBadgePremium: {
    borderColor: tokens.border.accent,
  },
  sectionHeading: {
    marginBottom: space['2'],
  },
  listCard: {
    paddingHorizontal: 0,
    paddingVertical:   0,
    overflow:          'hidden',
  },
  divider: {
    height:          StyleSheet.hairlineWidth,
    backgroundColor: tokens.border.subtle,
    marginHorizontal: space['4'],
  },
})
