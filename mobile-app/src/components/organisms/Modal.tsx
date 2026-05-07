import React from 'react'
import { Modal as RNModal, Pressable, SafeAreaView, View, StyleSheet } from 'react-native'
import { X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text } from '../atoms'
import { tokens, layout } from '../../design/tokens'

export interface ModalProps {
  visible: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  presentationStyle?: 'pageSheet' | 'fullScreen'
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  presentationStyle = 'pageSheet',
}) => {
  const handleClose = () => {
    Haptics.selectionAsync()
    onClose()
  }

  return (
    <RNModal
      visible={visible}
      animationType="slide"
      presentationStyle={presentationStyle}
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.content}>
        {title != null && (
          <View style={styles.header}>
            <View style={styles.headerSlot} />
            <Text variant="heading2" style={styles.headerTitle}>
              {title}
            </Text>
            <Pressable onPress={handleClose} style={styles.headerSlot}>
              <X size={24} color={tokens.text.primary} />
            </Pressable>
          </View>
        )}
        <SafeAreaView style={styles.body}>
          {children}
        </SafeAreaView>
      </View>
    </RNModal>
  )
}

const styles = StyleSheet.create({
  content: {
    flex:            1,
    backgroundColor: tokens.surface.base,
  },
  header: {
    flexDirection:     'row',
    alignItems:        'center',
    height:            56,
    paddingHorizontal: layout.screenPadding,
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.border.subtle,
  },
  headerSlot: {
    width:          44,
    height:         44,
    alignItems:     'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex:      1,
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
})
