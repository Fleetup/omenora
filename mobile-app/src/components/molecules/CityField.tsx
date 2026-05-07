import React, { useState, useRef, useEffect } from 'react'
import {
  ActivityIndicator,
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native'
import { MapPin, X } from 'lucide-react-native'
import * as Haptics from 'expo-haptics'
import { Text } from '../atoms'
import { TextField } from './TextField'
import { searchPlaces, type Place } from '../../api/nominatim'
import { tokens, space, radius, layout } from '../../design/tokens'

export interface CityFieldProps {
  label: string
  value: Place | null
  onChange: (place: Place | null) => void
  placeholder?: string
  error?: string
  hint?: string
  required?: boolean
  style?: ViewStyle
}

export const CityField: React.FC<CityFieldProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search city...',
  error,
  hint,
  required = false,
  style,
}) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const lastSearchAtRef = useRef(0)

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current != null) {
        clearTimeout(debounceTimerRef.current)
      }
      abortRef.current?.abort()
    }
  }, [])

  const resolvedLabel = required ? `${label} *` : label

  const doSearch = (text: string) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    lastSearchAtRef.current = Date.now()

    setLoading(true)
    setSearchError(null)

    searchPlaces(text, controller.signal)
      .then(places => {
        if (!controller.signal.aborted) {
          setResults(places)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSearchError("Couldn't search places")
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      })
  }

  const handleQueryChange = (text: string) => {
    setQuery(text)

    if (debounceTimerRef.current != null) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }

    if (text.trim().length < 2) {
      setResults([])
      setSearchError(null)
      return
    }

    debounceTimerRef.current = setTimeout(() => {
      const elapsed = Date.now() - lastSearchAtRef.current
      const extra = elapsed < 1000 ? 1000 - elapsed : 0

      if (extra > 0) {
        debounceTimerRef.current = setTimeout(() => doSearch(text.trim()), extra)
      } else {
        doSearch(text.trim())
        debounceTimerRef.current = null
      }
    }, 400)
  }

  const handleSelect = (place: Place) => {
    Haptics.selectionAsync()
    onChange(place)
    setQuery('')
    setResults([])
    setSearchError(null)
  }

  const handleClear = () => {
    Haptics.selectionAsync()
    onChange(null)
    setQuery('')
    setResults([])
    setSearchError(null)
  }

  const chipText = value != null
    ? [value.name, value.region, value.country]
        .filter((s): s is string => s != null && s.length > 0)
        .join(', ')
    : ''

  return (
    <View style={style}>
      <Text variant="label" style={styles.label}>
        {resolvedLabel}
      </Text>

      {value != null ? (
        <View style={styles.chip}>
          <MapPin size={18} color={tokens.text.accent} />
          <Text variant="body" style={styles.chipText}>
            {chipText}
          </Text>
          <Pressable onPress={handleClear} style={styles.clearButton}>
            <X size={18} color={tokens.text.tertiary} />
          </Pressable>
        </View>
      ) : (
        <>
          <View style={styles.inputWrapper}>
            <TextField
              autoCapitalize="words"
              autoComplete="off"
              autoCorrect={false}
              value={query}
              onChangeText={handleQueryChange}
              placeholder={placeholder}
            />
            {loading && (
              <View style={styles.spinnerOverlay}>
                <ActivityIndicator size="small" color={tokens.text.secondary} />
              </View>
            )}
          </View>

          {searchError != null && (
            <Text variant="caption" style={styles.searchError}>
              {searchError}
            </Text>
          )}

          {results.length > 0 && (
            <View style={styles.resultsList}>
              {results.map((place, index) => (
                <Pressable
                  key={place.id}
                  onPress={() => handleSelect(place)}
                  style={[
                    styles.resultRow,
                    index < results.length - 1 && styles.resultBorder,
                  ]}
                >
                  <Text variant="body" style={styles.resultText}>
                    {[place.name, place.region, place.country]
                      .filter((s): s is string => s != null && s.length > 0)
                      .join(', ')}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      {error != null && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}

      {error == null && hint != null && value == null && (
        <Text variant="caption" style={styles.hintText}>
          {hint}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  label: {
    color:        tokens.text.secondary,
    marginBottom: space['1'],
  },
  chip: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: tokens.accent.subtle,
    borderRadius:    radius.md,
    padding:         space['3'],
    gap:             space['2'],
  },
  chipText: {
    flex:  1,
    color: tokens.text.primary,
  },
  clearButton: {
    minWidth:       layout.tapTarget,
    minHeight:      layout.tapTarget,
    alignItems:     'center',
    justifyContent: 'center',
  },
  inputWrapper: {
    position: 'relative',
  },
  spinnerOverlay: {
    position:       'absolute',
    right:          space['4'],
    top:            0,
    bottom:         0,
    justifyContent: 'center',
    alignItems:     'center',
  },
  searchError: {
    color:     tokens.state.danger,
    marginTop: space['1'],
  },
  resultsList: {
    backgroundColor: tokens.surface.overlay,
    borderRadius:    radius.md,
    marginTop:       space['1'],
  },
  resultRow: {
    paddingVertical:   space['3'],
    paddingHorizontal: space['4'],
  },
  resultBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: tokens.border.subtle,
  },
  resultText: {
    color: tokens.text.primary,
  },
  errorText: {
    color:     tokens.state.danger,
    marginTop: space['1'],
  },
  hintText: {
    color:     tokens.text.tertiary,
    marginTop: space['1'],
  },
})
