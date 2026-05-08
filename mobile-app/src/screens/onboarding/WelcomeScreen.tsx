import React from 'react'
import { View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { OnboardingStep } from '../../components/templates'
import { Button } from '../../components/atoms'
import { RootStackParamList } from '../../navigation/types'

type WelcomeNavProp = NativeStackNavigationProp<RootStackParamList, 'Welcome'>

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNavProp>()

  return (
    <OnboardingStep
      heading="Discover your archetype in 60 seconds"
      subheading="Your birth data unlocks a reading built only for you"
      footer={
        <Button
          label="Begin"
          variant="primary"
          fullWidth
          onPress={() => {
            // BirthInfo screen lands in Cluster B — pressing this in Cluster A will throw "screen not handled" until then
            navigation.navigate('BirthInfo')
          }}
        />
      }
    >
      <View />
    </OnboardingStep>
  )
}
