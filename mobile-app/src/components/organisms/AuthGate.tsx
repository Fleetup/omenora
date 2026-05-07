import React, { useCallback, useEffect, useState } from 'react'
import { View, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'
import { Mail, ArrowLeft } from 'lucide-react-native'
import { GoogleSigninButton } from '@react-native-google-signin/google-signin'

import { BottomSheet } from './BottomSheet'
import { Text } from '../atoms/Text'
import { Button } from '../atoms/Button'
import { TextField } from '../molecules/TextField'
import { Divider } from '../atoms/Divider'
import { useAuth } from '../../context/useAuth'
import { useTheme } from '../../design/theme/useTheme'
import { space } from '../../design/tokens'

export interface AuthGateProps {
  visible: boolean
  title?: string
  body?: string
  onClose: () => void
}

type GateState = 'idle' | 'email_input' | 'email_sent'

const DEFAULT_TITLE = 'Save your archetype'
const DEFAULT_BODY = 'Sign in to keep your readings synced across devices.'

export const AuthGate: React.FC<AuthGateProps> = ({
  visible,
  title = DEFAULT_TITLE,
  body = DEFAULT_BODY,
  onClose,
}) => {
  const { signInWithApple, signInWithGoogle, signInWithMagicLink, isAnonymous } = useAuth()
  const { tokens } = useTheme()

  const [gateState, setGateState] = useState<GateState>('idle')
  const [email, setEmail] = useState('')
  const [appleLoading, setAppleLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)

  // Auto-close when user transitions from anonymous to permanent.
  useEffect(() => {
    if (visible && !isAnonymous) {
      // Brief delay so user sees confirmation, then dismiss.
      const timer = setTimeout(() => onClose(), 400)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [visible, isAnonymous, onClose])

  // Reset internal state when sheet closes.
  useEffect(() => {
    if (!visible) {
      setGateState('idle')
      setEmail('')
      setAppleLoading(false)
      setGoogleLoading(false)
      setEmailLoading(false)
    }
  }, [visible])

  const handleApple = useCallback(async () => {
    setAppleLoading(true)
    try {
      await signInWithApple()
    } finally {
      setAppleLoading(false)
    }
  }, [signInWithApple])

  const handleGoogle = useCallback(async () => {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } finally {
      setGoogleLoading(false)
    }
  }, [signInWithGoogle])

  const handleSendMagicLink = useCallback(async () => {
    if (!email.includes('@')) return
    setEmailLoading(true)
    try {
      await signInWithMagicLink(email)
      setGateState('email_sent')
    } catch {
      // AuthProvider already alerted user; stay on email_input
    } finally {
      setEmailLoading(false)
    }
  }, [email, signInWithMagicLink])

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
      >
        <View style={{ paddingHorizontal: space['5'], paddingBottom: space['6'] }}>
        {gateState === 'idle' && (
          <>
            <Text variant="heading2" color="primary" style={{ textAlign: 'center' }}>
              {title}
            </Text>
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: 'center', marginTop: space['2'], marginBottom: space['6'] }}
            >
              {body}
            </Text>

            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={{ width: '100%', height: 50, marginBottom: space['3'] }}
              onPress={handleApple}
            />
            {appleLoading && (
              <ActivityIndicator
                size="small"
                color={tokens.text.primary}
                style={{ position: 'absolute', alignSelf: 'center', top: 50 }}
              />
            )}

            <GoogleSigninButton
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Light}
              style={{ width: '100%', height: 50, marginBottom: space['3'] }}
              onPress={handleGoogle}
              disabled={googleLoading}
            />
            {googleLoading && (
              <ActivityIndicator
                size="small"
                color={tokens.text.primary}
                style={{ position: 'absolute', alignSelf: 'center', top: 100 }}
              />
            )}

            <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: space['4'] }}>
              <View style={{ flex: 1 }}>
                <Divider variant="default" />
              </View>
              <Text variant="micro" color="tertiary" style={{ marginHorizontal: space['3'] }}>
                OR
              </Text>
              <View style={{ flex: 1 }}>
                <Divider variant="default" />
              </View>
            </View>

            <Button
              label="Continue with email"
              variant="tertiary"
              icon={Mail}
              onPress={() => setGateState('email_input')}
            />
          </>
        )}

        {gateState === 'email_input' && (
          <>
            <Text variant="heading2" color="primary" style={{ textAlign: 'center' }}>
              Continue with email
            </Text>
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: 'center', marginTop: space['2'], marginBottom: space['5'] }}
            >
              We'll send you a magic link to sign in.
            </Text>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              required
            />

            <View style={{ height: space['4'] }} />

            <Button
              label="Send magic link"
              onPress={handleSendMagicLink}
              loading={emailLoading}
              disabled={!email.includes('@')}
            />

            <View style={{ height: space['2'] }} />

            <Button
              label="Back"
              variant="tertiary"
              icon={ArrowLeft}
              onPress={() => setGateState('idle')}
            />
          </>
        )}

        {gateState === 'email_sent' && (
          <>
            <Text variant="heading2" color="primary" style={{ textAlign: 'center' }}>
              Check your email
            </Text>
            <Text
              variant="body"
              color="secondary"
              style={{ textAlign: 'center', marginTop: space['2'], marginBottom: space['6'] }}
            >
              We sent a sign-in link to {email}. Tap it to finish signing in.
            </Text>

            <Button label="Got it" onPress={onClose} />
          </>
        )}
        </View>
      </KeyboardAvoidingView>
    </BottomSheet>
  )
}
