<template>
  <div class="places-input-wrap">
    <label :for="inputId" class="field-label label-caps">
      {{ label || 'City of birth' }}
    </label>

    <input
      :id="inputId"
      :name="inputId"
      ref="inputRef"
      v-model="query"
      type="text"
      class="editorial-input"
      :placeholder="placeholder || 'Start typing a city…'"
      autocomplete="off"
      @input="onInput"
      @keydown.down.prevent="highlightNext"
      @keydown.up.prevent="highlightPrev"
      @keydown.enter.prevent="selectHighlighted"
      @keydown.escape="closeSuggestions"
      @blur="onBlur"
    />

    <div
      v-if="suggestions.length > 0 && isOpen"
      class="places-suggestions"
    >
      <button
        v-for="(s, i) in suggestions"
        :key="i"
        class="places-suggestion-item"
        :class="{
          'places-suggestion-item--highlighted': i === highlightedIndex
        }"
        @mousedown.prevent="selectSuggestion(s)"
      >
        <span class="places-suggestion-item__main">
          {{ s.mainText }}
        </span>
        <span class="places-suggestion-item__secondary">
          {{ s.secondaryText }}
        </span>
      </button>
    </div>

    <p v-if="hint" class="field-hint annotation">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'

const props = defineProps<{
  modelValue: string
  label?: string
  placeholder?: string
  hint?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'place-selected': [place: {
    name: string
    lat: number
    lng: number
    placeId: string
  }]
}>()

const config = useRuntimeConfig()
const inputId = `places-input-${Math.random().toString(36).slice(2, 8)}`
const query = ref(props.modelValue)
const suggestions = ref<any[]>([])
const isOpen = ref(false)
const highlightedIndex = ref(-1)
const inputRef = ref<HTMLInputElement | null>(null)

let AutocompleteSuggestion: any = null
let AutocompleteSessionToken: any = null
let sessionToken: any = null
let debounceTimer: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  try {
    const key = config.public.googlePlacesKey as string
    if (!key) {
      console.warn('[PlacesAutocomplete] No API key configured')
      return
    }

    setOptions({ key, v: 'weekly' })
    const placesLib = await importLibrary('places') as any

    if (!placesLib.AutocompleteSuggestion) {
      console.warn(
        '[PlacesAutocomplete] AutocompleteSuggestion not found in places library.',
        'Available exports:', Object.keys(placesLib),
        '\nFix: enable "Places API (New)" in Google Cloud Console → APIs & Services.',
      )
      return
    }

    AutocompleteSuggestion = placesLib.AutocompleteSuggestion
    AutocompleteSessionToken = placesLib.AutocompleteSessionToken
    sessionToken = new AutocompleteSessionToken()
  } catch (e) {
    console.warn('[PlacesAutocomplete] Failed to load Google Places:', e)
  }
})

function onInput() {
  emit('update:modelValue', query.value)
  if (debounceTimer) clearTimeout(debounceTimer)
  if (!query.value || query.value.length < 2) {
    suggestions.value = []
    isOpen.value = false
    return
  }
  debounceTimer = setTimeout(() => fetchSuggestions(query.value), 300)
}

async function fetchSuggestions(input: string) {
  if (!AutocompleteSuggestion || !sessionToken) return
  try {
    const { suggestions: results } =
      await AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input,
        sessionToken,
        includedPrimaryTypes: ['locality', 'administrative_area_level_3'],
      })
    suggestions.value = (results || [])
      .filter((s: any) => s?.placePrediction?.mainText?.text)
      .map((s: any) => ({
        mainText: String(s.placePrediction.mainText.text),
        secondaryText: String(s.placePrediction.text.text).replace(String(s.placePrediction.mainText.text) + ', ', ''),
        placeId: s.placePrediction.placeId,
        _raw: markRaw(s),
      }))
    isOpen.value = suggestions.value.length > 0
    highlightedIndex.value = -1
  } catch (e) {
    console.warn('[PlacesAutocomplete] Fetch error:', e)
    suggestions.value = []
    isOpen.value = false
  }
}

