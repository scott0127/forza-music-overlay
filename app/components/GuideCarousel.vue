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

// Touch/Swipe support. Desktop mouse drags are intentionally ignored so card
// interactions do not accidentally flip the carousel.
type PointerStart = {
  x: number;
  y: number;
};

let pointerStart: PointerStart | null = null;
let pointerInput = false;
const interactiveSelector = 'button, input, label, a, textarea, select, .demo-panel, [data-carousel-no-swipe]';

const handlePointerDown = (event: PointerEvent) => {
  if (event.pointerType === 'mouse') return;
  if ((event.target as HTMLElement).closest(interactiveSelector)) return;
  pointerInput = true;
  pointerStart = { x: event.clientX, y: event.clientY };
};

const handlePointerUp = (event: PointerEvent) => {
  if (pointerStart === null) return;
  const distanceX = event.clientX - pointerStart.x;
  const distanceY = event.clientY - pointerStart.y;
  pointerStart = null;
  if (Math.abs(distanceX) > 96 && Math.abs(distanceX) > Math.abs(distanceY) * 1.35) {
    show(current.value + (distanceX < 0 ? 1 : -1));
  }
  setTimeout(() => {
    pointerInput = false;
  }, 0);
};

const handlePointerCancel = () => {
  pointerStart = null;
  pointerInput = false;
};

const handleMouseDown = () => {
  pointerStart = null;
};

const handleMouseUp = () => {
  pointerStart = null;
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
