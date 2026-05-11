import React from 'react'
import { View, StyleSheet, ScrollView } from 'react-native'
import { Check } from 'lucide-react-native'
import { ScreenWrapper } from '../../components/templates'
import { Header, Card } from '../../components/organisms'
import { ListItem } from '../../components/molecules'
import { useProfileStore } from '../../stores/profileStore'
import { LANGUAGES } from '../../constants/questions'
import { tokens, space, layout } from '../../design/tokens'
import type { LanguageScreenProps } from '../../navigation/types'

export default function LanguageScreen({ navigation }: LanguageScreenProps) {
  const languageOverride = useProfileStore((s) => s.languageOverride)
  const changeLanguage = useProfileStore((s) => s.changeLanguage)
  const currentCode = languageOverride ?? 'en'

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
                right={
                  lang.code === currentCode
                    ? <Check size={20} color={tokens.accent.primary} />
                    : null
                }
                onPress={() => {
                  if (lang.code !== currentCode) changeLanguage(lang.code)
                  navigation.goBack()
                }}
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
