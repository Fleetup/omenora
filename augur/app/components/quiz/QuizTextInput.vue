<template>
  <div class="text-input">
    <AppHeadline variant="lg" as="h2" class="text-input__headline">
      {{ headline }}
    </AppHeadline>
    <AppCaption v-if="subtext" variant="default" as="p" class="text-input__subtext">
      {{ subtext }}
    </AppCaption>
    <input
      class="text-input__field"
      :type="inputType"
      :placeholder="placeholder"
      :maxlength="maxLength"
      :value="value ?? ''"
      autocomplete="on"
      @input="onInput"
      @keydown.enter="onContinue"
    />
    <AppCaption v-if="disclaimerText" variant="default" as="p" class="text-input__disclaimer">
      {{ disclaimerText }}
    </AppCaption>
    <AppButton
      variant="primary"
      class="text-input__cta"
      :disabled="!isValid"
      @click="onContinue"
    >
      Continue
    </AppButton>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Props {
  headline: string
  subtext?: string
  value: string | undefined
  placeholder: string
  maxLength?: number
  inputType?: 'text' | 'email'
  required: boolean
  disclaimerText?: string
}

const props = withDefaults(defineProps<Props>(), {
  inputType: 'text',
})

const emit = defineEmits<{
  update: [value: string]
  continue: []
}>()

const isValid = computed(() => {
  const v = props.value ?? ''
  if (props.inputType === 'email') return EMAIL_RE.test(v)
  if (props.maxLength) return v.length >= 1 && v.length <= props.maxLength
  return v.length >= 1
})

function onInput(e: Event) {
  emit('update', (e.target as HTMLInputElement).value)
}

function onContinue() {
  if (!isValid.value) return
  emit('continue')
}
</script>

<style scoped>
.text-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.text-input__headline {
  margin: 0;
}

.text-input__subtext {
  margin: 0;
  color: var(--omn-text-secondary);
}

.text-input__field {
  width: 100%;
  padding: var(--space-4) 0;
  font-family: var(--omn-font-display);
  font-size: var(--text-xl);
  font-weight: var(--weight-light);
  letter-spacing: var(--tracking-snug);
  color: var(--omn-text-primary);
  background: transparent;
  border: none;
  border-bottom: 1px solid var(--omn-border-primary);
  outline: none;
  border-radius: 0;
  transition: border-color var(--omn-duration-fast) var(--omn-ease);
}

.text-input__field:focus {
  /* Bronze accent on focus — editorial-system focus indicator. */
  border-bottom-color: var(--omn-accent);
}

.text-input__field::placeholder {
  color: var(--omn-text-tertiary);
  font-style: italic;
}

.text-input__disclaimer {
  margin: 0;
  color: var(--omn-text-tertiary);
  line-height: 1.6;
}

.text-input__cta {
  align-self: flex-start;
}
</style>
