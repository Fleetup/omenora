<template>
  <div class="single-select">
    <AppHeadline variant="lg" as="h2" class="single-select__headline">
      {{ headline }}
    </AppHeadline>
    <AppCaption v-if="subtext" variant="default" as="p" class="single-select__subtext">
      {{ subtext }}
    </AppCaption>
    <div class="single-select__grid" :class="{ 'single-select__grid--two-col': options.length >= 6 }">
      <button
        v-for="opt in options"
        :key="opt.id"
        class="single-select__chip"
        :class="{ 'single-select__chip--selected': selected === opt.id }"
        type="button"
        @click="onSelect(opt.id)"
      >
        <span class="single-select__label">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Option {
  id: string
  label: string
}

interface Props {
  headline: string
  subtext?: string
  options: Option[]
  selected: string | undefined
}

defineProps<Props>()

const emit = defineEmits<{
  select: [id: string]
}>()

function onSelect(id: string) {
  emit('select', id)
}
</script>

<style scoped>
.single-select {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.single-select__headline {
  margin: 0;
}

.single-select__subtext {
  margin: 0;
  color: var(--omn-text-secondary);
}

.single-select__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Two-col layout reserved for ≥6 option sets. Single column on narrow
   viewports for thumb-comfortable scanning. */
.single-select__grid--two-col {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-3);
}
@media (min-width: 600px) {
  .single-select__grid--two-col { grid-template-columns: 1fr 1fr; }
}

.single-select__chip {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--omn-bg-primary);
  border: 1px solid var(--omn-border-subtle);
  border-radius: 0;
  cursor: pointer;
  text-align: left;
  font-family: var(--omn-font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-regular);
  color: var(--omn-text-primary);
  letter-spacing: var(--tracking-body);
  transition:
    background var(--omn-duration-fast) var(--omn-ease),
    border-color var(--omn-duration-fast) var(--omn-ease),
    transform var(--omn-duration-fast) var(--omn-ease);
}

.single-select__chip:hover {
  background: var(--omn-bg-elevated);
  border-color: var(--omn-border-emphasis);
}
.single-select__chip:active { transform: translateY(1px); }

/* Selected — bronze accent border for the editorial conversion moment. */
.single-select__chip--selected {
  background: var(--omn-bg-elevated);
  border-color: var(--omn-accent);
}

.single-select__chip:focus-visible {
  outline: 2px solid var(--omn-accent);
  outline-offset: 3px;
}


.single-select__label {
  line-height: 1.4;
}
</style>
