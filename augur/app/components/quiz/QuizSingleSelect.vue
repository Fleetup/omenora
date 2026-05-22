<template>
  <div class="single-select">
    <AppHeadline variant="italic" as="h2" class="single-select__headline">
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
        <span v-if="opt.emoji" class="single-select__emoji">{{ opt.emoji }}</span>
        <span class="single-select__label">{{ opt.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Option {
  id: string
  label: string
  emoji?: string
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
  color: var(--text-secondary);
}

.single-select__grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.single-select__grid--two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.single-select__chip {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--surface-raised);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 400;
  color: var(--text-primary);
  transition: background var(--duration-fast) var(--ease-out),
              border-color var(--duration-fast) var(--ease-out);
}

.single-select__chip:hover {
  background: var(--surface-elevated);
  border-color: var(--border-default);
}

.single-select__chip--selected {
  background: var(--surface-elevated);
  border-color: var(--text-primary);
}

.single-select__emoji {
  font-size: var(--text-lg);
  line-height: 1;
  flex-shrink: 0;
}

.single-select__label {
  line-height: 1.4;
}
</style>
