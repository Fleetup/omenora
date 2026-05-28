<template>
  <div class="time-input">
    <AppHeadline variant="lg" as="h2" class="time-input__headline">
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
      <AppButton
        variant="ghost"
        size="sm"
        @click="onSkip"
      >
        {{ skipLabel }}
      </AppButton>
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
  color: var(--omn-text-secondary);
}

.time-input__field {
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
  color-scheme: dark;
  transition: border-color var(--omn-duration-fast) var(--omn-ease);
}

.time-input__field:focus {
  border-bottom-color: var(--omn-accent);
}

.time-input__actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-3);
}
</style>
