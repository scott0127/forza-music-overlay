<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  label: { type: String, default: '' },
  prevLabel: { type: String, default: 'Previous' },
  nextLabel: { type: String, default: 'Next' },
  dotLabel: { type: String, default: 'Go to slide' },
  slidesCount: { type: Number, required: true }
});

const current = ref(0);
const carouselRef = ref<HTMLElement | null>(null);

const show = (index: number) => {
  current.value = (index + props.slidesCount) % props.slidesCount;
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    event.preventDefault();
    show(current.value - 1);
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault();
    show(current.value + 1);
  }
};

// Touch/Swipe support
let pointerStart: number | null = null;
let pointerInput = false;

const handlePointerDown = (event: PointerEvent) => {
  if ((event.target as HTMLElement).closest('button, input, label')) return;
  pointerInput = true;
  pointerStart = event.clientX;
};

const handlePointerUp = (event: PointerEvent) => {
  if (pointerStart === null) return;
  const distance = event.clientX - pointerStart;
  pointerStart = null;
  if (Math.abs(distance) > 48) {
    show(current.value + (distance < 0 ? 1 : -1));
  }
  setTimeout(() => {
    pointerInput = false;
  }, 0);
};

const handlePointerCancel = () => {
  pointerStart = null;
  pointerInput = false;
};

const handleMouseDown = (event: MouseEvent) => {
  if ((event.target as HTMLElement).closest('button, input, label')) return;
  if (!pointerInput) pointerStart = event.clientX;
};

const handleMouseUp = (event: MouseEvent) => {
  if (pointerInput || pointerStart === null) return;
  const distance = event.clientX - pointerStart;
  pointerStart = null;
  if (Math.abs(distance) > 48) {
    show(current.value + (distance < 0 ? 1 : -1));
  }
};
</script>

<template>
  <div
    ref="carouselRef"
    class="guide-carousel"
    role="region"
    aria-roledescription="carousel"
    :aria-label="label"
    tabindex="0"
    @keydown="handleKeyDown"
  >
    <div class="carousel-shell">
      <!-- Prev Arrow -->
      <button
        class="carousel-arrow carousel-prev"
        type="button"
        :aria-label="prevLabel"
        :title="prevLabel"
        @click="show(current - 1)"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </button>

      <!-- Viewport -->
      <div
        class="carousel-viewport"
        @pointerdown="handlePointerDown"
        @pointerup="handlePointerUp"
        @pointercancel="handlePointerCancel"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
      >
        <div
          class="carousel-track"
          :style="{ transform: `translate3d(${-current * 100}%, 0, 0)` }"
        >
          <!-- Slots for slides. Inject the active index into slots so children can respond if needed -->
          <slot :current-index="current" />
        </div>
      </div>

      <!-- Next Arrow -->
      <button
        class="carousel-arrow carousel-next"
        type="button"
        :aria-label="nextLabel"
        :title="nextLabel"
        @click="show(current + 1)"
      >
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- Footer -->
    <div class="carousel-footer">
      <p class="carousel-count">
        {{ String(current + 1).padStart(2, '0') }} / {{ String(slidesCount).padStart(2, '0') }}
      </p>
      <div class="carousel-dots">
        <button
          v-for="(_, index) in slidesCount"
          :key="index"
          class="carousel-dot"
          :class="{ 'is-active': index === current }"
          type="button"
          :aria-label="`${dotLabel} ${index + 1}`"
          :title="`${dotLabel} ${index + 1}`"
          :aria-current="index === current ? 'true' : 'false'"
          @click="show(index)"
        />
      </div>
    </div>
  </div>
</template>
