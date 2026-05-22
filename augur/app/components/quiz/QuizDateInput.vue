<template>
  <div class="date-input">
    <AppHeadline variant="italic" as="h2" class="date-input__headline">
      {{ headline }}
    </AppHeadline>
    <AppCaption v-if="subtext" variant="default" as="p" class="date-input__subtext">
      {{ subtext }}
    </AppCaption>
    <input
      class="date-input__field"
      type="date"
      :value="value ?? ''"
      @change="onDateChange"
    />
    <AppButton
      variant="primary"
      class="date-input__cta"
      :disabled="!isValid"
      @click="onContinue"
    >
      Continue
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  headline: string
  subtext?: string
  value: string | undefined
  required: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  update: [value: string]
  continue: []
}>()

const isValid = computed(() => {
  if (!props.value) return false
  return props.value.length === 10
})

function onDateChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  if (val) emit('update', val)
}

function onContinue() {
  if (!isValid.value) return
  emit('continue')
}
</script>

<style scoped>
.date-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.date-input__headline {
  margin: 0;
}

.date-input__subtext {
  margin: 0;
  color: var(--text-secondary);
}

.date-input__field {
  width: 100%;
  padding: var(--space-4) 0;
  font-family: var(--font-sans);
  font-size: var(--text-xl);
  font-weight: 300;
  color: var(--text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--border-strong);
  outline: none;
  border-radius: 0;
  color-scheme: dark;
}

.date-input__field:focus {
  border-bottom-color: var(--text-primary);
}

.date-input__cta {
  align-self: flex-start;
}
</style>