async function selectSuggestion(suggestion: any) {
  const name = suggestion.mainText
  const placeId = suggestion.placeId
  const displayValue = suggestion.secondaryText
    ? `${suggestion.mainText}, ${suggestion.secondaryText}`
    : suggestion.mainText

  query.value = displayValue
  emit('update:modelValue', name)
  closeSuggestions()

  try {
    const placePrediction = suggestion._raw.placePrediction
    const place = placePrediction.toPlace()
    await place.fetchFields({ fields: ['location'] })

    const lat = place.location?.lat()
    const lng = place.location?.lng()

    if (lat != null && lng != null) {
      emit('place-selected', { name, lat, lng, placeId })
    } else {
      console.warn('[PlacesAutocomplete] location not returned by fetchFields')
      emit('place-selected', { name, lat: 0, lng: 0, placeId })
    }

    sessionToken = new AutocompleteSessionToken()
  } catch (e) {
    console.warn('[PlacesAutocomplete] fetchFields error:', e)
    emit('place-selected', { name, lat: 0, lng: 0, placeId })
  }
}

function highlightNext() {
  if (highlightedIndex.value < suggestions.value.length - 1) {
    highlightedIndex.value++
  }
}

function highlightPrev() {
  if (highlightedIndex.value > 0) highlightedIndex.value--
}

function selectHighlighted() {
  if (highlightedIndex.value >= 0) {
    selectSuggestion(suggestions.value[highlightedIndex.value])
  }
}

function closeSuggestions() {
  isOpen.value = false
  highlightedIndex.value = -1
}

function onBlur() {
  setTimeout(closeSuggestions, 150)
}

watch(() => props.modelValue, (val) => {
  if (val && !query.value.startsWith(val)) query.value = val
})
</script>

<style scoped>
.places-input-wrap {
  position: relative;
  width: 100%;
  max-width: 480px;
}

.field-label {
  display: block;
  color: var(--color-ink-faint);
  margin-bottom: 12px;
  font-size: 11px;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  font-family: 'Hanken Grotesk', sans-serif;
  font-weight: 600;
}

.editorial-input {
  width: 100%;
  padding: 14px 0;
  font-family: 'Cormorant Garamond', serif;
  font-size: 24px;
  font-weight: 300;
  color: var(--color-ink);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(26, 22, 18, 0.3);
  outline: none;
  border-radius: 0;
  transition: border-color 0.2s;
}

.editorial-input:focus {
  border-bottom-color: var(--color-ink);
}

.editorial-input::placeholder {
  color: var(--color-ink-faint);
  font-style: italic;
}

.places-suggestions {
  position: absolute;
  top: calc(100% - 1px);
  left: 0;
  right: 0;
  background: var(--color-bone);
  border: 1px solid rgba(26, 22, 18, 0.15);
  border-top: none;
  z-index: 100;
  max-height: 280px;
  overflow-y: auto;
}

.places-suggestion-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-bottom: 1px solid rgba(26, 22, 18, 0.06);
  cursor: pointer;
  text-align: left;
  transition: background 0.12s;
}

.places-suggestion-item:last-child {
  border-bottom: none;
}

.places-suggestion-item:hover,
.places-suggestion-item--highlighted {
  background: rgba(26, 22, 18, 0.04);
}

.places-suggestion-item__main {
  font-family: 'Cormorant Garamond', serif;
  font-size: 18px;
  font-weight: 400;
  color: var(--color-ink);
  line-height: 1.2;
}

.places-suggestion-item__secondary {
  font-family: 'Hanken Grotesk', sans-serif;
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--color-ink-faint);
}

.field-hint {
  margin-top: 10px;
  color: var(--color-ink-faint);
  font-size: 11px;
  font-family: 'Hanken Grotesk', sans-serif;
  letter-spacing: 0.15em;
  text-transform: uppercase;
}
</style>
