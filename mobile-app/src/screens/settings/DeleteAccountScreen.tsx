import React, { useState } from 'react'
import { View, StyleSheet, Alert, ScrollView, Pressable } from 'react-native'
import { Check } from 'lucide-react-native'
import { ScreenWrapper } from '../../components/templates'
import { Header } from '../../components/organisms'
import { Text, Button } from '../../components/atoms'
import { useAuth } from '../../context/useAuth'
import { usePurchases } from '../../context/usePurchases'
import { tokens, space, layout } from '../../design/tokens'
import type { DeleteAccountScreenProps } from '../../navigation/types'

export default function DeleteAccountScreen({ navigation }: DeleteAccountScreenProps) {
  const [acknowledged, setAcknowledged] = useState(false)
  const [busy, setBusy] = useState(false)

  const { deleteAccount } = useAuth()
  const { customerInfo, presentCustomerCenter } = usePurchases()
  const hasActiveSubscription =
    customerInfo?.entitlements?.active?.['premium'] !== undefined

  const confirmFinalDelete = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, profile, and reading history. This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => setBusy(false),
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount()
              setBusy(false)
              navigation.reset({ index: 0, routes: [{ name: 'Splash' }] })
            } catch {
              setBusy(false)
            }
          },
        },
      ]
    )
  }

  const handleDelete = () => {
    setBusy(true)

    if (hasActiveSubscription) {
      Alert.alert(
        'You have an active subscription',
        'Your subscription will continue to be billed by Apple. Please cancel your subscription in the App Store before deleting your account.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
            onPress: () => setBusy(false),
          },
          {
            text: 'Manage Subscription',
            onPress: async () => {
              await presentCustomerCenter()
              setBusy(false)
            },
          },
          {
            text: 'Delete Anyway',
            style: 'destructive',
            onPress: () => confirmFinalDelete(),
          },
        ]
      )
      return
    }

    confirmFinalDelete()
  }

  return (
    <ScreenWrapper scroll={false} padded={false} background="base">
      <Header title="Delete account" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="body" color="secondary" style={styles.warning}>
          Deleting your account is permanent. We'll remove your profile, readings, archetype,
          and all data we have about you. This cannot be undone.
        </Text>

        <Pressable
          onPress={() => setAcknowledged((v) => !v)}
          style={styles.ackRow}
        >
          <View style={[styles.checkbox, acknowledged && styles.checkboxChecked]}>
            {acknowledged && <Check size={14} color={tokens.surface.base} />}
          </View>
          <Text variant="body">I understand this cannot be undone</Text>
        </Pressable>

        <View style={styles.spacer} />

        <Button
          label="Delete my account permanently"
          variant="danger"
          fullWidth
          disabled={!acknowledged || busy}
          loading={busy}
          onPress={handleDelete}
        />
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['4'],
    paddingBottom:     space['10'],
  },
  warning: {
    marginBottom: space['4'],
  },
  ackRow: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           space['3'],
    paddingVertical: space['3'],
  },
  checkbox: {
    width:           20,
    height:          20,
    borderRadius:    4,
    borderWidth:     1.5,
    borderColor:     tokens.border.default,
    alignItems:      'center',
    justifyContent:  'center',
  },
  checkboxChecked: {
    backgroundColor: tokens.accent.primary,
    borderColor:     tokens.accent.primary,
  },
  spacer: {
    height: space['6'],
  },
})
