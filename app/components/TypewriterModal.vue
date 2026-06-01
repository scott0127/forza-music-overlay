<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  isOpen: { type: Boolean, required: true },
  lang: { type: String, default: 'zh-Hant' }
});

const emit = defineEmits(['update:isOpen', 'close']);

const displayedText = ref('');
const isFinishedTyping = ref(false);
let streamTimeout: NodeJS.Timeout | null = null;
let charIndex = 0;

const zhMessage = "這個工具是免費的。\n如果工具有幫到你，可以請還在讀碩士的我喝杯咖啡☕或是贊助我幫我累積購買設備的錢，支持後續修正與新功能。";
const enMessage = "This tool is free and open-source.\nIf it helps you, consider buying me a coffee ☕ to support my work and cover future updates. Thank you!";

const getMessage = () => {
  return props.lang === 'en' ? enMessage : zhMessage;
};

const close = () => {
  if (streamTimeout) clearTimeout(streamTimeout);
  emit('update:isOpen', false);
  emit('close');
};

const streamText = () => {
  const message = getMessage();
  if (charIndex >= message.length) {
    isFinishedTyping.value = true;
    return;
  }

  const char = message[charIndex];
  displayedText.value += char;
  charIndex++;

  streamTimeout = setTimeout(streamText, 38);
};

const startTyping = () => {
  if (streamTimeout) clearTimeout(streamTimeout);
  displayedText.value = '';
  isFinishedTyping.value = false;
  charIndex = 0;

  // Start streaming after title + divider animations finish (approx 1300ms)
  streamTimeout = setTimeout(streamText, 1300);
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    startTyping();
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';
  } else {
    if (streamTimeout) clearTimeout(streamTimeout);
    document.body.style.overflow = '';
  }
});

// Keyboard ESC close support
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    close();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div
    class="dl-backdrop"
    :class="{ 'is-open': isOpen }"
    @click.self="close"
  >
    <div
      v-if="isOpen"
      class="dl-modal"
      role="dialog"
      aria-labelledby="dlTitle"
    >
      <!-- Close Button -->
      <button
        class="dl-close"
        type="button"
        :aria-label="lang === 'en' ? 'Close' : '關閉'"
        @click="close"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </button>

      <!-- Checkmark Animation -->
      <div class="dl-check">
        <svg viewBox="0 0 52 52">
          <circle class="dl-check-circle" cx="26" cy="26" r="25" />
          <path class="dl-check-tick" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
      </div>

      <!-- Title -->
      <h3 class="dl-title" id="dlTitle">
        {{ lang === 'en' ? 'Your download has started!' : '已經開始下載了！' }}
      </h3>

      <hr class="dl-divider">

      <!-- Stream Text -->
      <p class="dl-stream">
        <span v-html="displayedText.replace(/\n/g, '<br>')" />
        <span v-if="!isFinishedTyping" class="dl-cursor" />
      </p>

      <!-- Actions -->
      <div
        class="dl-actions"
        :class="{ 'is-shown': isFinishedTyping }"
      >
        <a
          class="dl-cta"
          href="https://buymeacoffee.com/scott5497"
          target="_blank"
          rel="noopener noreferrer"
        >
          ☕ {{ lang === 'en' ? 'Buy Me a Coffee' : 'Buy Me a Coffee' }}
        </a>
        <button
          class="dl-skip"
          type="button"
          @click="close"
        >
          {{ lang === 'en' ? 'Keep browsing 🙌' : '繼續瀏覽 🙌' }}
        </button>
      </div>
    </div>
  </div>
</template>
