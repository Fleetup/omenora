<template>
  <div class="time-input">
    <AppHeadline variant="italic" as="h2" class="time-input__headline">
      {{ headline }}
    </AppHeadline>
    <AppCaption v-if="subtext" variant="default" as="p" class="time-input__subtext">
      {{ subtext }}
    </AppCaption>
    <input
      class="time-input__field"
      type="time"
      :value="value ?? ''"
      @change="onTimeChange"
    />
    <div class="time-input__actions">
      <AppButton
        variant="primary"
        @click="onContinue"
      >
        Continue
      </AppButton>
      <button
        type="button"
        class="time-input__skip"
        @click="onSkip"
      >
        {{ skipLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  headline: string
  subtext?: string
  value: string | undefined
  skipLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  skipLabel: "I don't know",
})

const emit = defineEmits<{
  update: [value: string | null]
  continue: []
}>()

function onTimeChange(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update', val || null)
}

function onContinue() {
  emit('update', props.value ?? null)
  emit('continue')
}

function onSkip() {
  emit('update', null)
  emit('continue')
}
</script>

<style scoped>
.time-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.time-input__headline {
  margin: 0;
}

.time-input__subtext {
  margin: 0;
  color: var(--text-secondary);
}

.time-input__field {
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

.time-input__field:focus {
  border-bottom-color: var(--text-primary);
}

.time-input__actions {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.time-input__skip {
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

.time-input__skip:hover {
  color: var(--text-secondary);
}
</style>
