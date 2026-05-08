import React, { useEffect, useState } from 'react'
import { Dimensions, Keyboard, Platform, Pressable, View, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'
import { useTheme } from '../../design/theme/useTheme'
import { tokens, space, radius, layout } from '../../design/tokens'

const SCREEN_HEIGHT = Dimensions.get('window').height

export interface BottomSheetProps {
  visible: boolean
  onClose: () => void
  height?: number
  children: React.ReactNode
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  visible,
  onClose,
  height = SCREEN_HEIGHT * 0.5,
  children,
}) => {
  const { reduceMotion } = useTheme()
  const translateY = useSharedValue(SCREEN_HEIGHT)
  const [shouldRender, setShouldRender] = useState(visible)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })
    return () => {
      showSub.remove()
      hideSub.remove()
    }
  }, [])

  useEffect(() => {
    if (visible) {
      setShouldRender(true)
      translateY.value = reduceMotion
        ? 0
        : withSpring(0, { damping: 18, stiffness: 180 })
    } else {
      const onComplete = () => setShouldRender(false)
      translateY.value = reduceMotion
        ? SCREEN_HEIGHT
        : withTiming(SCREEN_HEIGHT, { duration: 300 }, (finished) => {
            if (finished) runOnJS(onComplete)()
          })
    }
  }, [visible, reduceMotion])

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY
      }
    })
    .onEnd((event) => {
      if (event.translationY > SCREEN_HEIGHT * 0.3) {
        runOnJS(onClose)()
      } else {
        translateY.value = withSpring(0, { damping: 18, stiffness: 180 })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  if (!shouldRender) return null

  return (
    <View style={styles.overlay}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, { height }, animatedStyle]}>
          <View style={styles.handle} />
          <View style={[styles.content, { paddingBottom: keyboardHeight > 0 ? keyboardHeight : space['6'] }]}>
            {children}
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: tokens.specialty.lockScrim,
  },
  sheet: {
    backgroundColor:      tokens.surface.floating,
    borderTopLeftRadius:  radius.xl,
    borderTopRightRadius: radius.xl,
  },
  handle: {
    width:           36,
    height:          4,
    backgroundColor: tokens.border.strong,
    borderRadius:    radius.pill,
    alignSelf:       'center',
    marginTop:       space['2'],
    marginBottom:    space['3'],
  },
  content: {
    flex:              1,
    paddingHorizontal: layout.screenPadding,
    paddingBottom:     space['6'],
  },
})
