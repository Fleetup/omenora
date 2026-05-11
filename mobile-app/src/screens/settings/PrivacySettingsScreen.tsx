import React from 'react'
import { StyleSheet, Switch, ScrollView } from 'react-native'
import { ScreenWrapper } from '../../components/templates'
import { Header, Card } from '../../components/organisms'
import { ListItem } from '../../components/molecules'
import { Text, Button } from '../../components/atoms'
import { useProfileStore } from '../../stores/profileStore'
import { tokens, space, layout } from '../../design/tokens'
import type { PrivacySettingsScreenProps } from '../../navigation/types'

export default function PrivacySettingsScreen({ navigation }: PrivacySettingsScreenProps) {
  const analyticsEnabled = useProfileStore((s) => s.analyticsEnabled)
  const setAnalyticsEnabled = useProfileStore((s) => s.setAnalyticsEnabled)

  return (
    <ScreenWrapper scroll={false} padded={false} background="base">
      <Header title="Privacy & Data" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="default" style={styles.listCard}>
          <ListItem
            label="Share anonymous usage data"
            right={
              <Switch
                value={analyticsEnabled}
                onValueChange={setAnalyticsEnabled}
                trackColor={{ true: tokens.accent.primary, false: tokens.border.default }}
              />
            }
          />
        </Card>
        <Text variant="caption" color="secondary" style={styles.helperText}>
          We use anonymous data to improve OMENORA. No personal information is shared or sold.
        </Text>
        <Button
          label="Read our Privacy Policy"
          variant="tertiary"
          onPress={() => navigation.navigate('Privacy')}
          style={styles.policyButton}
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
  listCard: {
    paddingHorizontal: 0,
    paddingVertical:   0,
    overflow:          'hidden',
  },
  helperText: {
    marginTop: space['3'],
  },
  policyButton: {
    marginTop:  space['6'],
    alignSelf: 'center',
  },
})
