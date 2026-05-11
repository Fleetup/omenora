import React, { useState, useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { ChatBubble, Header } from '../../components/organisms'
import { ScreenWrapper } from '../../components/templates'
import { Text } from '../../components/atoms'
import { useProfileStore } from '../../stores/profileStore'
import { usePurchases } from '../../context/usePurchases'
import { CounselDisclosureModal } from './CounselDisclosureModal'
import { space, layout } from '../../design/tokens'
import type { CounselChatScreenProps } from '../../navigation/types'

export default function CounselChatScreen({ navigation, route }: CounselChatScreenProps) {
  const hasAcceptedCounselDisclosure = useProfileStore(
    (s) => s.hasAcceptedCounselDisclosure
  )
  const { isPremium } = usePurchases()

  const [disclosureVisible, setDisclosureVisible] = useState(
    !hasAcceptedCounselDisclosure || (route.params?.showDisclosure ?? false)
  )

  // Belt-and-suspenders: non-premium users should never reach this screen
  useEffect(() => {
    if (!isPremium) navigation.goBack()
  }, [isPremium, navigation])

  return (
    <ScreenWrapper scroll={false} padded={false} background="base" keyboardBehavior="padding">
      <Header title="Counsel" onBack={() => navigation.goBack()} />

      {/* ── Shell placeholder — Cluster 3 replaces with real FlatList + input ── */}
      <View style={styles.content}>
        <Text variant="caption" color="tertiary" style={styles.shellNote}>
          Real chat experience ships in Cluster 3.
          Showing ChatBubble variants for visual verification.
        </Text>

        <View style={styles.bubbles}>
          <ChatBubble
            variant="system"
            message="Counsel is ready. Ask about your chart, patterns, or what's ahead."
          />
          <ChatBubble
            variant="counsel"
            message="Welcome. Your chart carries a particular tension between drive and depth. What's been on your mind?"
          />
          <ChatBubble
            variant="user"
            message="Why does the same pattern keep showing up in my relationships?"
          />
        </View>
      </View>

      {/* ── Disclosure overlay — visible on first access or via MoreScreen ── */}
      <CounselDisclosureModal
        visible={disclosureVisible}
        onAccept={() => setDisclosureVisible(false)}
        onCrisisResources={() => navigation.navigate('CrisisResources')}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  content: {
    flex:              1,
    paddingHorizontal: layout.screenPadding,
    paddingTop:        space['4'],
    gap:               space['4'],
  },
  shellNote: {
    textAlign:    'center',
    fontStyle:    'italic',
    marginBottom: space['2'],
  },
  bubbles: {
    gap: space['2'],
  },
})
