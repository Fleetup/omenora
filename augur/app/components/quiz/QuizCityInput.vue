<template>
  <div class="city-input">
    <AppHeadline variant="italic" as="h2" class="city-input__headline">
      {{ headline }}
    </AppHeadline>
    <AppCaption v-if="subtext" variant="default" as="p" class="city-input__subtext">
      {{ subtext }}
    </AppCaption>
    <PlacesAutocomplete
      :model-value="localCity"
      placeholder="Start typing a city…"
      @update:model-value="onCityInput"
      @place-selected="onPlaceSelected"
    />
    <div class="city-input__actions">
      <AppButton
        variant="primary"
        :disabled="!isValid"
        @click="onContinue"
      >
        Continue
      </AppButton>
      <button
        v-if="skipLabel"
        type="button"
        class="city-input__skip"
        @click="onSkip"
      >
        {{ skipLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Props {
  headline: string
  subtext?: string
  value: string | undefined
  lat: number | null
  lng: number | null
  skipLabel?: string
  required: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [payload: { city: string; lat: number | null; lng: number | null }]
  skip: []
  continue: []
}>()

const localCity = ref(props.value ?? '')
const localLat  = ref<number | null>(props.lat)
const localLng  = ref<number | null>(props.lng)

watch(() => props.value, (val) => { if (val !== undefined) localCity.value = val })
watch(() => props.lat,   (val) => { localLat.value = val })
watch(() => props.lng,   (val) => { localLng.value = val })

const isValid = computed(() =>
  localCity.value.trim().length >= 2
)

function onCityInput(val: string) {
  localCity.value = val
  localLat.value  = null
  localLng.value  = null
}

function onPlaceSelected(place: { name: string; lat: number; lng: number; placeId: string }) {
  localCity.value = place.name
  localLat.value  = place.lat
  localLng.value  = place.lng
  emit('update', { city: place.name, lat: place.lat, lng: place.lng })
}

function onContinue() {
  if (!isValid.value) return
  emit('update', { city: localCity.value, lat: localLat.value, lng: localLng.value })
  emit('continue')
}

function onSkip() {
  emit('skip')
  emit('continue')
}
</script>

<style scoped>
.city-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.city-input__headline {
  margin: 0;
}

.city-input__subtext {
  margin: 0;
  color: var(--text-secondary);
}

.city-input__actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.city-input__skip {
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  color: var(--text-tertiary);
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.city-input__skip:hover {
  color: var(--text-secondary);
}
</style>
