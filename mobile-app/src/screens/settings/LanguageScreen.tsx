import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert } from 'react-native'
import { Check } from 'lucide-react-native'
import { ScreenWrapper } from '../../components/templates'
import { Header, Card } from '../../components/organisms'
import { ListItem } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { useAuth } from '../../context/useAuth'
import { updateProfileField, ProfileSaveError } from '../../services/profileService'
import { LANGUAGES } from '../../constants/questions'
import { tokens, space, layout } from '../../design/tokens'
import type { LanguageScreenProps } from '../../navigation/types'

export default function LanguageScreen({ navigation }: LanguageScreenProps) {
  const languageOverride = useProfileStore((s) => s.languageOverride)
  const changeLanguage   = useProfileStore((s) => s.changeLanguage)
  const currentCode      = languageOverride ?? 'en'
  const { user, isAnonymous } = useAuth()

  const [saving, setSaving] = useState(false)

  const handleLanguageSelect = async (code: string) => {
    if (code === currentCode) {
      navigation.goBack()
      return
    }

    if (isAnonymous || !user?.id) {
      changeLanguage(code)
      navigation.goBack()
      return
    }

    setSaving(true)
    try {
      await updateProfileField(user.id, 'language_override', code)
      changeLanguage(code)
      navigation.goBack()
    } catch (err: any) {
      setSaving(false)
      if (err instanceof ProfileSaveError && err.kind === 'network') {
        Alert.alert(
          "Couldn't save language",
          "Your preference is saved locally and will sync when you're back online.",
          [{ text: 'OK', onPress: () => { changeLanguage(code); navigation.goBack() } }],
        )
      } else {
        Alert.alert('Save failed', 'Please try again.')
      }
    }
  }

  return (
    <ScreenWrapper scroll={false} padded={false} background="base">
      <Header title="Language" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card variant="default" style={styles.listCard}>
          {LANGUAGES.map((lang, index) => (
            <React.Fragment key={lang.code}>
              {index > 0 && <View style={styles.divider} />}
              <ListItem
                label={`${lang.flag}  ${lang.label}`}
                showChevron={false}
                disabled={saving}
                right={
                  lang.code === currentCode
                    ? <Check size={20} color={tokens.accent.primary} />
                    : null
                }
                onPress={() => void handleLanguageSelect(lang.code)}
              />
            </React.Fragment>
          ))}
        </Card>
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
  divider: {
    height:           StyleSheet.hairlineWidth,
    backgroundColor:  tokens.border.subtle,
    marginHorizontal: space['4'],
  },
})
