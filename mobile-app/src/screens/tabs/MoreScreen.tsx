import React, { useCallback } from 'react'
import { View, ScrollView, Alert, Linking, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CommonActions } from '@react-navigation/native'
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
  LogIn,
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
  const { languageOverride } = useProfileStore()
  const { isPremium, presentCustomerCenter } = usePurchases()
  const { signOut, showAuthGate, isAnonymous, displayName, user } = useAuth()
  const version = Constants.expoConfig?.version ?? 'unknown'

  const handleSignOut = useCallback(async () => {
    if (isAnonymous) {
      // Anonymous users: signing out abandons their local-only session — data-loss warning.
      Alert.alert(
        'Sign out and lose your data?',
        'Your profile and readings are not linked to an account and cannot be recovered after sign-out.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign out',
            style: 'destructive',
            onPress: async () => {
              try {
                await signOut({ skipWarning: true })
                const parent = navigation.getParent()
                if (parent) {
                  parent.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }))
                } else {
                  console.warn('[MoreScreen] sign-out: getParent() returned null, falling back to navigation.dispatch — investigate navigator nesting')
                  navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }))
                }
              } catch (err) {
                Alert.alert('Could not sign out', String(err))
              }
            },
          },
        ],
      )
    } else {
      // Permanent users: sign-out is recoverable — skip the dialog, one tap.
      try {
        await signOut({ skipWarning: true })
        const parent = navigation.getParent()
        if (parent) {
          parent.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }))
        } else {
          console.warn('[MoreScreen] sign-out: getParent() returned null, falling back to navigation.dispatch — investigate navigator nesting')
          navigation.dispatch(CommonActions.reset({ index: 0, routes: [{ name: 'Splash' }] }))
        }
      } catch (err) {
        Alert.alert('Could not sign out', String(err))
      }
    }
  }, [signOut, isAnonymous, navigation])

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
            <View style={styles.accountIdentity}>
              <Text variant="body" color="secondary">
                {displayName || 'Welcome'}
              </Text>
              {!isAnonymous && user?.email ? (
                <Text variant="caption" color="tertiary" style={styles.accountEmail}>
                  {user.email}
                </Text>
              ) : null}
            </View>
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
            {/* Sign-in CTA — only visible for anonymous users */}
            {isAnonymous && (
              <>
                <ListItem
                  icon={LogIn}
                  label="Sign in or create account"
                  meta="Save your readings across devices"
                  onPress={() => showAuthGate()}
                  showChevron
                />
                <View style={styles.divider} />
              </>
            )}
            {/* Profile route not yet registered — Phase 6 */}
            <ListItem
              icon={User}
              label="Profile"
              onPress={() => navigation.navigate('Profile')}
              showChevron
            />
            <View style={styles.divider} />
            {/* Subscription route not in RootStackParamList — open iOS subscription management */}
            <ListItem
              icon={CreditCard}
              label="Subscription"
              onPress={presentCustomerCenter}
              showChevron
            />
            <View style={styles.divider} />
            {/* Notifications route not yet registered — Phase 6 */}
            <ListItem
              icon={Bell}
              label="Notifications"
              onPress={() => navigation.navigate('Notifications')}
              showChevron
            />
            <View style={styles.divider} />
            {/* Language selector — Phase 6 */}
            <ListItem
              icon={Globe}
              label="Language"
              meta={languageOverride ?? 'English'}
              onPress={() => navigation.navigate('Language')}
              showChevron
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
              onPress={() => navigation.navigate('PrivacySettings')}
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
            <ListItem
              icon={Info}
              label="Counsel guidelines"
              onPress={() => navigation.navigate('CounselChat', { showDisclosure: true })}
              showChevron
            />
            <View style={styles.divider} />
            <ListItem
              icon={LifeBuoy}
              label="Crisis resources"
              onPress={() => navigation.navigate('CrisisResources')}
              showChevron
            />
            {!isAnonymous && (
              <>
                <View style={styles.divider} />
                <ListItem
                  icon={Trash2}
                  label="Account deletion"
                  destructive
                  onPress={() => navigation.navigate('DeleteAccount')}
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
  accountIdentity: {
    flex: 1,
    gap:  2,
  },
  accountEmail: {
    marginTop: 1,
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
