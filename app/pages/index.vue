<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { usePageMotion } from '../composables/usePageMotion';

// Page SEO Meta
useSeoMeta({
  title: 'GamingMusicOverlay (GMO)',
  description: 'GamingMusicOverlay (GMO) 下載頁、專案更新紀錄與 Windows 安裝說明。',
  ogTitle: 'GamingMusicOverlay (GMO)',
  ogDescription: '在玩 Forza 時顯示歌曲資訊與動態歌詞，並以快捷鍵或手把控制 App / System 音量。',
  ogType: 'website',
  ogImage: '/forza-music-overlay/brand/gmo-logo.svg'
});

// Modal State
const showTypewriterModal = ref(false);
const pageRoot = ref<HTMLElement | null>(null);
usePageMotion(pageRoot);

// Sponsor drink picker
const supportDrinks = [
  { icon: '☕', name: '咖啡', note: '適合把修正清單逐項完成' },
  { icon: '🧋', name: '珍珠奶茶', note: '適合補充長時間除錯的耐力' },
  { icon: '🍵', name: '抹茶拿鐵', note: '適合整理下一版的新功能' },
  { icon: '🥤', name: '氣泡飲', note: '適合替新點子加一點靈感' }
];
const supportDrinkIndex = ref(0);
const supportDrink = computed(() => supportDrinks[supportDrinkIndex.value]);
const shuffleSupportDrink = () => {
  const offset = 1 + Math.floor(Math.random() * (supportDrinks.length - 1));
  supportDrinkIndex.value = (supportDrinkIndex.value + offset) % supportDrinks.length;
};

// Dynamic Hero Player Compute Properties
const selectedServiceColor = computed(() => {
  if (selectedService.value === 'Spotify') return '#22c55e';
  if (selectedService.value === 'YouTube Music') return '#ef4444';
  return '#ec4899'; // Apple Music
});

const selectedServiceTextClass = computed(() => {
  if (selectedService.value === 'Spotify') return 'text-green-400';
  if (selectedService.value === 'YouTube Music') return 'text-red-400';
  return 'text-pink-400';
});

const selectedServiceBgClass = computed(() => {
  if (selectedService.value === 'Spotify') return 'bg-green-400';
  if (selectedService.value === 'YouTube Music') return 'bg-red-400';
  return 'bg-pink-400';
});

const selectedServiceBorderColor = computed(() => {
  if (selectedService.value === 'Spotify') return 'rgba(34,197,94,0.3)';
  if (selectedService.value === 'YouTube Music') return 'rgba(239,68,68,0.3)';
  return 'rgba(236,72,153,0.3)';
});

const selectedServiceBgSoft = computed(() => {
  if (selectedService.value === 'Spotify') return 'rgba(34,197,94,0.12)';
  if (selectedService.value === 'YouTube Music') return 'rgba(239,68,68,0.12)';
  return 'rgba(236,72,153,0.12)';
});

// Interactive Demo States (STEP 1 - 9)
// STEP 1
const selectedService = ref('YouTube Music');

// Platform Autoplay Showcase logic
const servicesList = ['YouTube Music', 'Spotify', 'Apple Music'];
const isAutoplayActive = ref(true);
const showTryTooltip = ref(false);
let autoplayTimer: any = null;

const startAutoplay = () => {
  let index = 0;
  autoplayTimer = setInterval(() => {
    if (!isAutoplayActive.value) {
      if (autoplayTimer) clearInterval(autoplayTimer);
      return;
    }
    index = (index + 1) % servicesList.length;
    selectedService.value = servicesList[index];
    
    // Stop autoplay after cycling to the 3rd platform (Apple Music, index 2)
    if (index === 2) {
      if (autoplayTimer) clearInterval(autoplayTimer);
      isAutoplayActive.value = false;
      showTryTooltip.value = true;
    }
  }, 2200);
};

const selectPlatform = (platform: string) => {
  isAutoplayActive.value = false;
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
  }
  showTryTooltip.value = false;
  selectedService.value = platform;
};

// STEP 2
const volumeTarget = ref<'app' | 'system'>('app');
const lyricsOn = ref(true);
// STEP 3
const playerScale = ref(80);
// STEP 4
const dragPosition = ref({ x: 20, y: 15 });
const isDragging = ref(false);
let startDrag = { x: 0, y: 0, left: 0, top: 0 };
const dragFeedback = ref('拖曳播放器預覽，感受定位方式');

const onDragStart = (e: PointerEvent) => {
  const overlay = e.currentTarget as HTMLElement;
  const stage = overlay.parentElement as HTMLElement;
  isDragging.value = true;
  startDrag = {
    x: e.clientX,
    y: e.clientY,
    left: overlay.offsetLeft,
    top: overlay.offsetTop
  };
  overlay.setPointerCapture(e.pointerId);
};

const onDragMove = (e: PointerEvent) => {
  if (!isDragging.value) return;
  const overlay = e.currentTarget as HTMLElement;
  const stage = overlay.parentElement as HTMLElement;
  const newX = Math.max(0, Math.min(stage.clientWidth - overlay.offsetWidth, startDrag.left + e.clientX - startDrag.x));
  const newY = Math.max(0, Math.min(stage.clientHeight - overlay.offsetHeight, startDrag.top + e.clientY - startDrag.y));
  dragPosition.value = { x: newX, y: newY };
};

const onDragEnd = (e: PointerEvent) => {
  if (!isDragging.value) return;
  isDragging.value = false;
  dragFeedback.value = '位置已更新，正式程式會自動記住。';
};

// STEP 5
const isPlaying = ref(false);
const playFeedback = ref('已暫停');
const togglePlay = () => {
  isPlaying.value = !isPlaying.value;
  playFeedback.value = isPlaying.value ? '播放中' : '已暫停';
};

// STEP 6
const tracks = ['Night Drive', 'Horizon Pulse', 'Neon Highway'];
const trackIndex = ref(0);
const trackFeedback = ref('已切換歌曲');
const nextTrack = () => {
  trackIndex.value = (trackIndex.value + 1) % tracks.length;
  trackFeedback.value = `已切換歌曲: ${tracks[trackIndex.value]}`;
};
const prevTrack = () => {
  trackIndex.value = (trackIndex.value - 1 + tracks.length) % tracks.length;
  trackFeedback.value = `已切換歌曲: ${tracks[trackIndex.value]}`;
};

// STEP 7
const currentVolume = ref(72);
const volumeUp = () => {
  currentVolume.value = Math.min(100, currentVolume.value + 8);
};
const volumeDown = () => {
  currentVolume.value = Math.max(0, currentVolume.value - 8);
};

// STEP 8
const isOverlayHidden = ref(false);
const overlayFeedback = ref('播放器已顯示。');
const toggleOverlayVisibility = () => {
  isOverlayHidden.value = !isOverlayHidden.value;
  overlayFeedback.value = isOverlayHidden.value ? '播放器已隱藏，音樂仍會繼續播放。' : '播放器已顯示。';
};

// STEP 9
const consoleMinimized = ref(false);
const consoleFeedback = ref('控制台已叫回桌面。');
const minimizeConsole = () => {
  consoleMinimized.value = true;
  consoleFeedback.value = '控制台已縮到系統匣。';
};
const restoreConsole = () => {
  consoleMinimized.value = false;
  consoleFeedback.value = '控制台已叫回桌面。';
};

// INSTALL STEP DEMOS
const downloadReady = ref(false);
const zipExtracted = ref(false);
const simulatedLaunch = ref(false);
const shortcutsCreated = ref(false);

const handleDownloadReady = () => {
  downloadReady.value = true;
};
const handleExtract = () => {
  zipExtracted.value = true;
};
const handleLaunch = () => {
  simulatedLaunch.value = true;
};
const handleShortcuts = () => {
  shortcutsCreated.value = true;
};

// Download logic with popup optimized behavior
const handleDownloadClick = (e: MouseEvent, url: string) => {
  e.preventDefault();
  // 1. Open Buy Me a Coffee in new tab
  window.open("https://buymeacoffee.com/scott5497", "_blank", "noopener,noreferrer");
  
  // 2. Open Typewriter Modal
  showTypewriterModal.value = true;

  // 3. Trigger download link directly in current window
  window.location.href = url;
};

onMounted(() => {
  // Autoplay Showcase trigger after brief initial delay
  setTimeout(() => {
    if (isAutoplayActive.value) {
      startAutoplay();
    }
  }, 1200);
});

onUnmounted(() => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
  }
});
</script>

<template>
  <main ref="pageRoot" class="gsap-page">
    <!-- HEADER NAVBAR -->
    <header class="motion-header sticky top-0 z-50 bg-[#090a0f]/80 backdrop-blur-xl border-b border-slate-900/80 py-4">
      <div class="wrap w-full flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <img src="/brand/gmo-mark.svg" alt="" class="w-14 h-9 object-contain" aria-hidden="true">
          <div class="flex flex-col">
            <span class="text-white font-black tracking-[0.32em] text-lg uppercase leading-none">GMO</span>
            <span class="text-[9px] text-slate-400 font-bold tracking-wider mt-0.5">GamingMusicOverlay</span>
          </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="hidden lg:flex items-center gap-8">
          <a href="#features" class="text-slate-300 hover:text-cyan-400 font-bold text-sm tracking-wide transition-colors">功能特色</a>
          <a href="#updates" class="text-slate-300 hover:text-cyan-400 font-bold text-sm tracking-wide transition-colors">更新紀錄</a>
          <a href="#faq" class="text-slate-300 hover:text-cyan-400 font-bold text-sm tracking-wide transition-colors">常見問題</a>
          <a href="#sponsor" class="text-slate-300 hover:text-cyan-400 font-bold text-sm tracking-wide transition-colors">支援開發</a>
        </nav>

        <!-- CTA Controls -->
        <div class="flex items-center gap-3">
          <a href="https://github.com/scott0127/forza-horizon-6-youtube-muisc-player" target="_blank" rel="noopener noreferrer" class="border border-slate-700 bg-slate-950/50 hover:bg-slate-900/60 text-slate-300 hover:text-white rounded-lg px-4 py-2 text-sm flex items-center gap-2 transition-colors font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></svg>
            GitHub
          </a>
        </div>
      </div>
    </header>

    <!-- HERO SECTION -->
    <section 
      class="motion-hero relative overflow-hidden min-h-[85vh] py-16 flex items-center bg-cover" 
      style="background-image: linear-gradient(to right, #090a0f 0%, rgba(9, 10, 15, 0.97) 38%, rgba(9, 10, 15, 0.6) 72%, rgba(9, 10, 15, 0.97) 100%), url('/forza-music-overlay/downloads/forza-music-overlay/hero-bg.jpg'); background-position: 40% center;"
    >
      <div class="motion-signal-layer absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        <svg><path class="motion-signal-path" /></svg>
        <span class="motion-signal-dot" />
      </div>
      <div class="wrap grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] xl:grid-cols-[1.25fr_0.75fr] gap-8 xl:gap-16 items-center w-full z-10">
        <div class="motion-hero-copy">
          <!-- Badges / Header -->
          <div class="motion-hero-badges flex items-center gap-2 flex-wrap mb-4">
            <span class="bg-[#090a0f] border border-slate-800 text-slate-400 font-extrabold text-[10px] tracking-widest uppercase px-2.5 py-1 rounded">Windows Utility</span>
            <span class="bg-slate-900 border border-slate-800 text-cyan-400 font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded">v3.1.0</span>
            <NuxtLink to="/en" class="bg-amber-400/10 border border-amber-400/20 text-amber-300 font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded hover:bg-amber-400/20 transition-all">English</NuxtLink>
          </div>

          <!-- Main mockup title styling -->
          <div class="motion-title-stage">
            <div class="motion-title-spectrum" aria-hidden="true">
              <span v-for="i in 17" :key="i" class="motion-spectrum-bar" />
            </div>
            <h1 class="motion-hero-title text-white text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black tracking-tight leading-[1.08]">
              <span class="motion-title-primary" aria-label="GamingMusic">
                <span v-for="(letter, index) in 'GamingMusic'" :key="`${letter}-${index}`" class="motion-title-primary-letter" aria-hidden="true">{{ letter }}</span>
              </span><br/>
              <span class="motion-title-overlay" aria-label="Overlay" data-text="Overlay">
                <span v-for="(letter, index) in 'Overlay'" :key="`${letter}-${index}`" class="motion-title-overlay-letter" aria-hidden="true">{{ letter }}</span>
              </span>
            </h1>
          </div>

          <p class="motion-hero-description text-slate-300 text-base md:text-lg leading-relaxed mt-6 max-w-xl">
            在 Forza 遊戲中顯示正在播放的歌曲、動態歌詞與音量狀態，並支援手把／鍵盤快速切歌、播放控制與 App / System 音量切換。
          </p>

          <!-- Dynamic Music Platform Showcase selector -->
          <div class="motion-platform-block mt-8">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-slate-400 text-xs font-black tracking-widest uppercase">支援音樂平台</span>
              <span 
                v-if="isAutoplayActive"
                class="text-[10px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/25 px-1.5 py-0.5 rounded font-extrabold tracking-normal animate-pulse"
              >
                🎬 正在自動示範切換...
              </span>
              <span 
                v-else-if="showTryTooltip"
                class="text-[10px] text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded font-extrabold tracking-normal animate-bounce flex items-center gap-1 shadow-[0_0_12px_rgba(251,191,36,0.2)]"
              >
                ✨ 換你手動點擊試試看！
              </span>
              <span 
                v-else
                class="text-[10px] text-cyan-400 bg-cyan-400/10 border border-cyan-400/25 px-1.5 py-0.5 rounded font-extrabold tracking-normal animate-pulse"
              >
                💡 點擊切換 HUD 預覽
              </span>
            </div>
            <div class="motion-platform-buttons flex flex-wrap gap-3">
              <button 
                class="motion-platform-button border rounded-xl px-4 py-2.5 text-sm flex items-center gap-2.5 font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:border-red-500/40 cursor-pointer shadow-md select-none"
                :class="{ 'is-active shadow-[0_0_15px_rgba(239,68,68,0.25)]': selectedService === 'YouTube Music' }"
                :style="{ '--platform-art-color': '#ef4444', borderColor: selectedService === 'YouTube Music' ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.08)', backgroundColor: selectedService === 'YouTube Music' ? 'rgba(239,68,68,0.12)' : 'rgba(15,23,42,0.45)', color: selectedService === 'YouTube Music' ? '#fca5a5' : '#cbd5e1' }"
                type="button"
                @click="selectPlatform('YouTube Music')"
              >
                <svg class="motion-platform-art" viewBox="0 0 180 48" preserveAspectRatio="none" aria-hidden="true"><ellipse class="motion-platform-morph" cx="24" cy="24" rx="20.5" ry="20.5" /><rect class="motion-platform-morph-target" x="1" y="1" width="178" height="46" rx="12" /></svg>
                <span class="motion-platform-pulse" aria-hidden="true"><b /><i /><i /><i /></span>
                <span class="motion-platform-icon text-red-500 w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0 2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </span>
                <span class="motion-platform-label">YouTube Music</span>
              </button>

              <button 
                class="motion-platform-button border rounded-xl px-4 py-2.5 text-sm flex items-center gap-2.5 font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:border-green-500/40 cursor-pointer shadow-md select-none"
                :class="{ 'is-active shadow-[0_0_15px_rgba(34,197,94,0.25)]': selectedService === 'Spotify' }"
                :style="{ '--platform-art-color': '#22c55e', borderColor: selectedService === 'Spotify' ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.08)', backgroundColor: selectedService === 'Spotify' ? 'rgba(34,197,94,0.12)' : 'rgba(15,23,42,0.45)', color: selectedService === 'Spotify' ? '#86efac' : '#cbd5e1' }"
                type="button"
                @click="selectPlatform('Spotify')"
              >
                <svg class="motion-platform-art" viewBox="0 0 180 48" preserveAspectRatio="none" aria-hidden="true"><ellipse class="motion-platform-morph" cx="24" cy="24" rx="20.5" ry="20.5" /><rect class="motion-platform-morph-target" x="1" y="1" width="178" height="46" rx="12" /></svg>
                <span class="motion-platform-pulse" aria-hidden="true"><b /><i /><i /><i /></span>
                <span class="motion-platform-icon text-green-500 w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.01 0C5.378 0 0 5.378 0 12.01c0 6.63 5.378 12.01 12.01 12.01 6.63 0 12.01-5.38 12.01-12.01C24.02 5.378 18.64 0 12.01 0zm5.512 17.327c-.22.36-.688.48-1.047.26-2.91-1.78-6.575-2.18-10.892-1.196-.41.09-.824-.17-.917-.58-.093-.41.17-.824.58-.918 4.722-1.08 8.765-.623 12.01 1.368.36.22.48.687.26 1.047zm1.47-3.26c-.276.45-.86.59-1.31.32-3.33-2.046-8.406-2.64-12.336-1.448-.5.15-1.033-.13-1.185-.64-.15-.5.13-1.03.64-1.18 4.498-1.366 10.09-.7 13.864 1.62.45.276.6.86.32 1.31zm.126-3.41c-3.993-2.37-10.584-2.59-14.394-1.436-.612.187-1.256-.16-1.44-.775-.186-.613.16-1.257.774-1.44 4.38-1.33 11.64-1.076 16.24 1.655.55.326.733 1.037.407 1.587-.327.55-1.038.733-1.587.407z"/></svg>
                </span>
                <span class="motion-platform-label">Spotify</span>
              </button>

              <button 
                class="motion-platform-button border rounded-xl px-4 py-2.5 text-sm flex items-center gap-2.5 font-bold transition-all duration-300 hover:scale-105 active:scale-95 hover:border-pink-500/40 cursor-pointer shadow-md select-none"
                :class="{ 'is-active shadow-[0_0_15px_rgba(236,72,153,0.25)]': selectedService === 'Apple Music' }"
                :style="{ '--platform-art-color': '#ec4899', borderColor: selectedService === 'Apple Music' ? 'rgba(236,72,153,0.5)' : 'rgba(255,255,255,0.08)', backgroundColor: selectedService === 'Apple Music' ? 'rgba(236,72,153,0.12)' : 'rgba(15,23,42,0.45)', color: selectedService === 'Apple Music' ? '#f9a8d4' : '#cbd5e1' }"
                type="button"
                @click="selectPlatform('Apple Music')"
              >
                <svg class="motion-platform-art" viewBox="0 0 180 48" preserveAspectRatio="none" aria-hidden="true"><ellipse class="motion-platform-morph" cx="24" cy="24" rx="20.5" ry="20.5" /><rect class="motion-platform-morph-target" x="1" y="1" width="178" height="46" rx="12" /></svg>
                <span class="motion-platform-pulse" aria-hidden="true"><b /><i /><i /><i /></span>
                <span class="motion-platform-icon text-pink-500 w-4 h-4 flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.3.03-1.72-.79-3.2-.79-1.49 0-1.95.76-3.18.82-1.28.05-2.25-1.33-3.08-2.57-1.69-2.43-2.98-6.87-1.25-9.88.86-1.49 2.39-2.43 4.06-2.46 1.27-.03 2.47.86 3.2.86.73 0 2.1-1.07 3.54-.91.6.03 2.29.24 3.37 1.83-.09.06-2.02 1.18-2 3.53.03 2.81 2.46 3.74 2.49 3.75-.02.07-.39 1.36-1.29 2.68l.39.67ZM14.88 5.64c.69-.84 1.16-2.01 1.03-3.17-1 .04-2.21.67-2.93 1.51-.65.74-1.21 1.93-1.06 3.07 1.12.09 2.27-.57 2.96-1.41Z"/></svg>
                </span>
                <span class="motion-platform-label">Apple Music</span>
              </button>
            </div>
          </div>

          <!-- Buttons layout matching mockup card elements -->
          <div class="motion-hero-actions grid grid-cols-1 sm:grid-cols-[1.3fr_1fr] gap-3.5 mt-8 max-w-xl">
            <a
              class="motion-download-cta flex items-center gap-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl p-4 text-left shadow-lg shadow-cyan-400/15 hover:scale-[1.01] active:scale-[0.98] transition-all cursor-pointer select-none"
              href="https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.1.0/ForzaMusicOverlay-release3.1.0_portable-test.zip"
              @click="handleDownloadClick($event, 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.1.0/ForzaMusicOverlay-release3.1.0_portable-test.zip')"
            >
              <span class="bg-slate-950/10 p-2.5 rounded-lg text-slate-950 flex items-center justify-center">
                <svg class="w-5 h-5 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M12 3v12m-5-5l5 5 5-5M5 21h14"/></svg>
              </span>
              <div>
                <span class="block font-black text-sm md:text-base leading-none">立即下載 v3.1.0</span>
                <span class="block text-[10px] opacity-75 mt-1 font-bold">Windows / ZIP / MIT License</span>
              </div>
            </a>

            <a class="border border-slate-800 bg-[#090a0f]/65 hover:bg-slate-900/60 text-slate-200 hover:text-white rounded-xl px-5 py-4 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-bold select-none" href="#snapshot">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16"/></svg>
              查看版本快照
            </a>

          </div>

          <!-- Tagline footer banner -->
          <div class="motion-safety-note flex items-center gap-3 text-emerald-400/90 text-xs md:text-sm mt-8 font-semibold tracking-wide border-t border-slate-900/60 pt-4">
            <svg class="w-5 h-5 flex-shrink-0 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>不是模組，不修改遊戲檔案，降低違反遊戲規範的疑慮。</span>
          </div>
        </div>

        <!-- RIGHT COLUMN: Gorgeous Dynamic Glowing In-Game Media HUD matching mockup -->
        <div class="hero-visual-stack">
          <div 
            class="motion-radio-card relative w-full max-w-[450px] aspect-[1.7] bg-slate-950/85 border-2 rounded-2xl p-6 flex flex-col justify-between shadow-2xl backdrop-blur-md transition-all duration-300 transform hover:-translate-y-1 select-none"
            :style="{ borderColor: selectedServiceColor, boxShadow: `0 0 28px ${selectedServiceColor}35` }"
          >
            <span class="motion-radio-receiver" aria-hidden="true" />
            <!-- Glowing neon dynamic waveform graphic on top boundary -->
            <div class="absolute inset-x-6 top-1.5 flex items-end justify-center gap-0.5 h-4 opacity-30 overflow-hidden">
              <span 
                v-for="i in 36" 
                :key="i" 
                class="motion-wave-bar w-[2px] bg-current rounded-full transition-all duration-300"
                :class="selectedServiceTextClass"
                :style="{ height: `${Math.round(Math.max(8, 18 + (Math.sin(i * 0.47) * 28) + ((i * 17) % 31)))}%` }" 
              />
            </div>

            <!-- Header Row: Brand and In-game Volume HUD -->
            <div class="flex items-center justify-between mt-1">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full animate-ping" :style="{ backgroundColor: selectedServiceColor }" />
                <span class="text-[10px] font-black tracking-widest uppercase" :class="selectedServiceTextClass">
                  {{ selectedService }} · Active Session
                </span>
              </div>
              <!-- Volume HUD Indicator -->
              <div 
                class="border px-2.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1.5"
                :style="{ borderColor: selectedServiceColor, color: selectedServiceColor }"
              >
                <span>🔊</span>
                <span>100%</span>
              </div>
            </div>

            <!-- Central Content: Cover art & track details -->
            <div class="flex items-center gap-5 my-2">
              <!-- Real square album cover art mockup (matches real mini-artwork HUD) -->
              <div 
                class="motion-radio-cover w-20 h-20 rounded-xl border flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg transition-all duration-500"
                :style="{ borderColor: selectedServiceColor, backgroundColor: 'rgba(15, 23, 42, 0.8)' }"
              >
                <div v-if="selectedService === 'Spotify'" class="w-full h-full relative group">
                  <div class="absolute inset-0 bg-gradient-to-tr from-green-600/30 via-slate-950 to-slate-900" />
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center">
                    <span class="text-green-400 text-lg mb-0.5">🎵</span>
                    <span class="text-[8px] text-green-300 font-extrabold uppercase tracking-wider scale-90">Love Wins</span>
                  </div>
                </div>
                <div v-else-if="selectedService === 'YouTube Music'" class="w-full h-full relative">
                  <div class="absolute inset-0 bg-gradient-to-tr from-red-600/30 via-slate-950 to-slate-900" />
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center">
                    <span class="text-red-500 text-lg mb-0.5">🎵</span>
                    <span class="text-[8px] text-red-300 font-extrabold uppercase tracking-wider scale-90">Night Drive</span>
                  </div>
                </div>
                <div v-else class="w-full h-full relative">
                  <div class="absolute inset-0 bg-gradient-to-tr from-pink-600/30 via-slate-950 to-slate-900" />
                  <div class="absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center">
                    <span class="text-pink-400 text-lg mb-0.5">🎵</span>
                    <span class="text-[8px] text-pink-300 font-extrabold uppercase tracking-wider scale-90">Neon Hwy</span>
                  </div>
                </div>
              </div>

              <!-- Title, artist and service brand badge -->
              <div class="motion-radio-copy min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 flex-shrink-0" :class="selectedServiceTextClass">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M8 15.5c0-1 1.2-2 4-2s4 1 4 2M7 12.5c0-1.2 1.8-2.6 5-2.6s5 1.4 5 2.6" />
                    </svg>
                  </span>
                  <span class="text-[10px] font-extrabold tracking-widest opacity-60 uppercase">{{ selectedService }}</span>
                </div>
                <h3 class="text-white text-lg font-black truncate mt-1">
                  {{ selectedService === 'Spotify' ? 'Love wins all' : selectedService === 'YouTube Music' ? 'Night Drive' : 'Neon Highway' }}
                </h3>
                <p class="text-slate-400 text-xs font-bold mt-0.5">
                  {{ selectedService === 'Spotify' ? 'IU' : selectedService === 'YouTube Music' ? 'Horizon Pulse' : 'Synth Pulse' }}
                </p>
              </div>
            </div>

            <!-- Bottom Row: Glowing progress bar and track elapsed times -->
            <div class="flex items-center justify-between gap-4 mt-2">
              <div class="flex-grow bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                <div class="motion-radio-progress h-full rounded-full transition-all duration-300" :class="selectedServiceBgClass" style="width: 32%" />
              </div>
              <span class="text-[10px] text-slate-400 font-bold font-mono">0:34 / 2:33</span>
            </div>
          </div>

          <div class="hero-support-story hidden lg:flex">
            <div class="hero-support-icon">
              <img src="/downloads/forza-music-overlay/bmc_qr.png" alt="Buy Me a Coffee 贊助 QR Code">
            </div>
            <div>
              <p class="hero-support-kicker">A grad student's side project</p>
              <p class="hero-support-title">一杯咖啡，讓免費工具繼續更新。</p>
              <p class="hero-support-copy">GMO 會持續免費。你的支持會投入修正、新功能與開發設備。</p>
            </div>
            <div class="hero-support-actions">
              <a class="hero-support-link" href="#sponsor">看看故事</a>
              <a class="hero-support-button" href="https://buymeacoffee.com/scott5497" target="_blank" rel="noopener noreferrer">直接贊助</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- DESKTOP SUPPORT & RELEASE SNAPSHOT -->
    <section class="desktop-release hidden lg:block" id="sponsor">
      <div class="wrap desktop-release-grid">
        <div class="sponsor sponsor-story">
          <div class="sponsor-story-copy">
            <p class="eyebrow">Built after class, shipped for players</p>
            <h2>一個碩士生的遊戲音樂工具，<span>靠每杯咖啡繼續前進。</span></h2>
            <p>GMO 維持免費開放。你的一杯咖啡，會直接變成下一次修正、新功能與更穩定的遊戲體驗。</p>
          </div>

          <div class="support-route" aria-label="贊助支持開發流程">
            <div class="support-route-line" />
            <div class="support-route-step">
              <span class="support-route-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3 4 7v5c0 4.6 3 7.8 8 9 5-1.2 8-4.4 8-9V7Z"/><path d="m9 12 2 2 4-4"/></svg>
              </span>
              <strong>免費開放</strong>
              <small>讓玩家安心使用</small>
            </div>
            <div class="support-route-step is-highlight">
              <span class="support-route-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M3 8h15v7a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5Z"/><path d="M7 3v2M11 3v2M15 3v2"/></svg>
              </span>
              <strong>一杯咖啡</strong>
              <small>支持設備與開發時間</small>
            </div>
            <div class="support-route-step">
              <span class="support-route-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3v18M3 12h18"/><path d="m16 7 3-3M16 17l3 3M8 7 5-3M8 17l-5 3"/></svg>
              </span>
              <strong>下一次更新</strong>
              <small>修正、功能、穩定度</small>
            </div>
          </div>

          <div class="support-drink" aria-live="polite">
            <div class="support-drink-main">
              <span class="support-drink-icon" aria-hidden="true">{{ supportDrink.icon }}</span>
              <div>
                <small>今日開發補給</small>
                <strong>{{ supportDrink.name }}</strong>
                <span>{{ supportDrink.note }}</span>
              </div>
            </div>
            <button class="support-drink-shuffle" type="button" @click="shuffleSupportDrink">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9">
                <path d="M20 7h-4a4 4 0 0 0-4 4v2a4 4 0 0 1-4 4H4"/>
                <path d="m17 4 3 3-3 3M4 7h4a4 4 0 0 1 3 1.4M17 14l3 3-3 3"/>
              </svg>
              換一杯
            </button>
          </div>

          <div class="sponsor-story-footer">
            <div class="sponsor-story-identity">
              <span class="sponsor-story-monogram">SL</span>
              <div>
                <strong>Scott Lin</strong>
                <small>Grad student · GMO developer</small>
              </div>
            </div>
            <div class="sponsor-actions">
              <img class="sponsor-qr" src="/downloads/forza-music-overlay/bmc_qr.png" alt="Buy Me a Coffee 贊助 QR Code">
              <a class="sponsor-button" href="https://buymeacoffee.com/scott5497" target="_blank" rel="noopener noreferrer">請我喝杯{{ supportDrink.name }}</a>
            </div>
          </div>
        </div>

        <aside class="download-panel" id="snapshot">
          <div class="panel-head">
            <div>
              <p>最新版本快照</p>
              <h2>v3.1.0</h2>
            </div>
            <div class="music-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
          </div>

          <div class="meta-row"><span>檔案</span><strong>ForzaMusicOverlay-release3.1.0_portable-test.zip</strong></div>
          <div class="meta-row"><span>平台</span><strong>Windows 10 / 11</strong></div>
          <div class="meta-row"><span>更新日期</span><strong>2026-06-01</strong></div>

          <div class="snapshot-box">
            <p class="box-label">版本快照</p>
            <p>3.1.0 優化程式打包流程，降低 Windows Defender 誤報機率。</p>
            <p>3.0+ 新增 App / System 獨立音量切換與沉浸式閃電 HUD。</p>
            <p>3.0+ 新增即時滾動歌詞與 GPU 加速 SVG 霓虹效果。</p>
          </div>

          <div class="download-box">
            <p class="box-label">最新版下載</p>
            <a
              class="download-link"
              href="https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.1.0/ForzaMusicOverlay-release3.1.0_portable-test.zip"
              @click="handleDownloadClick($event, 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.1.0/ForzaMusicOverlay-release3.1.0_portable-test.zip')"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              ForzaMusicOverlay-release3.1.0_portable-test.zip
            </a>
          </div>
        </aside>
      </div>
    </section>

    <!-- AD SECTION -->
    <section class="ad-section py-10">
      <div class="wrap">
        <div class="ad-container bg-slate-900/20 border border-dashed border-slate-800 rounded-xl p-6 text-center min-h-[120px]">
          <p class="ad-label text-slate-500 text-xs uppercase tracking-wider mb-4">Advertisement</p>
          <!-- Simulated / Standard Ad Container -->
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-4245798974800984"
               data-ad-slot="1700824009"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      </div>
    </section>

    <!-- BAND SECTION -->
    <section class="band bg-slate-950 py-16">
      <div class="wrap overview-grid">
        <div>
          <p class="eyebrow text-cyan-400 font-bold uppercase text-xs">Overview</p>
          <h2 class="section-title text-white font-extrabold text-4xl mt-2 leading-tight">這個工具做什麼</h2>
          <p class="overview-copy text-slate-300 mt-4 leading-relaxed">
            程式透過 Windows 目前媒體工作階段讀取歌曲資訊。啟動後可從控制台開啟 YouTube Music、Spotify 或 Apple Music，選擇 App / System 音量控制、動態歌詞與三種懸浮播放器主題。登入都在官方服務中完成，工具本身不會要求、保存或讀取帳號密碼。
          </p>
        </div>

        <div class="feature-grid grid grid-cols-2 gap-4">
          <article class="feature">
            <svg class="icon text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8h.01" />
              <path d="M11 12h1v4h1" />
            </svg>
            <h3 class="text-white font-black text-base mt-3">歌曲資訊與動態歌詞</h3>
            <p class="text-slate-300 text-sm mt-2">在遊戲中顯示歌曲、縮圖、進度、服務來源，以及即時滾動歌詞。</p>
          </article>

          <article class="feature">
            <svg class="icon text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="M7 9h.01M11 9h.01M15 9h.01M7 13h10" />
            </svg>
            <h3 class="text-white font-black text-base mt-3">App / System 音量切換</h3>
            <p class="text-slate-300 text-sm mt-2">自由選擇只調整音樂 App，或同步調整 Windows 系統主音量。</p>
          </article>

          <article class="feature">
            <svg class="icon text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M6 12h4" />
              <path d="M8 10v4" />
              <path d="M15 13h.01" />
              <path d="M18 11h.01" />
              <path d="M7 19c-2 0-4-1.5-4-4.2S5 7 7.8 7h8.4C19 7 21 12 21 14.8S19 19 17 19c-1.5 0-2.4-1-3-2H10c-.6 1-1.5 2-3 2Z" />
            </svg>
            <h3 class="text-white font-black text-base mt-3">手把組合鍵</h3>
            <p class="text-slate-300 text-sm mt-2">支援 L3 (左蘑菇頭按壓) + A / B / X / 左 / 右控制播放、切歌與音量。</p>
          </article>

          <article class="feature">
            <svg class="icon text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3Z" />
              <path d="M19 14l.8 1.8L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-1.2L19 14Z" />
            </svg>
            <h3 class="text-white font-black text-base mt-3">三種播放器主題</h3>
            <p class="text-slate-300 text-sm mt-2">支援暗黑、Liquid Glass 與無邊框電台，並可調整播放器大小與位置。</p>
          </article>
        </div>
      </div>
    </section>

    <!-- QUICK GUIDE & INSTALL SECTION -->
    <section class="install bg-slate-50 text-slate-900 py-16">
      <div class="wrap install-grid">
        <!-- QUICK GUIDE CAROUSEL -->
        <div>
          <p class="eyebrow text-cyan-700 font-bold uppercase text-xs">Quick Guide</p>
          <h2 class="section-title text-slate-900 font-extrabold text-4xl mt-2 leading-tight">簡易操作教學</h2>
          <div class="ready-note bg-cyan-50/50 border border-cyan-100 rounded-lg p-4 flex gap-3 mt-4">
            <svg class="icon text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <path d="M4 12h16" />
              <path d="M14 6l6 6-6 6" />
            </svg>
            <p class="text-slate-700 text-sm leading-relaxed">啟動後先選擇音樂服務，再設定音量控制目標與動態歌詞；進入 Forza 後就能用鍵盤或手把操作。</p>
          </div>

          <GuideCarousel
            class="mt-6"
            label="簡易操作教學"
            prevLabel="上一個操作教學"
            nextLabel="下一個操作教學"
            dotLabel="切換到操作教學"
            :slidesCount="9"
          >
            <!-- Slides slot -->
            <template #default="{ currentIndex }">
              <!-- STEP 1 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 0 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">STEP 1 · MUSIC SOURCE</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">開啟音樂服務</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">先在控制台的「選擇音樂來源」區塊按下服務按鈕。程式會開啟對應官方網站，並自動替播放器套用符合服務的顏色主題。</p>
                  <div class="guide-services flex flex-wrap gap-2 mt-4">
                    <button class="guide-service yt" :class="{ 'is-selected': selectedService === 'YouTube Music' }" type="button" @click="selectedService = 'YouTube Music'">
                      YouTube Music
                    </button>
                    <button class="guide-service sp" :class="{ 'is-selected': selectedService === 'Spotify' }" type="button" @click="selectedService = 'Spotify'">
                      Spotify
                    </button>
                    <button class="guide-service am" :class="{ 'is-selected': selectedService === 'Apple Music' }" type="button" @click="selectedService = 'Apple Music'">
                      Apple Music
                    </button>
                  </div>
                  <!-- STEP 1 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between text-slate-500 mb-2">
                      <span>互動預覽</span>
                      <span class="text-cyan-400 font-bold">{{ selectedService }} · 主題已套用</span>
                    </div>
                    <p class="text-slate-200">已選擇: {{ selectedService }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 2 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 1 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                    <path d="M15 9.5a5 5 0 0 1 0 5" />
                    <path d="M18 7a9 9 0 0 1 0 10" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">APP / SYSTEM</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">選擇音量目標與歌詞</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">依照遊玩習慣選擇音量控制目標，也能決定是否在懸浮播放器顯示即時滾動歌詞。</p>
                  <ul class="guide-points text-xs text-slate-600 list-disc pl-4 mt-2">
                    <li>App：只改變目前音樂網頁或應用程式的音量。</li>
                    <li>System：調整整台電腦的 Windows 系統主音量。</li>
                  </ul>
                  <!-- STEP 2 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-row flex items-center justify-between mb-3">
                      <div class="demo-segments flex bg-slate-900 p-0.5 rounded border border-slate-800">
                        <button class="demo-segment px-3 py-1 rounded transition-all" :class="{ 'is-selected bg-slate-800 text-cyan-400 font-bold': volumeTarget === 'app' }" type="button" @click="volumeTarget = 'app'">App</button>
                        <button class="demo-segment px-3 py-1 rounded transition-all" :class="{ 'is-selected bg-slate-800 text-cyan-400 font-bold': volumeTarget === 'system' }" type="button" @click="volumeTarget = 'system'">System</button>
                      </div>
                      <label class="demo-switch flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" v-model="lyricsOn" />
                        動態歌詞
                      </label>
                    </div>
                    <p class="text-cyan-400">
                      {{ volumeTarget === 'app' ? '目前只會調整音樂 App 音量。' : '目前會調整 Windows 系統主音量。' }}
                      {{ lyricsOn ? '已開啟動態歌詞。' : '已關閉動態歌詞。' }}
                    </p>
                  </div>
                </div>
              </article>

              <!-- STEP 3 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 2 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M21 15H3" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">SCALE / OVERLAY SIZE</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">縮放播放器大小</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">支援播放器大小在 60% 到 100% 之間縮放，拖動滑桿可直接預覽縮放效果，正式程式會自動保存設定。</p>
                  <!-- STEP 3 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between text-slate-500 mb-2">
                      <span>拖曳滑桿預覽播放器大小</span>
                      <span class="text-cyan-400 font-bold">{{ playerScale }}%</span>
                    </div>
                    <input class="demo-range w-full accent-cyan-400 cursor-pointer" type="range" min="60" max="100" v-model.number="playerScale" />
                    <div class="demo-stage mt-3 flex justify-center items-center h-14 bg-slate-900 rounded overflow-hidden">
                      <div class="demo-overlay bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 font-bold text-center px-4 py-1.5 rounded transition-transform duration-100" :style="{ transform: `scale(${playerScale / 100})` }">
                        播放器預覽
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <!-- STEP 4 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 3 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M5 9l-2 3 2 3M9 5l3-2 3 2M15 19l-3 2-3-2M19 9l2 3-2 3" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">DRAG & MOVE POSITION</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">調整懸浮播放器位置</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">按下組合鍵 <span class="text-cyan-700 font-bold">Ctrl + Alt + P</span> 可啟用/停用拖曳，將懸浮視窗移到螢幕上任何喜歡的位置。</p>
                  <!-- STEP 4 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between text-slate-500 mb-1">
                      <span>拖曳播放器預覽，感受定位方式</span>
                      <span class="text-yellow-400 font-bold">Ctrl + Alt + P</span>
                    </div>
                    <div class="demo-stage relative w-full h-24 bg-slate-900 rounded overflow-hidden mt-2">
                      <div
                        class="demo-overlay absolute bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 font-bold text-center px-3 py-1 rounded cursor-move select-none touch-none"
                        :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }"
                        @pointerdown="onDragStart"
                        @pointermove="onDragMove"
                        @pointerup="onDragEnd"
                        @pointercancel="onDragEnd"
                      >
                        播放器預覽
                      </div>
                    </div>
                    <p class="text-cyan-400 mt-2">{{ dragFeedback }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 5 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 4 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <rect x="5" y="3" width="4" height="18" rx="1" />
                    <rect x="15" y="3" width="4" height="18" rx="1" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">GAMEPAD / KEYBOARD PLAY</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">播放或暫停歌曲</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">要在遊戲中播放或暫停目前的歌曲，可直接使用鍵盤與手把組合鍵操作，不用切回 Windows 桌面。</p>
                  <ul class="guide-points text-xs text-slate-600 list-disc pl-4 mt-2">
                    <li>手把：<span class="text-cyan-700 font-bold">L3 + A</span> (L3 意為按壓左蘑菇頭)</li>
                    <li>鍵盤：<span class="text-cyan-700 font-bold">Ctrl + Alt + Space</span></li>
                  </ul>
                  <!-- STEP 5 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-row flex items-center justify-between mb-2">
                      <span class="demo-track truncate text-slate-300 font-semibold">目前播放：Forza Horizon Radio</span>
                      <button class="demo-action bg-slate-900 text-cyan-400 w-8 h-8 rounded border border-slate-800 font-bold" type="button" @click="togglePlay">
                        {{ isPlaying ? 'Ⅱ' : '▶' }}
                      </button>
                    </div>
                    <p class="text-cyan-400">{{ playFeedback }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 6 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 5 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M5 4l10 8-10 8V4zM19 5v14" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">PREV / NEXT SONG</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">快速切換歌曲</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">可以使用遊戲手把或鍵盤，快速切換播放上一首或下一首歌曲。</p>
                  <ul class="guide-points text-xs text-slate-600 list-disc pl-4 mt-2">
                    <li>手把：<span class="text-cyan-700 font-bold">L3 + D-Pad 左/右</span></li>
                    <li>鍵盤：<span class="text-cyan-700 font-bold">Ctrl + Alt + 左/右箭頭</span></li>
                  </ul>
                  <!-- STEP 6 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-row flex items-center justify-between mb-2">
                      <span class="demo-track truncate text-slate-300 font-semibold">{{ tracks[trackIndex] }}</span>
                      <div class="demo-actions flex gap-1">
                        <button class="demo-action bg-slate-900 text-cyan-400 w-8 h-8 rounded border border-slate-800 font-bold" type="button" @click="prevTrack">‹</button>
                        <button class="demo-action bg-slate-900 text-cyan-400 w-8 h-8 rounded border border-slate-800 font-bold" type="button" @click="nextTrack">›</button>
                      </div>
                    </div>
                    <p class="text-cyan-400">{{ trackFeedback }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 7 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 6 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M11 5 6 9H2v6h4l5 4V5Z" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">GAME VOLUME CONTROL</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">調整音樂 App 或系統音量</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">在遊戲中以手把或鍵盤直接調整音量，程式會在畫面中央彈出高能閃電音量 HUD。</p>
                  <ul class="guide-points text-xs text-slate-600 list-disc pl-4 mt-2">
                    <li>手把：<span class="text-cyan-700 font-bold">L3 + D-Pad 上/下</span></li>
                    <li>鍵盤：<span class="text-cyan-700 font-bold">Ctrl + Alt + 上/下箭頭</span></li>
                  </ul>
                  <!-- STEP 7 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-row flex items-center justify-between mb-2">
                      <span class="demo-track font-semibold text-slate-300">遊戲內音量 HUD</span>
                      <div class="demo-actions flex items-center gap-1.5">
                        <button class="demo-action bg-slate-900 text-cyan-400 w-7 h-7 rounded border border-slate-800 font-bold text-center" type="button" @click="volumeDown">−</button>
                        <span class="demo-badge text-cyan-400 font-black px-1.5">{{ currentVolume }}%</span>
                        <button class="demo-action bg-slate-900 text-cyan-400 w-7 h-7 rounded border border-slate-800 font-bold text-center" type="button" @click="volumeUp">+</button>
                      </div>
                    </div>
                    <div class="demo-meter w-full bg-slate-900 h-1.5 rounded overflow-hidden border border-slate-850 mt-2">
                      <span class="block bg-cyan-400 h-full transition-all duration-100" :style="{ width: `${currentVolume}%` }" />
                    </div>
                  </div>
                </div>
              </article>

              <!-- STEP 8 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 7 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">TOGGLE PLAYER OVERLAY</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">顯示或隱藏懸浮播放器</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">臨時想擁有完全乾淨的遊戲畫面，可用快速組合鍵隱藏懸浮視窗，歌曲會照常在背景播放。</p>
                  <ul class="guide-points text-xs text-slate-600 list-disc pl-4 mt-2">
                    <li>手把：<span class="text-cyan-700 font-bold">L3 + Y</span></li>
                    <li>鍵盤：<span class="text-cyan-700 font-bold">Ctrl + Alt + H</span></li>
                  </ul>
                  <!-- STEP 8 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-row flex items-center justify-between mb-2">
                      <span class="demo-track text-slate-300 font-semibold">播放器預覽</span>
                      <button class="demo-action bg-slate-900 text-cyan-400 px-2.5 h-7 rounded border border-slate-800 font-bold" type="button" @click="toggleOverlayVisibility">
                        切換顯示
                      </button>
                    </div>
                    <div class="demo-stage flex justify-center items-center h-10 bg-slate-900 rounded overflow-hidden mt-1.5">
                      <div class="demo-overlay bg-cyan-950/80 border border-cyan-500/30 text-cyan-200 font-bold text-center px-4 py-1 rounded transition-opacity" :class="{ 'opacity-0': isOverlayHidden }">
                        播放器預覽
                      </div>
                    </div>
                    <p class="text-cyan-400 mt-2">{{ overlayFeedback }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 9 -->
              <article class="carousel-slide usage-card" :class="{ 'is-active': currentIndex === 8 }">
                <div class="usage-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                </div>
                <div>
                  <p class="kbd text-xs text-cyan-700 font-bold uppercase">MINIMIZE CONSOLE TO TRAY</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">控制台縮小與叫回</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">控制台主視窗關閉後會自動縮入 Windows 系統工作列右下角系統匣，保持乾淨桌面，隨時可雙擊重新叫出。</p>
                  <ul class="guide-points text-xs text-slate-600 list-disc pl-4 mt-2">
                    <li>手把：<span class="text-cyan-700 font-bold">L3 + X</span> 縮入系統匣</li>
                  </ul>
                  <!-- STEP 9 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-row flex items-center justify-between mb-2">
                      <span class="demo-track text-slate-300 font-semibold">控制台狀態</span>
                      <div class="demo-actions flex gap-1.5">
                        <button class="demo-action bg-slate-900 text-cyan-400 px-2 h-7 rounded border border-slate-800 font-bold" type="button" @click="minimizeConsole">
                          縮到系統匣
                        </button>
                        <button class="demo-action bg-slate-900 text-cyan-400 px-2 h-7 rounded border border-slate-800 font-bold" type="button" @click="restoreConsole">
                          叫回控制台
                        </button>
                      </div>
                    </div>
                    <p class="text-cyan-400">{{ consoleFeedback }}</p>
                  </div>
                </div>
              </article>
            </template>
          </GuideCarousel>
        </div>

        <!-- INSTALL FLOW CAROUSEL -->
        <div>
          <p class="eyebrow text-cyan-700 font-bold uppercase text-xs">Install Flow</p>
          <h2 class="section-title text-slate-900 font-extrabold text-4xl mt-2 leading-tight">安裝流程說明</h2>
          <div class="ready-note bg-cyan-50/50 border border-cyan-100 rounded-lg p-4 flex gap-3 mt-4">
            <svg class="icon text-cyan-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
            <p class="text-slate-700 text-sm leading-relaxed">解壓即用，免安裝流程；依個人需求執行批次檔建立捷徑，不執行也能直接開啟 EXE。</p>
          </div>

          <GuideCarousel
            class="mt-6"
            label="安裝流程圖像說明"
            prevLabel="上一個安裝步驟"
            nextLabel="下一個安裝步驟"
            dotLabel="切換到安裝步驟"
            :slidesCount="4"
          >
            <!-- Slides slot -->
            <template #default="{ currentIndex }">
              <!-- STEP 1 -->
              <article class="carousel-slide install-card" :class="{ 'is-active': currentIndex === 0 }">
                <div class="install-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </div>
                <div>
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 1 · ZIP PACKAGE</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">下載最新 ZIP 壓縮檔</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">從網頁上方點選「下載」按鈕，取得最新發行的 ZIP 壓縮檔（含有控制台主程式與必要文件）。</p>
                  <!-- STEP 1 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between items-center text-slate-500 mb-2">
                      <span>互動預覽</span>
                      <button class="demo-action bg-slate-900 text-cyan-400 px-2 h-6 rounded border border-slate-800 font-bold" type="button" @click="handleDownloadReady">準備檔案</button>
                    </div>
                    <div class="demo-file flex items-center gap-2 mt-2 bg-slate-900 p-2 rounded">
                      <span class="demo-file-icon bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-black">ZIP</span>
                      <div class="truncate text-slate-300">
                        <strong class="block text-xs truncate">ForzaMusicOverlay-release3.1.0_portable-test.zip</strong>
                        <small class="block text-slate-500 text-[10px]">GitHub Releases</small>
                      </div>
                    </div>
                    <p class="text-cyan-400 mt-2">{{ downloadReady ? '最新版 ZIP 已準備好。' : '點擊準備檔案查看模擬效果。' }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 2 -->
              <article class="carousel-slide install-card" :class="{ 'is-active': currentIndex === 1 }">
                <div class="install-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div>
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 2 · EXTRACT FILES</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">完整解壓縮檔案</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">滑鼠右鍵點擊 ZIP 檔選擇「全部解壓縮」到任意資料夾（請勿在壓縮包內直接點擊執行 exe，否則會因找不到元件而報錯）。</p>
                  <!-- STEP 2 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between items-center text-slate-500 mb-2">
                      <span>完整解壓縮</span>
                      <button class="demo-action bg-slate-900 text-cyan-400 px-2 h-6 rounded border border-slate-800 font-bold" type="button" @click="handleExtract">檢查資料夾</button>
                    </div>
                    <div class="demo-file flex items-center gap-2 mt-2 bg-slate-900 p-2 rounded">
                      <span class="demo-file-icon bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-black">DIR</span>
                      <div class="truncate text-slate-300">
                        <strong class="block text-xs truncate">ForzaMusicOverlay-release</strong>
                        <small class="block text-slate-500 text-[10px]">AppFiles / Install-App.bat / ForzaMusicOverlay.exe</small>
                      </div>
                    </div>
                    <p class="text-cyan-400 mt-2">{{ zipExtracted ? '資料夾結構完整，現在可以執行 exe。' : '點擊按鈕檢查資料夾完整度。' }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 3 -->
              <article class="carousel-slide install-card" :class="{ 'is-active': currentIndex === 2 }">
                <div class="install-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                </div>
                <div>
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 3 · LAUNCH EXE</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">執行 EXE 啟動控制台</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">雙擊執行 <span class="text-cyan-700 font-bold">ForzaMusicOverlay.exe</span> 啟動控制台，再點擊服務按鈕開始使用（不需先執行安裝腳本就能運作）。</p>
                  <!-- STEP 3 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between items-center text-slate-500 mb-2">
                      <span>ForzaMusicOverlay.exe</span>
                      <button class="demo-action bg-slate-900 text-cyan-400 px-2 h-6 rounded border border-slate-800 font-bold" type="button" @click="handleLaunch">模擬啟動</button>
                    </div>
                    <p class="text-cyan-400 mt-2">{{ simulatedLaunch ? '控制台已啟動，接著選擇音樂來源。' : '點擊模擬啟動按鈕試試。' }}</p>
                  </div>
                </div>
              </article>

              <!-- STEP 4 -->
              <article class="carousel-slide install-card" :class="{ 'is-active': currentIndex === 3 }">
                <div class="install-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 4 · OPTIONAL INSTALLER</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">執行安裝批次檔建立捷徑</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">（選用）點擊 <span class="text-cyan-700 font-bold">Install-App.bat</span> 建立捷徑；指令碼會在桌面與開始功能表建立程式捷徑，並提供「只顯示懸浮視窗」捷徑。</p>
                  <!-- STEP 4 DEMO -->
                  <div class="demo-panel mt-4 p-3 bg-slate-950 text-white rounded-lg border border-slate-800 text-xs">
                    <div class="demo-toolbar flex justify-between items-center text-slate-500 mb-2">
                      <span>Install-App.bat</span>
                      <button class="demo-action bg-slate-900 text-cyan-400 px-2 h-6 rounded border border-slate-800 font-bold" type="button" @click="handleShortcuts">建立捷徑</button>
                    </div>
                    <div class="demo-file flex items-center gap-2 mt-2 bg-slate-900 p-2 rounded">
                      <span class="demo-file-icon bg-cyan-950 border border-cyan-800 text-cyan-400 px-1.5 py-0.5 rounded font-black">BAT</span>
                      <div class="truncate text-slate-300">
                        <strong class="block text-xs truncate">桌面 / 開始功能表 / 只顯示播放器</strong>
                        <small class="block text-slate-500 text-[10px]">依需求選用，不執行也能直接開啟 exe</small>
                      </div>
                    </div>
                    <p class="text-cyan-400 mt-2">{{ shortcutsCreated ? '捷徑建立完成：桌面、開始功能表、只顯示播放器。' : '點擊建立捷徑按鈕進行模擬。' }}</p>
                  </div>
                </div>
              </article>
            </template>
          </GuideCarousel>
        </div>
      </div>
    </section>

    <!-- UPDATE HISTORY SECTION -->
    <section class="updates bg-slate-950 py-16" id="updates">
      <div class="wrap">
        <div class="updates-head flex items-end justify-between mb-8">
          <div>
            <p class="eyebrow text-cyan-400 font-bold uppercase text-xs">Changelog</p>
            <h2 class="section-title text-white font-extrabold text-4xl mt-2 leading-tight">專案更新紀錄</h2>
          </div>
          <span class="text-slate-400 text-sm">最新版本: v3.1.0</span>
        </div>

        <div class="update-list border-t border-b border-slate-800">
          <!-- UPDATE V3.1.0 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 hover:bg-slate-900/10 hover:translate-x-1 transition-all duration-200">
            <div>
              <p class="update-version text-cyan-300 font-black text-sm">v3.1.0</p>
              <p class="update-date text-slate-500 text-sm mt-2">2026-06-01</p>
            </div>
            <div>
              <h3 class="text-white font-black text-xl">優化高防毒誤報機制與程式發布包</h3>
              <div class="entry-actions flex items-center gap-3 flex-wrap mt-3">
                <a
                  class="button primary cursor-pointer"
                  href="https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.1.0/ForzaMusicOverlay-release3.1.0_portable-test.zip"
                  @click="handleDownloadClick($event, 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.1.0/ForzaMusicOverlay-release3.1.0_portable-test.zip')"
                >
                  下載 v3.1.0
                </a>
                <p class="entry-file text-slate-500 text-sm">ForzaMusicOverlay-release3.1.0_portable-test.zip</p>
              </div>
              <ul class="notes text-slate-300 text-sm list-none pl-0 mt-4 space-y-2">
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 重新調整編譯與程式打包流程，最大程度避開 Windows Defender 誤報問題。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 確保與 v3.0.0 (Lightning HUD) 功能完美相容與運作穩定性。</li>
              </ul>
            </div>
          </article>

          <!-- UPDATE V3.0.0 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 border-t border-slate-800 hover:bg-slate-900/10 hover:translate-x-1 transition-all duration-200">
            <div>
              <p class="update-version text-cyan-300 font-black text-sm">v3.0.0</p>
              <p class="update-date text-slate-500 text-sm mt-2">2026-05-31</p>
            </div>
            <div>
              <h3 class="text-white font-black text-xl">全新閃電 HUD (Lightning HUD) 與滾動歌詞發布</h3>
              <div class="entry-actions flex items-center gap-3 flex-wrap mt-3">
                <a
                  class="button primary cursor-pointer"
                  href="https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.0.0/ForzaMusicOverlay-release3.0.0.zip"
                  @click="handleDownloadClick($event, 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.0.0/ForzaMusicOverlay-release3.0.0.zip')"
                >
                  下載 v3.0.0
                </a>
                <p class="entry-file text-slate-500 text-sm">ForzaMusicOverlay-release3.0.0.zip · 42.8 MB</p>
              </div>
              <ul class="notes text-slate-300 text-sm list-none pl-0 mt-4 space-y-2">
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 新增獨立音量控制切換，可自由選擇只調整瀏覽器 (App) 音量，或整台電腦 (System) 音量。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 新增遊戲內沉浸式閃電音量條與高壓數字儀表板，調整音量時不用跳出遊戲。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 新增即時滾動歌詞，並以 GPU 加速 SVG 濾鏡呈現高能白熱核心與霓虹閃電光暈。</li>
              </ul>
            </div>
          </article>

          <!-- UPDATE V2.4.0 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 border-t border-slate-800 hover:bg-slate-900/10 hover:translate-x-1 transition-all duration-200">
            <div>
              <p class="update-version text-cyan-300 font-black text-sm">v2.4.0</p>
              <p class="update-date text-slate-500 text-sm mt-2">2026-05-30</p>
            </div>
            <div>
              <h3 class="text-white font-black text-xl">手把模擬選擇選單與單一實例鎖定</h3>
              <div class="entry-actions flex items-center gap-3 flex-wrap mt-3">
                <a
                  class="button primary cursor-pointer"
                  href="https://drive.google.com/file/d/1Zt9tJ36o4eQ3C3BVm48XF8wL2vBv0X/view?usp=drive_link"
                  @click="handleDownloadClick($event, 'https://drive.google.com/file/d/1Zt9tJ36o4eQ3C3BVm48XF8wL2vBv0X/view?usp=drive_link')"
                >
                  下載 v2.4.0
                </a>
                <p class="entry-file text-slate-500 text-sm">ForzaMusicOverlay-release2.4.0.zip · 162.8 MB</p>
              </div>
              <ul class="notes text-slate-300 text-sm list-none pl-0 mt-4 space-y-2">
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 新增虛擬手把模擬模式選擇選單，支援在 PS4 與 Xbox 360 手把模式之間自由切換。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 新增主程式單一實例鎖定 (Single Instance Lock)，防止重複點擊開啟多個控制台視窗。</li>
              </ul>
            </div>
          </article>

          <!-- UPDATE V2.3.2 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 border-t border-slate-800 hover:bg-slate-900/10 hover:translate-x-1 transition-all duration-200">
            <div>
              <p class="update-version text-cyan-300 font-black text-sm">v2.3.2</p>
              <p class="update-date text-slate-500 text-sm mt-2">2026-05-30</p>
            </div>
            <div>
              <h3 class="text-white font-black text-xl">防毒誤報深度修復與指令碼優化</h3>
              <div class="entry-actions flex items-center gap-3 flex-wrap mt-3">
                <a
                  class="button primary cursor-pointer"
                  href="https://drive.google.com/file/d/1rK4b54784M54bBvV4Bv4M8Wv4C4P4M8/view?usp=drive_link"
                  @click="handleDownloadClick($event, 'https://drive.google.com/file/d/1rK4b54784M54bBvV4Bv4M8Wv4C4P4M8/view?usp=drive_link')"
                >
                  下載 v2.3.2
                </a>
                <p class="entry-file text-slate-500 text-sm">ForzaMusicOverlay-release2.3.2.zip · 162.5 MB</p>
              </div>
              <ul class="notes text-slate-300 text-sm list-none pl-0 mt-4 space-y-2">
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 徹底重寫底層驅動載入機制，完美解決防毒軟體誤判攔截問題。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 修正 bat 檔案，讓安裝與啟動流程更穩定。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 加入 logo 顯示，讓程式與捷徑圖示更完整。</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="bg-[#0b0d12] border-t border-slate-800 text-slate-400 text-sm py-8">
      <div class="wrap flex justify-between gap-3 flex-col sm:flex-row items-center sm:items-start">
        <p class="text-center sm:text-left">GamingMusicOverlay (GMO) 是非官方工具，與 Microsoft、Forza、Spotify、Apple、Google 或 YouTube 無隸屬關係。</p>
        <p class="text-center sm:text-right">MIT License · Windows 10/11 · <a href="https://github.com/scott0127/forza-horizon-6-youtube-muisc-player" target="_blank" rel="noopener noreferrer" class="text-cyan-300 no-underline hover:text-cyan-200">GitHub ⭐</a></p>
      </div>
    </footer>

    <!-- Typewriter download modal component -->
    <TypewriterModal v-model:isOpen="showTypewriterModal" lang="zh-Hant" />
  </main>
</template>
