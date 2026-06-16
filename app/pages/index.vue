<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { gsap } from 'gsap';
import { usePageMotion } from '../composables/usePageMotion';
import { useHeroActionsMotion } from '../composables/useHeroActionsMotion';
import { useSignalHandoff } from '../composables/useSignalHandoff';
import { useTitleInteraction } from '../composables/useTitleInteraction';
import { useDesktopReleaseMotion } from '../composables/useDesktopReleaseMotion';
import { useSupportEnergyMotion } from '../composables/useSupportEnergyMotion';
import { useSponsorGoalMotion } from '../composables/useSponsorGoalMotion';
import { useInstallGuideMotion } from '../composables/useInstallGuideMotion';

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
const googleDriveDownloadUrl = 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v4.1.0/GamingMusicOverlay-release4.1.0_portable-test.zip';
const heroPrimaryDownloadUrl = 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v4.1.0/GamingMusicOverlay-release4.1.0_portable-test.zip';
const heroFallbackDownloadUrl = 'https://github.com/scott0127/forza-horizon-6-youtube-muisc-player/releases/download/v3.0.0/ForzaMusicOverlay-release3.0.0_final.zip';
usePageMotion(pageRoot);
useHeroActionsMotion(pageRoot);
useSignalHandoff(pageRoot);
useTitleInteraction(pageRoot);
useDesktopReleaseMotion(pageRoot);
useSupportEnergyMotion(pageRoot);
useSponsorGoalMotion(pageRoot);
useInstallGuideMotion(pageRoot);

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

// Overview V2 interactive states
const activeTheme = ref<'dark' | 'glass' | 'radio'>('dark');
const v2VolumeApp = ref(72);
const v2VolumeSys = ref(45);
const v2LyricIndex = ref(1);
const activeCombo = ref<string>('');
const v2Progress = ref<number>(48);

// Platform switching state for Card 1 (YouTube Music, Spotify, KKBOX)
const v2ActivePlatformIndex = ref(0);
const v2Platforms = [
  { 
    id: 'youtube', 
    name: 'YouTube Music', 
    color: '#ef4444', 
    bgSoft: 'rgba(239, 68, 68, 0.1)', 
    borderSoft: 'rgba(239, 68, 68, 0.2)',
    glow: 'rgba(239, 68, 68, 0.35)', 
    textColor: 'text-red-400',
    iconColor: '#ef4444'
  },
  { 
    id: 'spotify', 
    name: 'Spotify', 
    color: '#1db954', 
    bgSoft: 'rgba(29, 185, 84, 0.1)', 
    borderSoft: 'rgba(29, 185, 84, 0.2)',
    glow: 'rgba(29, 185, 84, 0.35)', 
    textColor: 'text-green-400',
    iconColor: '#1db954'
  },
  { 
    id: 'kkbox', 
    name: 'KKBOX', 
    color: '#0ea5e9', 
    bgSoft: 'rgba(14, 165, 233, 0.1)', 
    borderSoft: 'rgba(14, 165, 233, 0.2)',
    glow: 'rgba(14, 165, 233, 0.35)', 
    textColor: 'text-cyan-400',
    iconColor: '#0ea5e9'
  }
];
const v2ActivePlatform = computed(() => v2Platforms[v2ActivePlatformIndex.value]);

const currentSlide = ref(2); // Card 1 is at index 2 (after Clone 3 and Clone 4)
const isMobile = ref(false);
const isHovered = ref(false);

const cardWidth = 340;
const cardGap = 24;
const slideStep = cardWidth + cardGap; // 364

const viewportRef = ref<HTMLElement | null>(null);
const viewportWidth = ref(0);

const trackTranslateX = computed(() => {
  if (isMobile.value) return 0;
  const centerOffset = (viewportWidth.value / 2) - (cardWidth / 2);
  return centerOffset - (currentSlide.value * slideStep);
});

// Since currentSlide is a float, we map it to the active dot index (0-3) based on its closest integer value
const activeDotIndex = computed(() => {
  const roundedVal = Math.round(currentSlide.value);
  return ((roundedVal - 2) % 4 + 4) % 4;
});

let smoothScrollTween: gsap.core.Tween | null = null;
let manualNavigationTween: gsap.core.Tween | null = null;

const startSliderAutoplay = () => {
  stopSliderAutoplay();
  if (isMobile.value) return;
  
  // Continuous linear scroll loop
  const playScroll = () => {
    // If we are at or past 6, immediately reset back to 2 (invisible to the user as index 2 and 6 are duplicates)
    if (currentSlide.value >= 6) {
      currentSlide.value = 2 + (currentSlide.value - 6);
    } else if (currentSlide.value < 2) {
      currentSlide.value = 6 - (2 - currentSlide.value);
    }
    
    const remainingDistance = 6 - currentSlide.value;
    const duration = remainingDistance * 6.5; // 6.5 seconds per card distance, giving a slow and smooth scroll
    
    const animObj = { val: currentSlide.value };
    smoothScrollTween = gsap.to(animObj, {
      val: 6,
      duration: duration,
      ease: "none",
      onUpdate: () => {
        currentSlide.value = animObj.val;
      },
      onComplete: () => {
        currentSlide.value = 2;
        playScroll(); // Seamless continuous loop
      }
    });
  };
  
  playScroll();
};

const stopSliderAutoplay = () => {
  if (smoothScrollTween) {
    smoothScrollTween.kill();
    smoothScrollTween = null;
  }
};

const animateToSlide = (target: number) => {
  stopSliderAutoplay();
  if (manualNavigationTween) {
    manualNavigationTween.kill();
  }
  
  const animObj = { val: currentSlide.value };
  manualNavigationTween = gsap.to(animObj, {
    val: target,
    duration: 0.75,
    ease: "power2.out",
    onUpdate: () => {
      currentSlide.value = animObj.val;
    },
    onComplete: () => {
      // Bound wrapping check
      if (currentSlide.value >= 6) {
        currentSlide.value = 2;
      } else if (currentSlide.value <= 1) {
        currentSlide.value = 5;
      }
      
      // Resume autoplay if user is not hovering and not on mobile
      if (!isHovered.value && !isMobile.value) {
        startSliderAutoplay();
      }
    }
  });
};

const nextSlide = () => {
  if (isMobile.value) return;
  const target = Math.floor(currentSlide.value + 1);
  animateToSlide(target);
};

const prevSlide = () => {
  if (isMobile.value) return;
  const target = Math.ceil(currentSlide.value - 1);
  animateToSlide(target);
};

const goToSlide = (idx: number) => {
  if (isMobile.value) return;
  const target = idx + 2;
  animateToSlide(target);
};

const getCardStyle = (index: number) => {
  if (isMobile.value) return {};
  
  const diff = index - currentSlide.value;
  
  let rotateY = 0;
  let scale = 1;
  let translateZ = 0;
  let opacity = 1;
  let zIndex = 10;
  
  if (diff <= -2) {
    rotateY = 40;
    scale = 0.75;
    translateZ = -120;
    opacity = 0.2;
    zIndex = 10;
  } else if (diff >= 2) {
    rotateY = -40;
    scale = 0.75;
    translateZ = -120;
    opacity = 0.2;
    zIndex = 10;
  } else if (diff > -2 && diff < -1) {
    // Interpolate between far left (-2) and left (-1)
    const t = diff - (-2); // 0 to 1
    rotateY = 40 + t * (28 - 40);
    scale = 0.75 + t * (0.88 - 0.75);
    translateZ = -120 + t * (-40 - (-120));
    opacity = 0.2 + t * (0.55 - 0.2);
    zIndex = Math.round(10 + t * (15 - 10));
  } else if (diff >= -1 && diff < 0) {
    // Interpolate between left (-1) and center (0)
    const t = diff - (-1); // 0 to 1
    rotateY = 28 + t * (0 - 28);
    scale = 0.88 + t * (1.1 - 0.88);
    translateZ = -40 + t * (80 - (-40));
    opacity = 0.55 + t * (1 - 0.55);
    zIndex = Math.round(15 + t * (20 - 15));
  } else if (diff >= 0 && diff < 1) {
    // Interpolate between center (0) and right (1)
    const t = diff; // 0 to 1
    rotateY = 0 + t * (-28 - 0);
    scale = 1.1 + t * (0.88 - 1.1);
    translateZ = 80 + t * (-40 - 80);
    opacity = 1 + t * (0.55 - 1);
    zIndex = Math.round(20 + t * (15 - 20));
  } else if (diff >= 1 && diff < 2) {
    // Interpolate between right (1) and far right (2)
    const t = diff - 1; // 0 to 1
    rotateY = -28 + t * (-40 - (-28));
    scale = 0.88 + t * (0.75 - 0.88);
    translateZ = -40 + t * (-120 - (-40));
    opacity = 0.55 + t * (0.2 - 0.55);
    zIndex = Math.round(15 + t * (10 - 15));
  }
  
  return {
    transform: `perspective(1200px) rotateY(${rotateY}deg) scale(${scale}) translateZ(${translateZ}px)`,
    opacity: opacity,
    zIndex: zIndex,
    transition: 'border-color 0.4s ease, box-shadow 0.4s ease'
  };
};

// Hover state watcher to pause/resume smooth autoplay
watch(isHovered, (newVal) => {
  if (isMobile.value) return;
  if (newVal) {
    stopSliderAutoplay();
  } else {
    if (!manualNavigationTween || !manualNavigationTween.isActive()) {
      startSliderAutoplay();
    }
  }
});

// Mobile state watcher
watch(isMobile, (newVal) => {
  if (newVal) {
    stopSliderAutoplay();
    if (manualNavigationTween) manualNavigationTween.kill();
    currentSlide.value = 2; // reset to Card 1
  } else {
    startSliderAutoplay();
  }
});

const checkDimensions = () => {
  if (viewportRef.value) {
    viewportWidth.value = viewportRef.value.clientWidth;
  }
  isMobile.value = window.innerWidth < 1024;
};


const v2LyricsList = [
  "",
  "I'm burning hot",
  "위태로운 drive, 바꿔 넣어, gear",
  "불타는 노을 너와 내 tears, so",
  "Don't be afraid, 의심 없지",
  "손을 잡아 'cause tonight, 우린 burn to shine, yeah",
  "꽉 안아줘, my dear, 우리가 나눠 가진",
  "가슴 안의 흉터 자리에",
  "붉게 물든 엔진 네 눈 속의 날",
  "영원히 기억해 준다면",
  "I'm burning hot (Hot), 내가 나로 살 수 있다면",
  "재가 된대도 난 좋아 (좋아)",
  "So tonight, 안겨 네 품 안에",
  "Bonnie and Clyde it, oh",
  "Not running from it, not running from it",
  "불타오르지, I love it",
  "살게 해 날 (Hot)",
  "I'm burning hot (I'm burning hot)",
  ""
];

// Computed play time based on progress
const v2ProgressTime = computed(() => {
  const totalSeconds = 193; // 3:13
  const currentSeconds = Math.round((v2Progress.value / 100) * totalSeconds);
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };
  return formatTime(currentSeconds);
});



// Pointer event handler for the interactive volume bar
const handleVolumePointer = (e: PointerEvent, target: 'app' | 'system') => {
  const track = e.currentTarget as HTMLElement;
  const updateVolume = (clientX: number) => {
    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, Math.round((x / rect.width) * 100)));
    if (target === 'app') {
      v2VolumeApp.value = percentage;
    } else {
      v2VolumeSys.value = percentage;
    }
  };

  updateVolume(e.clientX);
  track.setPointerCapture(e.pointerId);

  const onPointerMove = (moveEvent: PointerEvent) => {
    updateVolume(moveEvent.clientX);
  };

  const onPointerUp = (upEvent: PointerEvent) => {
    track.releasePointerCapture(upEvent.pointerId);
    track.removeEventListener('pointermove', onPointerMove);
    track.removeEventListener('pointerup', onPointerUp);
  };

  track.addEventListener('pointermove', onPointerMove);
  track.addEventListener('pointerup', onPointerUp);
};

const beginVolumePointer = (e: PointerEvent, target: 'app' | 'system') => {
  volumeTarget.value = target;
  handleVolumePointer(e, target);
};



// Interactive Demo States (STEP 1 - 9)
// STEP 1
const selectedService = ref('YouTube Music');
const heroAudioRef = ref<HTMLAudioElement | null>(null);
const heroFallbackDuration = 48;
const heroTrackDuration = ref(heroFallbackDuration);
const heroPlaybackSeconds = ref(0);
const isHeroPlaying = ref(false);
const heroAudioReady = ref(false);
const heroAudioError = ref(false);
const heroAudioPlayBlocked = ref(false);
const heroAudioSources = [
  { src: '/downloads/forza-music-overlay/audio/love-wins-all-karaoke.mp3', type: 'audio/mpeg' }
];

const formatTrackTime = (secs: number) => {
  const safeSeconds = Math.max(0, Math.floor(secs));
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

const heroTrackProgress = computed(() => Math.min(100, Math.max(0, (heroPlaybackSeconds.value / Math.max(heroTrackDuration.value, 1)) * 100)));
const heroCurrentTime = computed(() => formatTrackTime(heroPlaybackSeconds.value));
const heroTotalTime = computed(() => formatTrackTime(heroTrackDuration.value));
const heroAudioStatusLabel = computed(() => {
  if (heroAudioError.value) return 'AUDIO FILE MISSING';
  if (heroAudioPlayBlocked.value) return 'CLICK TO ENABLE AUDIO';
  if (isHeroPlaying.value) return 'LOCAL AUDIO PLAYING';
  return heroAudioReady.value ? 'LOCAL AUDIO READY' : 'LOADING LOCAL MP3';
});
const heroSessionLabel = computed(() => {
  if (heroAudioError.value) return '請確認靜態音檔路徑';
  if (heroAudioPlayBlocked.value) return '點擊播放以啟用瀏覽器音訊';
  if (isHeroPlaying.value) return `Karaoke Version · ${heroCurrentTime.value} / ${heroTotalTime.value}`;
  return heroAudioReady.value ? `Karaoke Version · ${heroTotalTime.value}` : '正在載入本機 MP3';
});

const syncHeroAudioState = () => {
  const audio = heroAudioRef.value;
  if (!audio) return;

  heroPlaybackSeconds.value = audio.currentTime || 0;

  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    heroTrackDuration.value = audio.duration;
    heroAudioReady.value = true;
  }

  isHeroPlaying.value = !audio.paused && !audio.ended;
};

const toggleHeroPlayback = async () => {
  const audio = heroAudioRef.value;
  if (!audio) return;

  heroAudioError.value = false;
  heroAudioPlayBlocked.value = false;

  try {
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
    syncHeroAudioState();
  } catch {
    heroAudioPlayBlocked.value = true;
    isHeroPlaying.value = false;
  }
};

const seekHeroAudio = (e: PointerEvent) => {
  const audio = heroAudioRef.value;
  const track = e.currentTarget as HTMLElement;

  if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

  const rect = track.getBoundingClientRect();
  const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
  audio.currentTime = (x / rect.width) * audio.duration;
  syncHeroAudioState();
};

const handleHeroAudioError = () => {
  heroAudioError.value = true;
  heroAudioPlayBlocked.value = false;
  isHeroPlaying.value = false;
};

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

const guideServiceKey = computed(() => {
  if (selectedService.value === 'Spotify') return 'spotify';
  if (selectedService.value === 'Apple Music') return 'apple';
  return 'youtube';
});

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
const tracks = ['Love wins all - IU', 'Horizon Pulse - Bass Arena', 'Night Drive - Horizon XS'];
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
const donationViewed = ref(false);
const zipOpened = ref(false);
const zipExtracted = ref(false);
const filesCopied = ref(false);
const simulatedLaunch = ref(false);
const shortcutsCreated = ref(false);

const handleDownloadReady = () => {
  downloadReady.value = true;
};
const jumpToHeroDownload = () => {
  downloadReady.value = true;
  const target = document.querySelector<HTMLElement>('.motion-hero-actions');
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
const handleDonationViewed = () => {
  donationViewed.value = true;
};
const handleZipOpen = () => {
  zipOpened.value = true;
};
const handleExtract = () => {
  zipExtracted.value = true;
};
const handleCopyFiles = () => {
  filesCopied.value = true;
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

let v2LyricTimer: any = null;
let v2ProgressTimer: any = null;
let v2PlatformTimer: any = null;
let scrollTriggerInstance: any = null;
let mm: any = null;

// Dynamic script loader for p5.js
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

let p5ShaderInstance: any = null;

const initShaderBg = async () => {
  if (typeof window === 'undefined' || !process.client) return;
  if (p5ShaderInstance) return;

  try {
    // Load p5.js
    await loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.4/p5.min.js');

    const container = document.getElementById('overview-shader-bg');
    if (!container) return;

    const vert = `#version 300 es
      in vec4 aPosition;
      in vec2 aTexCoord;

      out vec2 vTexCoord;

      void main() {
        vTexCoord = aTexCoord;
        gl_Position = aPosition;
      }
    `;

    const frag = `#version 300 es
      precision highp float;

      uniform vec2 canvasSize;
      uniform vec2 mouse;
      uniform float time;

      // displace
      vec2 displace(vec2 uv, vec2 duv, float off, float wei) {
        duv -= off;
        return uv-duv*wei;
      }

      // noiseMath
      float mod7(float x) { return x - floor(x * (1.0 / 7.0)) * 7.0; }
      vec2  mod7(vec2  x) { return x - floor(x * (1.0 / 7.0)) * 7.0; }
      vec3  mod7(vec3  x) { return x - floor(x * (1.0 / 7.0)) * 7.0; }
      vec4  mod7(vec4  x) { return x - floor(x * (1.0 / 7.0)) * 7.0; }

      float mod289(float x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2  mod289(vec2  x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3  mod289(vec3  x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4  mod289(vec4  x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }

      float permute(float x) { return mod289(((x*34.0)+10.0)*x); }
      vec2  permute(vec2  x) { return mod289(((x*34.0)+10.0)*x); }
      vec3  permute(vec3  x) { return mod289(((x*34.0)+10.0)*x); }
      vec4  permute(vec4  x) { return mod289(((x*34.0)+10.0)*x); }

      float fade(float t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
      vec2  fade(vec2  t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
      vec3  fade(vec3  t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }
      vec4  fade(vec4  t) { return t*t*t*(t*(t*6.0-15.0)+10.0); }

      float taylorInvSqrt(float r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec2  taylorInvSqrt(vec2  r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec3  taylorInvSqrt(vec3  r) { return 1.79284291400159 - 0.85373472095314 * r; }
      vec4  taylorInvSqrt(vec4  r) { return 1.79284291400159 - 0.85373472095314 * r; }

      // snoise3D
      float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 =   v - i + dot(i, C.xxx) ;

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i);
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.5 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 105.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                       dot(p2,x2), dot(p3,x3) ) );
      }

      // snoise3DImage
      vec4 snoise3DImage(vec2 uv, float scal, float gain, float ofst, vec3 move) {
        uv *= scal;
        float R = snoise(vec3(uv, 100.)+move);
        float G = snoise(vec3(uv, 300.)+move);
        float B = snoise(vec3(uv, 500.)+move);
        vec3 color = ofst+gain*vec3(R, G, B);
        return vec4(color, 1.);
      }

      vec4 snoise3DImage(vec2 uv, float scal, float gain, float ofst, float expo, vec3 move) {
        uv *= scal;
        float R = snoise(vec3(uv, 100.)+move);
        float G = snoise(vec3(uv, 300.)+move);
        float B = snoise(vec3(uv, 500.)+move);
        vec3 col;
        col.r = pow(abs(R), expo)*(step(0., R)*2.-1.);
        col.g = pow(abs(G), expo)*(step(0., G)*2.-1.);
        col.b = pow(abs(B), expo)*(step(0., B)*2.-1.);
        return vec4(ofst+gain*col, 1.);
      }

      // gradient
      #ifndef PI
      #define PI 3.141592653589793
      #endif

      #ifndef TWO_PI
      #define TWO_PI 6.283185307179586
      #endif

      vec2 conical(vec2 uv, vec2 pos, float tile, float ofst) {
        uv -= pos;
        vec2 radialUv = vec2(atan(uv.y, uv.x)/TWO_PI+0.5, length(uv));
        radialUv = radialUv*tile-fract(ofst);
        return fract(radialUv);
      }

      float horizontal(vec2 uv, float tile, float ofst) {
        return fract( (uv*tile)-ofst ).x;
      }

      float radial(vec2 uv, vec2 pos, float tile, float ofst) {
        uv -= pos;
        float d = length(uv);
        d = d*tile-fract(ofst);
        return fract(d);
      }

      vec2 swirl(vec2 uv, vec2 pos, float tile, float ofst, float wei) {
        uv -= pos;
        vec2 radialUv = vec2(atan(uv.y, uv.x)/TWO_PI+0.5, length(uv));
        radialUv.x += radialUv.y*wei;
        radialUv = radialUv*tile-fract(ofst);
        return fract(radialUv);
      }

      float vertical(vec2 uv, float tile, float ofst) {
        return fract( (uv*tile)-ofst ).y;
      }

      // zcPalette
      #ifndef PULSE_GRAD_INCLUDED
      #define PULSE_GRAD_INCLUDED

      float pulse(float start, float end) {
        return step(0., start) * step(end, 0.);
      }

      vec4 grad(float area, vec4 startCol, vec4 endCol, float startPos, float endPos) {
        float u = pulse(area-startPos, area-endPos);
        vec4 gradientCol = mix(startCol, endCol, (area-startPos)/(endPos-startPos))*u;
        return gradientCol;
      }

      #endif

      vec4 palette(float t, vec4 colors[5], float positions[5]) {
        vec4 result_color = vec4(0.);
        for (int i = 0; i < colors.length()-1; i++) {
          result_color += grad(t, colors[i], colors[i+1], positions[i], positions[i+1]);
        }
        return result_color;
      }

      // extend
      vec2 mirror(vec2 uv, float num) {
        uv *= num;
        vec2 iuv = floor(uv);
        uv *= 1.-2.*mod(iuv, 2.);
        return fract(uv);
      }

      vec2 mirror(vec2 uv, vec2 grid) {
        uv *= grid;
        vec2 iuv = floor(uv);
        uv *= 1.-2.*mod(iuv, 2.);
        return fract(uv);
      }

      vec2 repeat(vec2 uv, float num) {
        return fract(uv*num);
      }

      vec2 repeat(vec2 uv, vec2 grid) {
        return fract(uv*grid);
      }

      // smooth
      float smoo3(float x) { return x*x*(3.-2.*x); }
      vec2 smoo3(vec2 x) { return x*x*(3.-2.*x); }
      vec3 smoo3(vec3 x) { return x*x*(3.-2.*x); }
      vec4 smoo3(vec4 x) { return x*x*(3.-2.*x); }

      float smoo5(float x) { return x*x*x*(x*(6.*x-15.)+10.); }
      vec2 smoo5(vec2 x) { return x*x*x*(x*(6.*x-15.)+10.); }
      vec3 smoo5(vec3 x) { return x*x*x*(x*(6.*x-15.)+10.); }
      vec4 smoo5(vec4 x) { return x*x*x*(x*(6.*x-15.)+10.); }

      float smoo7(float x) { return x*x*x*x*(x*(x*(-20.*x+70.)-84.)+35.); }
      vec2 smoo7(vec2 x) { return x*x*x*x*(x*(x*(-20.*x+70.)-84.)+35.); }
      vec3 smoo7(vec3 x) { return x*x*x*x*(x*(x*(-20.*x+70.)-84.)+35.); }
      vec4 smoo7(vec4 x) { return x*x*x*x*(x*(x*(-20.*x+70.)-84.)+35.); }

      in vec2 vTexCoord;
      out vec4 fragColor;

      float vignette(vec2 uv) {
        float d = distance(uv, vec2(0.5));
        return smoothstep(0.78, 0.18, d);
      }

      float centerCleanMask(vec2 uv) {
        vec2 p = uv - vec2(0.5, 0.48);
        p.x *= canvasSize.x / canvasSize.y;
        float d = length(p / vec2(0.62, 0.42));
        return smoothstep(0.18, 1.0, d);
      }

      void main() {
        vec2 rawUv = vTexCoord;
        vec2 uv = rawUv;

        vec2 mo = clamp(mouse, vec2(0.0), vec2(1.0));

        uv -= 0.5;
        uv.x *= canvasSize.x / canvasSize.y;

        vec2 muv = smoo3(mirror(uv, 1.0));

        float scal = 2.35;
        float gain = mix(10.0, 28.0, mo.y);
        float ofst = 0.48;
        float expo = mix(0.72, 1.65, mo.x);

        vec3 move = vec3(
          sin(time * 0.00022) * 0.12,
          cos(time * 0.00018) * 0.12,
          time * 0.00115
        );

        vec4 dimg = snoise3DImage(uv, scal, gain, ofst, expo, move);

        float wei = 0.085;
        vec2 duv = smoo3(displace(muv, dimg.rg, ofst, wei));

        vec2 puv = smoo3(conical(duv, vec2(0.5), 4.0, time * 0.00046));

        vec4 colors[] = vec4[](
          vec4(0.010, 0.018, 0.050, 1.0),
          vec4(0.028, 0.080, 0.180, 1.0),
          vec4(0.180, 0.180, 0.520, 1.0),
          vec4(0.520, 0.360, 0.960, 1.0),
          vec4(0.090, 0.740, 0.960, 1.0)
        );

        float positions[] = float[](
          0.00,
          0.26,
          0.52,
          0.76,
          1.00
        );

        vec4 rupture = smoo3(palette(puv.x, colors, positions));

        float lineA = smoothstep(0.470, 0.505, abs(fract(puv.x * 3.0 + time * 0.00022) - 0.5));
        float lineB = smoothstep(0.492, 0.500, abs(fract(puv.y * 2.2 - time * 0.00018) - 0.5));
        float caustic = (1.0 - lineA) * 0.050 + (1.0 - lineB) * 0.034;

        vec3 base = vec3(0.006, 0.012, 0.032);
        vec3 col = mix(base, rupture.rgb, 0.50);
        col += vec3(0.45, 0.58, 1.0) * caustic;

        float clean = centerCleanMask(rawUv);
        col = mix(col * 0.32 + base * 0.68, col, clean);

        float vig = vignette(rawUv);
        col *= mix(0.50, 1.10, vig);

        vec2 p = rawUv - 0.5;
        float glow1 = exp(-dot(p - vec2(-0.30, -0.20), p - vec2(-0.30, -0.20)) * 4.2);
        float glow2 = exp(-dot(p - vec2(0.32, 0.28), p - vec2(0.32, 0.28)) * 4.0);
        col += vec3(0.05, 0.20, 0.34) * glow1 * 0.32;
        col += vec3(0.30, 0.12, 0.48) * glow2 * 0.34;

        fragColor = vec4(smoo3(col), 1.0);
      }
    `;

    p5ShaderInstance = new (window as any).p5((p: any) => {
      let shaderProgram: any;
      let reduceMotion = false;

      p.setup = () => {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const canvas = p.createCanvas(w, h, p.WEBGL);
        canvas.parent("overview-shader-bg");
        p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
        p.noStroke();

        reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        try {
          shaderProgram = p.createShader(vert, frag);
        } catch (err) {
          console.error("Failed to compile shader:", err);
        }
      };

      p.draw = () => {
        if (!shaderProgram) return;

        p.shader(shaderProgram);

        const mx = p.constrain(p.mouseX / Math.max(p.width, 1), 0, 1);
        const my = p.constrain(p.mouseY / Math.max(p.height, 1), 0, 1);

        shaderProgram.setUniform("canvasSize", [p.width, p.height]);
        shaderProgram.setUniform("mouse", [mx, my]);
        shaderProgram.setUniform("time", reduceMotion ? 0 : p.frameCount);

        p.quad(-1, 1, 1, 1, 1, -1, -1, -1);
      };

      p.windowResized = () => {
        const nw = container.clientWidth;
        const nh = container.clientHeight;
        p.resizeCanvas(nw, nh);
      };
    });
  } catch (error) {
    console.warn("Could not initialize dynamic WebGL background. Falling back to CSS gradient.", error);
  }
};

const destroyShaderBg = () => {
  if (p5ShaderInstance) {
    try {
      p5ShaderInstance.remove();
    } catch (e) {
      console.error("Error removing p5 instance:", e);
    }
    p5ShaderInstance = null;
  }
};

// Watch activeTheme to initialize or destroy the shader
watch(activeTheme, (newTheme) => {
  if (newTheme === 'glass') {
    initShaderBg();
  } else {
    destroyShaderBg();
  }
});

onMounted(() => {
  // Autoplay Showcase trigger after brief initial delay
  setTimeout(() => {
    if (isAutoplayActive.value) {
      startAutoplay();
    }
  }, 1200);

  // Lyric scrolling timer for V2
  v2LyricTimer = setInterval(() => {
    v2LyricIndex.value = v2LyricIndex.value + 1;
    if (v2LyricIndex.value >= v2LyricsList.length - 1) {
      v2LyricIndex.value = 1;
    }
  }, 3000);

  // V2 Progress Bar auto-updater
  v2ProgressTimer = setInterval(() => {
    v2Progress.value += 1;
    if (v2Progress.value > 100) {
      v2Progress.value = 0;
    }
  }, 250);

  // V2 Platform switcher (switches every 4 seconds between YT Music, Spotify, KKBOX)
  v2PlatformTimer = setInterval(() => {
    v2ActivePlatformIndex.value = (v2ActivePlatformIndex.value + 1) % v2Platforms.length;
  }, 4000);

  syncHeroAudioState();
  setTimeout(syncHeroAudioState, 250);

  // Initialize mobile check and slider autoplay
  checkDimensions();
  window.addEventListener('resize', checkDimensions);
  startSliderAutoplay();

  // Initialize shader if start theme is glass
  if (activeTheme.value === 'glass') {
    initShaderBg();
  }
});

onUnmounted(() => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
  }
  if (v2LyricTimer) {
    clearInterval(v2LyricTimer);
  }
  if (v2ProgressTimer) {
    clearInterval(v2ProgressTimer);
  }
  if (v2PlatformTimer) {
    clearInterval(v2PlatformTimer);
  }
  stopSliderAutoplay();
  window.removeEventListener('resize', checkDimensions);
  destroyShaderBg();
});
</script>

<template>
  <main ref="pageRoot" class="gsap-page">
    <!-- HEADER NAVBAR -->
    <header class="motion-header sticky top-0 z-50 bg-[#090a0f]/80 backdrop-blur-xl border-b border-slate-900/80 py-4">
      <div class="wrap w-full flex items-center justify-between">
        <div class="animated-gmo-brand flex items-center gap-2.5">
          <AnimatedGmoLogo />
          <div class="flex flex-col">
            <span class="animated-gmo-word-main text-white font-black tracking-[0.32em] text-lg uppercase leading-none">GMO</span>
            <span class="animated-gmo-word-sub text-[9px] text-slate-400 font-bold tracking-wider mt-0.5">GamingMusicOverlay</span>
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
            <span class="bg-slate-900 border border-slate-800 text-cyan-400 font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded">v4.1.0</span>
            <NuxtLink to="/en" class="bg-amber-400/10 border border-amber-400/20 text-amber-300 font-extrabold text-[10px] tracking-widest px-2.5 py-1 rounded hover:bg-amber-400/20 transition-all">English</NuxtLink>
          </div>

          <!-- Main mockup title styling -->
          <div class="motion-title-stage">
            <div class="motion-title-spectrum" aria-hidden="true">
              <span v-for="i in 17" :key="i" class="motion-spectrum-bar" />
            </div>
            <div class="motion-title-fireworks" aria-hidden="true">
              <span v-for="i in 24" :key="i" class="motion-title-spark" />
            </div>
            <h1 class="motion-hero-title text-white text-4xl sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black tracking-tight leading-[1.08]">
              <span class="motion-title-primary" aria-label="GamingMusic">
                <span v-for="(letter, index) in 'GamingMusic'" :key="`${letter}-${index}`" class="motion-title-primary-letter" aria-hidden="true">{{ letter }}</span>
              </span>
              <span class="motion-title-overlay" aria-label="Overlay" data-text="Overlay">
                <span v-for="(letter, index) in 'Overlay'" :key="`${letter}-${index}`" class="motion-title-overlay-letter" :class="{ 'motion-overlay-beacon': index === 0 }" aria-hidden="true">{{ letter }}</span>
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
            <div class="motion-download-cta motion-download-split rounded-xl shadow-lg shadow-cyan-400/15 select-none">
              <a
                class="motion-download-choice motion-download-choice-drive"
                :href="heroPrimaryDownloadUrl"
                @click="handleDownloadClick($event, heroPrimaryDownloadUrl)"
              >
                <span class="motion-download-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 3v10m-4-4 4 4 4-4"/><path d="M5 16v3h14v-3"/></svg>
                </span>
                <span class="motion-download-copy">
                  <strong>v4.1.0</strong>
                  <small>穩定載點</small>
                </span>
              </a>
              <a
                class="motion-download-choice motion-download-choice-github"
                :href="heroFallbackDownloadUrl"
                @click="handleDownloadClick($event, heroFallbackDownloadUrl)"
              >
                <span class="motion-download-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 3v10m-4-4 4 4 4-4"/><path d="M5 16v3h14v-3"/></svg>
                </span>
                <span class="motion-download-copy">
                  <strong>v3.0.0</strong>
                  <small>備用載點</small>
                </span>
              </a>
              <span class="motion-download-divider" aria-hidden="true" />
            </div>

            <a class="motion-snapshot-cta border border-slate-800 bg-[#090a0f]/65 hover:bg-slate-900/60 text-slate-200 hover:text-white rounded-xl px-5 py-4 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer font-bold select-none" href="#snapshot">
              <svg class="motion-snapshot-icon w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h16"/></svg>
              查看版本快照
            </a>

          </div>

          <!-- Tagline footer banner -->
          <div class="motion-safety-note flex items-center gap-3 text-emerald-400/90 text-xs md:text-sm mt-8 font-semibold tracking-wide">
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
            <audio
              ref="heroAudioRef"
              class="sr-only"
              preload="metadata"
              @loadedmetadata="syncHeroAudioState"
              @loadeddata="syncHeroAudioState"
              @durationchange="syncHeroAudioState"
              @canplay="syncHeroAudioState"
              @timeupdate="syncHeroAudioState"
              @play="syncHeroAudioState"
              @pause="syncHeroAudioState"
              @ended="syncHeroAudioState"
              @error="handleHeroAudioError"
            >
              <source
                v-for="source in heroAudioSources"
                :key="source.src"
                :src="source.src"
                :type="source.type"
              >
            </audio>
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
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                  <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                  <path d="M15 9.5a5 5 0 0 1 0 5" />
                  <path d="M18 7a9 9 0 0 1 0 10" />
                </svg>
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
                <img
                  class="motion-radio-cover-art"
                  src="/downloads/forza-music-overlay/iu-love-wins-all.png"
                  alt="IU Love wins all single cover"
                >
              </div>

              <!-- Title, artist and service brand badge -->
              <div class="motion-radio-copy min-w-0">
                <div class="flex items-center gap-1.5">
                  <span class="w-3.5 h-3.5 flex-shrink-0" :class="selectedServiceTextClass">
                    <svg v-if="selectedService === 'YouTube Music'" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="10" opacity="0.22" />
                      <path d="M10 7.8 16.4 12 10 16.2Z" />
                    </svg>
                    <svg v-else-if="selectedService === 'Spotify'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round">
                      <path d="M5.5 9.5c4.6-1.3 8.9-1 13 1" />
                      <path d="M6.6 13c3.8-.9 7-.6 9.9.9" />
                      <path d="M7.8 16.3c2.5-.5 4.7-.3 6.6.7" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9 18V6l10-2v11" />
                      <circle cx="6" cy="18" r="3" />
                      <circle cx="16" cy="15" r="3" />
                    </svg>
                  </span>
                  <span class="text-[10px] font-extrabold tracking-widest opacity-60 uppercase">{{ selectedService }}</span>
                </div>
                <h3 class="text-white text-lg font-black truncate mt-1">Love wins all</h3>
                <p class="text-slate-400 text-xs font-bold mt-0.5">IU</p>
              </div>
            </div>

            <div
              class="motion-radio-session"
              :style="{ borderColor: selectedServiceBorderColor, backgroundColor: selectedServiceBgSoft }"
            >
              <span>KARAOKE MP3</span>
              <p>{{ heroSessionLabel }}</p>
            </div>

            <div class="motion-radio-live-controls">
              <button
                class="motion-radio-play"
                type="button"
                :class="{ 'is-playing': isHeroPlaying }"
                :style="{ borderColor: selectedServiceColor, color: selectedServiceColor, backgroundColor: selectedServiceBgSoft }"
                :aria-label="isHeroPlaying ? '暫停歌曲' : '播放歌曲'"
                @click="toggleHeroPlayback"
              >
                <svg v-if="isHeroPlaying" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="7" y="5" width="3.8" height="14" rx="1"></rect>
                  <rect x="13.2" y="5" width="3.8" height="14" rx="1"></rect>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.5v13l10-6.5Z"></path>
                </svg>
              </button>
              <span class="motion-radio-source">
                {{ heroAudioStatusLabel }}
              </span>
            </div>

            <!-- Bottom Row: Glowing progress bar and track elapsed times -->
            <div class="flex items-center justify-between gap-4 mt-2">
              <div
                class="motion-radio-seek flex-grow bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850"
                role="slider"
                aria-label="歌曲播放進度"
                aria-valuemin="0"
                :aria-valuemax="Math.round(heroTrackDuration)"
                :aria-valuenow="Math.round(heroPlaybackSeconds)"
                @pointerdown="seekHeroAudio"
              >
                <div
                  class="motion-radio-progress h-full rounded-full transition-all duration-300"
                  :class="selectedServiceBgClass"
                  :style="{ width: `${heroTrackProgress}%` }"
                />
              </div>
              <span class="text-[10px] text-slate-400 font-bold font-mono">{{ heroCurrentTime }} / {{ heroTotalTime }}</span>
            </div>
          </div>

          <div class="hero-sponsor-goal motion-sponsor-goal" aria-label="S24 Ultra 手機殼贊助累積目標，目前 810 元，共 1500 元">
            <div class="sponsor-goal-device" aria-hidden="true">
              <svg class="motion-case-art" viewBox="0 0 92 116" fill="none">
                <defs>
                  <linearGradient id="caseLineZh" x1="14" y1="14" x2="82" y2="105" gradientUnits="userSpaceOnUse">
                    <stop stop-color="#67E8F9"/><stop offset=".48" stop-color="#C084FC"/><stop offset="1" stop-color="#FBBF24"/>
                  </linearGradient>
                </defs>
                <rect class="motion-case-line case-shell" x="10" y="5" width="72" height="106" rx="9" stroke="url(#caseLineZh)"/>
                <rect class="motion-case-line case-inner" x="15" y="10" width="62" height="96" rx="6" stroke="#94A3B8"/>
                <path class="motion-case-line case-camera-island" d="M16 14H53Q59 14 59 20V55Q59 63 51 68H24Q16 68 16 60Z" stroke="url(#caseLineZh)"/>
                <circle class="motion-case-line case-lens" cx="27" cy="25" r="5.4" stroke="#67E8F9"/><circle class="motion-case-line case-lens" cx="45" cy="26" r="4.2" stroke="#C084FC"/>
                <circle class="motion-case-line case-lens" cx="27" cy="43" r="5.4" stroke="#F472B6"/><circle class="motion-case-line case-lens" cx="45" cy="44" r="3.6" stroke="#FBBF24"/>
                <circle class="motion-case-line case-lens" cx="27" cy="61" r="4.8" stroke="#67E8F9"/>
                <path class="motion-case-flow" d="M18 90C34 76 51 88 73 71M22 99C42 81 56 98 74 85M43 104C56 93 65 101 75 94" stroke="url(#caseLineZh)"/>
                <path class="motion-case-scan" d="M18 18H74" stroke="#F8FAFC"/>
              </svg>
            </div>
            <div class="sponsor-goal-content">
              <div class="sponsor-goal-head">
                <div>
                  <p>S24 ULTRA CASE FUND</p>
                  <strong>作者的手機殼壞了</strong>
                </div>
                <span>LIVE GOAL</span>
              </div>
              <div class="sponsor-goal-meter">
                <i class="motion-goal-fill" style="width: 54%" />
                <b class="motion-goal-scan" />
              </div>
              <div class="sponsor-goal-foot">
                <span>贊助累積</span>
                <strong><em>810</em> / 1500</strong>
              </div>
            </div>
            <div class="sponsor-goal-ticker" aria-label="贊助名單">
              <div class="motion-sponsor-ticker-track">
                <div class="sponsor-goal-ticker-group">
                  <span>贊助名單</span><strong>salutman 300元</strong><i>匿名贊助者 150元</i><strong>alex983963 210元</strong><i>nath 150元</i>
                </div>
                <div class="sponsor-goal-ticker-group" aria-hidden="true">
                  <span>贊助名單</span><strong>salutman 300元</strong><i>匿名贊助者 150元</i><strong>alex983963 210元</strong><i>nath 150元</i>
                </div>
              </div>
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
            <p class="eyebrow">Drink lab for players</p>
            <h2>選一杯飲品支持開發，<span>把下一次更新沖泡出來。</span></h2>
            <p>GMO 維持免費開放。你選的咖啡、珍奶或冰飲，會變成修正、新功能與更穩定的遊戲體驗。</p>
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
              <strong>一杯飲品</strong>
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

          <div class="support-energy motion-support-energy">
            <div class="support-energy-copy">
              <small>SVG drink lab</small>
              <strong>今天想替開發補充哪一杯？</strong>
              <span>咖啡與珍奶是主角，檸檬冰飲負責讓深夜開發醒一下。</span>
              <div class="support-drink-tabs">
                <button class="motion-drink-tab is-active" type="button" data-drink="pour-over" data-label="手沖咖啡" aria-label="選擇手沖咖啡" aria-pressed="true">
                  <svg viewBox="0 0 48 48"><path d="M12 15h24l-4 21H16Z"/><path d="M16 15c1-6 15-6 16 0M13 20h22"/><path class="motion-drink-liquid" d="M16 27h16l-2 7H18Z"/></svg><span>咖啡</span>
                </button>
                <button class="motion-drink-tab" type="button" data-drink="boba" data-label="珍珠奶茶" aria-label="選擇珍珠奶茶" aria-pressed="false">
                  <svg viewBox="0 0 48 48"><path d="M14 11h20l-3 27H17Z"/><path d="M18 11 27 4M15 17h18"/><path class="motion-drink-liquid" d="M18 22h13l-2 14H19Z"/><circle cx="22" cy="32" r="1.3"/><circle cx="27" cy="34" r="1.3"/></svg><span>珍奶</span>
                </button>
                <button class="motion-drink-tab" type="button" data-drink="lemon-tea" data-label="檸檬冰飲" aria-label="選擇檸檬冰飲" aria-pressed="false">
                  <svg viewBox="0 0 48 48"><path d="M14 12h20l-3 26H17Z"/><path d="M16 18h16M27 5l-5 12"/><path class="motion-drink-liquid" d="M18 22h13l-2 14H19Z"/><circle cx="25" cy="27" r="4"/></svg><span>檸檬</span>
                </button>
              </div>
            </div>
            <div class="support-drink-stage">
              <span class="motion-drink-orbit" aria-hidden="true" />
              <svg class="motion-drink-blueprint" viewBox="0 0 160 120" aria-hidden="true">
                <path class="motion-blueprint-shape" d="M46.15 36.72Q46.08 48.24 45.41 65.16Q44.75 82.08 43.96 84.15Q43.16 86.22 41.13 87.56Q39.1 88.89 33.05 88.53L32 84.57Q38.92 84.78 39.56 83.83Q40.9 81.76 42.19 51.09L42.41 40.47H35.03Q34.6 60.45 32.44 70.56Q30.28 80.68 25.2 89L21.74 86.55Q30.71 72.07 31.1 40.47H25.6V36.72H31.18Q31.46 32.62 31.46 24.3H35.17Q35.28 29.56 35.03 36.72ZM22.43 77.84H18.79V73.8H11.66V79.38H7.81V29.27H22.43ZM18.79 70.1V33.02H11.66V70.1ZM66.71 87.74H62.89V81.98H54.04V87.74H50.29V32.73H66.71ZM62.89 78.3V36.47H54.04V78.3ZM143.08 71.28H128.94V88.67H125.01V24.41H128.94V35.61H141.54V39.28H128.94V50.58H140.71V54.11H128.94V67.54H143.08ZM117.27 49.54Q117.27 60.09 116.21 66.91Q115.15 73.73 111.64 79.33Q108.13 84.93 102.22 88.92L98.91 86.12Q110.11 78.92 112.12 68.12Q105.03 70.92 101.29 72.04L100.03 68.33Q106.4 66.5 112.84 63.62Q113.38 58.65 113.38 54.11H101.72V50.4H113.46V39.28H101V35.61H113.46V24.41H117.27ZM97.65 78.95H93.91V75.28H84.98V80.86H81.24V30.53H97.65ZM93.84 71.36V34.42H84.98V71.36Z"/>
                <path class="motion-blueprint-target" data-drink="pour-over" d="M38 20 C42 13 104 13 110 20 L98 54 C94 61 55 61 50 54 Z M58 61 C66 57 86 57 94 61 L100 98 C99 105 54 105 53 98 Z M100 70 C120 67 122 91 101 91"/>
                <path class="motion-blueprint-target" data-drink="boba" d="M52 17 C62 13 97 13 107 17 L98 104 C88 108 69 108 59 104 Z M72 16 L92 4 M65 83 C68 80 72 80 75 83 C72 86 68 86 65 83 M81 91 C84 88 88 88 91 91 C88 94 84 94 81 91"/>
                <path class="motion-blueprint-target" data-drink="lemon-tea" d="M43 23 C55 18 104 18 116 23 L105 101 C95 106 64 106 54 101 Z M93 5 L78 42 M70 68 C70 54 91 54 91 68 C91 82 70 82 70 68"/>
                <g class="motion-drink-details motion-detail-coffee"><path d="M60 17 C52 5 68 2 61 -9"/><path d="M78 17 C70 5 86 2 79 -9"/><path d="M98 71 C119 67 122 91 101 91"/></g>
                <g class="motion-drink-details motion-detail-boba"><circle cx="67" cy="89" r="4"/><circle cx="79" cy="95" r="4"/><circle cx="91" cy="87" r="4"/><path d="M76 17 94 0"/></g>
                <g class="motion-drink-details motion-detail-lemon"><circle cx="81" cy="70" r="13"/><path d="M81 57V83M68 70H94M72 61 90 79M90 61 72 79"/><path d="M95 5 80 43"/></g>
              </svg>
              <strong class="motion-drink-label">手沖咖啡</strong>
            </div>
            <div class="motion-drink-cursor-preview" aria-hidden="true">
              <img class="motion-drink-photo is-active" data-drink="pour-over" src="/downloads/forza-music-overlay/drinks/pour-over.png" alt="">
              <img class="motion-drink-photo" data-drink="boba" src="/downloads/forza-music-overlay/drinks/boba.png" alt="">
              <img class="motion-drink-photo" data-drink="lemon-tea" src="/downloads/forza-music-overlay/drinks/lemon-tea.png" alt="">
            </div>
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
              <a class="sponsor-button" href="https://buymeacoffee.com/scott5497" target="_blank" rel="noopener noreferrer">請我喝杯飲品</a>
            </div>
          </div>
        </div>

        <aside class="download-panel" id="snapshot">
          <div class="panel-head">
            <div>
              <p>最新版本快照</p>
              <h2>v4.1.0</h2>
            </div>
            <div class="music-icon">
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>
            </div>
          </div>

          <div class="meta-row"><span>檔案</span><strong>GamingMusicOverlay-release4.1.0_portable-test.zip</strong></div>
          <div class="meta-row"><span>平台</span><strong>Windows 10 / 11</strong></div>
          <div class="meta-row"><span>更新日期</span><strong>2026-06-16</strong></div>

          <div class="snapshot-box">
            <p class="box-label">版本快照</p>
            <p>4.1.0 支援 KKBOX、自訂字體大小調整，並進行 UI 與效能優化。</p>
            <p>3.5.0 提供 Nuitka standalone safe 版本，作為目前穩定載點。</p>
            <p>3.1.0 優化程式打包流程，降低 Windows Defender 誤報機率。</p>
            <p>3.0+ 新增 App / System 獨立音量切換與沉浸式閃電 HUD。</p>
            <p>3.0+ 新增即時滾動歌詞與 GPU 加速 SVG 霓虹效果。</p>
          </div>

          <div class="download-box">
            <p class="box-label">最新版下載</p>
            <a
              class="download-link"
              :href="googleDriveDownloadUrl"
              @click="handleDownloadClick($event, googleDriveDownloadUrl)"
            >
              <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              GamingMusicOverlay-release4.1.0_portable-test.zip
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

    <!-- BAND SECTION (3D Cover Flow Slider) -->
    <section 
      class="band bg-slate-950 border-t border-slate-900/50 transition-colors duration-500 relative overflow-hidden" 
      id="overview"
      :class="{ 'glass-mode-active': activeTheme === 'glass' }"
    >
      <!-- Shader canvas container -->
      <div 
        id="overview-shader-bg" 
        class="absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000"
        :class="{ 'opacity-100': activeTheme === 'glass', 'opacity-0': activeTheme !== 'glass' }"
      ></div>

      <div class="wrap w-full v2-slider-container relative z-10 transition-all duration-500" :class="{ 'overview-glass-card': activeTheme === 'glass' }">
        
        <!-- Left Column: Text Panel & Slider Controls -->
        <div class="v2-text-panel flex-shrink-0">
          <p class="eyebrow text-cyan-400 font-bold uppercase text-xs">Overview</p>
          <h2 class="section-title text-white font-extrabold text-4xl mt-2 leading-tight">這個工具做什麼</h2>
          <p class="overview-copy text-slate-300 mt-4 leading-relaxed text-sm">
            程式透過 Windows 目前媒體工作階段讀取歌曲資訊。啟動後可從控制台開啟 YouTube Music、Spotify 或 Apple Music，選擇 App / System 音量控制、動態歌詞與三種懸浮播放器主題。登入都在官方服務中完成，工具本身不會要求、保存或讀取帳號密碼。
          </p>
          
          <!-- Slider Navigation controls -->
          <div class="v2-slider-controls flex items-center gap-4 mt-6">
            <button class="v2-slider-btn v2-prev" @click="prevSlide" aria-label="Previous Slide">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div class="v2-slider-dots flex items-center gap-2">
              <button 
                v-for="idx in 4" 
                :key="idx" 
                class="v2-slider-dot" 
                :class="{ 'is-active': activeDotIndex === idx - 1 }"
                @click="goToSlide(idx - 1)"
                :aria-label="`Go to slide ${idx}`"
              ></button>
            </div>
            <button class="v2-slider-btn v2-next" @click="nextSlide" aria-label="Next Slide">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <!-- Right Column: Slider Viewport -->
        <div 
          class="v2-carousel-viewport"
          ref="viewportRef"
          @mouseenter="isHovered = true"
          @mouseleave="isHovered = false"
        >
          <div 
            class="v2-carousel-track"
            :style="{ 
              transform: `translateX(${trackTranslateX}px)`, 
              transition: 'none' 
            }"
          >
            <!-- Inert Clone 3 (Duplicate of Card 3 for looping) -->
            <article class="feature-card feature-card--3 flex-shrink-0 v2-clone" :style="getCardStyle(0)">
              <div class="scene-themes-header mt-1">手把組合鍵</div>
              <div class="text-[9px] text-slate-400 text-center leading-normal mb-1">
                按住左蘑菇頭 (L3) 搭配對應按鍵快速控制
              </div>

              <!-- Holographic Projector Viewport -->
              <div class="holo-projector relative w-full h-[140px] flex items-center justify-center overflow-visible">
                <!-- Holographic projector base rings -->
                <div class="holo-ring holo-ring-1"></div>
                <div class="holo-ring holo-ring-2"></div>
                
                <!-- Hologram Light Cone -->
                <div class="holo-cone"></div>
                
                <!-- Floating Controller wrapper -->
                <div class="holo-controller-wrapper relative z-10 select-none">
                  <img class="scene-pad-img mx-auto w-[130px] transition-transform duration-500" src="/overview/controller-neon.svg" alt="Xbox Controller" />
                  <!-- Glowing indicators -->
                  <span class="v2-btn-glow v2-btn-glow--a" :class="{ 'is-active': activeCombo === 'a' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--b" :class="{ 'is-active': activeCombo === 'b' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--x" :class="{ 'is-active': activeCombo === 'x' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--dpad-up" :class="{ 'is-active': activeCombo === 'dpad-up' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--dpad-down" :class="{ 'is-active': activeCombo === 'dpad-down' }"></span>
                </div>
              </div>

              <!-- Holographic Grid Panel (6 Items) -->
              <div class="holo-grid grid grid-cols-3 gap-2 px-1 mt-2.5">
                <!-- Box 1 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center gap-0.5 text-[8px] font-bold text-slate-300">
                    <kbd class="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[8px]">L3</kbd>
                    <span>+</span>
                    <kbd class="px-1 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/30 text-[8px]">A</kbd>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">播放 / 暫停</div>
                </div>

                <!-- Box 2 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center gap-0.5 text-[8px] font-bold text-slate-300">
                    <kbd class="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[8px]">L3</kbd>
                    <span>+</span>
                    <kbd class="px-1 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30 text-[8px]">B</kbd>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">下一首</div>
                </div>

                <!-- Box 3 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center gap-0.5 text-[8px] font-bold text-slate-300">
                    <kbd class="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[8px]">L3</kbd>
                    <span>+</span>
                    <kbd class="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 text-[8px]">X</kbd>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">上一首</div>
                </div>

                <!-- Box 4 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center h-[18px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-cyan-400" width="20" height="20" style="width: 20px; height: 20px;">
                      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" fill="rgba(6, 182, 212, 0.05)" stroke="currentColor" opacity="0.3" />
                      <polygon points="12,3 9,7 15,7" fill="currentColor" />
                    </svg>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">調高音量</div>
                </div>

                <!-- Box 5 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center h-[18px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-cyan-400" width="20" height="20" style="width: 20px; height: 20px;">
                      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" fill="rgba(6, 182, 212, 0.05)" stroke="currentColor" opacity="0.3" />
                      <polygon points="12,21 9,17 15,17" fill="currentColor" />
                    </svg>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">調低音量</div>
                </div>

                <!-- Box 6 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center h-[18px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-cyan-400" width="20" height="20" style="width: 20px; height: 20px;">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">可自訂按鍵</div>
                </div>
              </div>

              <!-- Customizable Hotkey Button -->
              <div class="w-full flex justify-center mt-3">
                <button class="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-[9px] font-bold text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)]">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-2.5 h-2.5">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                  <span>可自訂按鍵</span>
                </button>
              </div>
            </article>

            <!-- Inert Clone 4 (Duplicate of Card 4 for looping) -->
            <article class="feature-card feature-card--4 flex-shrink-0 v2-clone" :style="getCardStyle(1)">
              <div class="scene-themes-header">Overlay Themes (互動切換)</div>
              
              <!-- Live Preview Simulator Window -->
              <div class="theme-live-preview" :class="`preview-${activeTheme}`">
                <!-- Liquid Glass Background Mesh (Only animated and visible in glass mode) -->
                <div class="preview-liquid-mesh" v-if="activeTheme === 'glass'">
                  <div class="mesh-blob mesh-blob-1"></div>
                  <div class="mesh-blob mesh-blob-2"></div>
                  <div class="mesh-blob mesh-blob-3"></div>
                </div>

                <!-- Sim Player Body -->
                <div class="sim-player" :class="`sim-${activeTheme}`">
                  <!-- Slim / Radio Bar Layout -->
                  <template v-if="activeTheme === 'radio'">
                    <div class="sim-radio-bar">
                      <div class="sim-radio-pulse"></div>
                      <span class="sim-radio-title">HOT - LE SSERAFIM</span>
                      <!-- Mini EQ bars -->
                      <div class="sim-radio-eq">
                        <div></div><div></div><div></div>
                      </div>
                    </div>
                  </template>
                  
                  <!-- Normal / Dark / Glass Player Layout -->
                  <template v-else>
                    <div class="sim-player-top">
                      <span class="sim-dot-red"></span>
                      <span class="sim-dot-yellow"></span>
                      <span class="sim-dot-green"></span>
                      <span class="sim-platform-badge">YouTube Music</span>
                    </div>
                    <div class="sim-player-content">
                      <img class="sim-album" src="/overview/album-art.png" alt="Album Art" />
                      <div class="sim-info">
                        <div class="sim-title">HOT</div>
                        <div class="sim-artist">LE SSERAFIM</div>
                        <div class="sim-progress-bar">
                          <div class="sim-progress-fill"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="scene-themes-grid">
                <!-- Dark Theme -->
                <div 
                  class="st-preview st-dark-theme" 
                  :class="{ 'theme-active': activeTheme === 'dark' }"
                  @click="activeTheme = 'dark'"
                >
                  <div class="st-mini-bar"></div>
                  <div class="st-mini-art"></div>
                  <div class="st-mini-lines">
                    <div></div>
                    <div></div>
                  </div>
                  <span>DARK</span>
                </div>
                <div 
                  class="st-preview st-glass-theme" 
                  :class="{ 'theme-active': activeTheme === 'glass' }"
                  @click="activeTheme = 'glass'"
                >
                  <div class="st-mini-bar"></div>
                  <div class="st-mini-art"></div>
                  <div class="st-mini-lines">
                    <div></div>
                    <div></div>
                  </div>
                  <span>GLASS</span>
                </div>
                <div 
                  class="st-preview st-radio-theme" 
                  :class="{ 'theme-active': activeTheme === 'radio' }"
                  @click="activeTheme = 'radio'"
                >
                  <div class="st-mini-bar"></div>
                  <div class="st-mini-art"></div>
                  <div class="st-mini-lines">
                    <div></div>
                    <div></div>
                  </div>
                  <span>RADIO</span>
                </div>
              </div>
              <div class="theme-description-box mt-3 p-2 rounded border text-[9px] text-slate-400 leading-normal min-h-[44px]">
                <p v-if="activeTheme === 'dark'" class="animate-fade-in">
                  <strong class="text-cyan-400">Dark 主題</strong>：沉穩的深色風格，專為夜間極速賽道設計，低干擾高對比。
                </p>
                <p v-else-if="activeTheme === 'glass'" class="animate-fade-in">
                  <strong class="text-cyan-400">Liquid Glass</strong>：透光磨砂玻璃，動態透出遊戲畫面背景，極具科技感。
                </p>
                <p v-else-if="activeTheme === 'radio'" class="animate-fade-in">
                  <strong class="text-cyan-400">Radio 主題</strong>：極簡條狀無框收音機外觀，僅佔用最小遊戲視野。
                </p>
              </div>
            </article>

            <!-- Card 1: Now Playing Overlay (Dynamic Platform-Switching Theme) -->
            <article class="feature-card feature-card--1 flex-shrink-0" :style="getCardStyle(2)">
              <!-- Header -->
              <div class="v2-card-header flex items-center justify-between w-full">
                <div class="v2-header-left flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                  <!-- Equalizer animated icon -->
                  <div class="v2-eq-mini flex items-end gap-0.5 h-3">
                    <span class="v2-eq-bar-mini" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                    <span class="v2-eq-bar-mini" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                    <span class="v2-eq-bar-mini" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                  </div>
                  <span>GMO</span>
                </div>
                
                <!-- Right Group (Badge + Three dots) -->
                <div class="v2-header-right flex items-center gap-2">
                  <!-- Dynamic Brand Badge Pill -->
                  <div 
                    class="v2-brand-badge flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold transition-all duration-500"
                    :style="{ 
                      backgroundColor: v2ActivePlatform.bgSoft, 
                      border: `1px solid ${v2ActivePlatform.borderSoft}`, 
                      color: v2ActivePlatform.color 
                    }"
                  >
                    <!-- Brand Icon SVG -->
                    <span class="w-3 h-3 flex items-center justify-center">
                      <svg v-if="v2ActivePlatform.id === 'youtube'" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                        <circle cx="12" cy="12" r="10" fill="currentColor"/>
                        <polygon points="10,8 16,12 10,16" fill="#000"/>
                      </svg>
                      <svg v-else-if="v2ActivePlatform.id === 'spotify'" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-1.02-.336.073-.668-.138-.74-.474-.072-.336.137-.668.473-.74 3.856-.88 7.15-.506 9.814 1.128.295.18.387.566.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.077-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.67-1.114 8.24-.57 11.34 1.34.367.228.487.708.26 1.075zm.106-2.833c-.273.443-.85.584-1.293.31-3.18-1.89-8.42-2.107-11.442-1.19-.502.15-1.03-.135-1.18-.636-.15-.502.135-1.03.636-1.18 3.6-1.093 9.4-0.84 13.01 1.302.44.272.58.85.31 1.294z"/>
                      </svg>
                      <svg v-else-if="v2ActivePlatform.id === 'kkbox'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" fill="currentColor" stroke="none" />
                        <circle cx="18" cy="16" r="3" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    <span>{{ v2ActivePlatform.name }}</span>
                  </div>
                  
                  <!-- Three dots vertical icon -->
                  <div class="text-slate-500 hover:text-slate-300 cursor-pointer text-sm font-bold">
                    ⋮
                  </div>
                </div>
              </div>

              <!-- Album Art with Dynamic Glow -->
              <div class="v2-album-container my-2 flex justify-center relative">
                <div 
                  class="v2-album-glow absolute inset-0 blur-2xl opacity-60 rounded-full transition-all duration-500 scale-90"
                  :style="{ backgroundColor: v2ActivePlatform.color }"
                ></div>
                <img 
                  class="v2-album-art w-[150px] h-[150px] rounded-2xl object-cover relative z-10 border border-white/10 transition-transform duration-500 hover:scale-105"
                  src="/overview/album-art.png" 
                  alt="Album Art" 
                />
              </div>

              <!-- Song Info (HOT / LE SSERAFIM) + Heart -->
              <div class="v2-song-info flex items-center justify-between w-full px-2">
                <div class="w-5"></div> <!-- Left spacer -->
                
                <div class="v2-song-details text-center">
                  <div class="text-base font-bold text-white tracking-wide">HOT</div>
                  <div class="text-[11px] text-slate-400 font-medium mt-0.5">LE SSERAFIM</div>
                </div>
                
                <!-- Heart Button with dynamic brand color -->
                <button class="v2-heart-btn focus:outline-none transition-colors duration-300">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2.5" 
                    class="w-5 h-5 transition-all duration-500"
                    :style="{ color: v2ActivePlatform.color, filter: `drop-shadow(0 0 4px ${v2ActivePlatform.glow})` }"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <!-- Progress Bar -->
              <div class="v2-progress-section w-full px-1 mt-2">
                <div class="v2-progress-bar-container relative h-1 bg-white/10 rounded-full cursor-pointer">
                  <div 
                    class="v2-progress-fill h-full rounded-full transition-all duration-300 relative" 
                    :style="{ width: v2Progress + '%', backgroundColor: v2ActivePlatform.color }"
                  >
                    <span 
                      class="v2-progress-handle absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full bg-white transition-all duration-500"
                      :style="{ boxShadow: `0 0 8px ${v2ActivePlatform.color}` }"
                    ></span>
                  </div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5 font-mono">
                  <span>{{ v2ProgressTime }}</span>
                  <span>3:13</span>
                </div>
              </div>

              <!-- Controls Panel -->
              <div class="v2-controls-panel flex items-center justify-between w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-1.5 mt-1">
                <!-- Shuffle -->
                <button class="v2-ctrl-btn text-slate-500 hover:text-slate-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                </button>
                <!-- Prev -->
                <button class="v2-ctrl-btn text-slate-300 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="19,20 9,12 19,4"></polygon><rect x="5" y="4" width="2" height="16"></rect></svg>
                </button>
                <!-- Play/Pause -->
                <button 
                  class="v2-play-btn w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 text-white"
                  :style="{ 
                    borderColor: v2ActivePlatform.color, 
                    boxShadow: `0 0 10px ${v2ActivePlatform.glow}`,
                    backgroundColor: `${v2ActivePlatform.color}15`
                  }"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                </button>
                <!-- Next -->
                <button class="v2-ctrl-btn text-slate-300 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="5,4 15,12 5,20"></polygon><rect x="17" y="4" width="2" height="16"></rect></svg>
                </button>
                <!-- Repeat -->
                <button class="v2-ctrl-btn text-slate-500 hover:text-slate-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                </button>
              </div>

              <!-- Lyrics Box Container -->
              <div class="v2-lyrics-box w-full border border-white/[0.07] bg-black/15 rounded-xl p-3 mt-2 h-[66px] overflow-hidden relative flex flex-col justify-center">
                <div class="v2-lyrics-viewport transition-transform duration-500 ease-in-out" :style="{ transform: `translateY(${(1 - v2LyricIndex) * 20}px)` }">
                  <p 
                    v-for="(lyric, idx) in v2LyricsList" 
                    :key="idx"
                    class="h-5 leading-5 text-[10px] text-center transition-all duration-300"
                    :class="idx === v2LyricIndex ? 'font-bold scale-105' : 'text-slate-500 opacity-40'"
                    :style="idx === v2LyricIndex ? { color: v2ActivePlatform.color } : {}"
                  >
                    {{ lyric }}
                  </p>
                </div>
              </div>

              <!-- Indicators footer -->
              <div class="v2-card-footer flex justify-center gap-1.5 mt-2.5 w-full">
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span class="w-3.5 h-1.5 rounded-full transition-all duration-500" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              </div>
            </article>

            <!-- Card 2: Volume Control (V2 with drag adjustment and dynamic visualizer) -->
            <article class="feature-card feature-card--2 flex-shrink-0" :style="getCardStyle(3)">
              <div class="volume-console" :class="`volume-console--${volumeTarget}`">
                <div class="volume-console-head">
                  <div class="volume-title-wrap">
                    <span class="volume-main-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                        <path d="M15 9.5a5 5 0 0 1 0 5" />
                        <path d="M18 7a9 9 0 0 1 0 10" />
                      </svg>
                    </span>
                    <div>
                      <h3>Volume</h3>
                      <p>App / System routing</p>
                    </div>
                  </div>
                  <div class="volume-window-controls" aria-hidden="true">
                    <span></span>
                    <span></span>
                  </div>
                </div>

                <div class="volume-segmented">
                  <button type="button" :class="{ 'is-active': volumeTarget === 'app' }" @click="volumeTarget = 'app'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                      <rect x="4" y="6" width="16" height="12" rx="2" />
                      <path d="M8 18h8" />
                    </svg>
                    調整網頁 (App)
                  </button>
                  <button type="button" :class="{ 'is-active': volumeTarget === 'system' }" @click="volumeTarget = 'system'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                      <rect x="5" y="4" width="14" height="11" rx="1.8" />
                      <path d="M9 20h6M12 15v5" />
                    </svg>
                    調整系統 (System)
                  </button>
                </div>

                <div class="volume-card-stack">
                  <div class="volume-control-card" :class="{ 'is-active': volumeTarget === 'app' }">
                    <span class="volume-card-tag">網頁 (App) 音量</span>
                    <div class="volume-card-body">
                      <span class="volume-card-icon volume-card-icon--app">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9s-1.2 6.5-3.5 9M12 3c-2.3 2.5-3.5 5.5-3.5 9s1.2 6.5 3.5 9" />
                        </svg>
                      </span>
                      <div class="volume-card-main">
                        <strong>{{ v2VolumeApp }}%</strong>
                        <div class="scene-mixer-track" @pointerdown="beginVolumePointer($event, 'app')">
                          <div class="scene-mixer-fill" :style="{ width: v2VolumeApp + '%' }"></div>
                        </div>
                        <p>調整瀏覽器與網站的音量</p>
                      </div>
                    </div>
                  </div>

                  <div class="volume-control-card" :class="{ 'is-active': volumeTarget === 'system' }">
                    <span class="volume-card-tag volume-card-tag--system">系統 (System) 音量</span>
                    <div class="volume-card-body">
                      <span class="volume-card-icon volume-card-icon--system">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                          <rect x="5" y="5" width="14" height="10" rx="1.5" />
                          <path d="M8 20h8M12 15v5" />
                        </svg>
                      </span>
                      <div class="volume-card-main">
                        <strong>{{ v2VolumeSys }}%</strong>
                        <div class="scene-mixer-track" @pointerdown="beginVolumePointer($event, 'system')">
                          <div class="scene-mixer-fill scene-mixer-fill--sys" :style="{ width: v2VolumeSys + '%' }"></div>
                        </div>
                        <p>調整電腦與其他應用程式的音量</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="volume-master-row">
                  <div class="volume-master-copy">
                    <span class="volume-master-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                        <path d="m19 9-4 6M15 9l4 6" />
                      </svg>
                    </span>
                    <div>
                      <small>總音量輸出</small>
                      <div class="volume-master-track">
                        <span style="width: 60%"></span>
                      </div>
                    </div>
                  </div>
                  <strong>60%</strong>
                  <button class="volume-mute-button" type="button">靜音</button>
                </div>
              </div>
            </article>

            <!-- Card 3: Controller Combos (Redesigned Holographic Interface) -->
            <article class="feature-card feature-card--3 flex-shrink-0" @mouseleave="activeCombo = ''" :style="getCardStyle(4)">
              <div class="scene-themes-header mt-1">手把組合鍵</div>
              <div class="text-[9px] text-slate-400 text-center leading-normal mb-1">
                按住左蘑菇頭 (L3) 搭配對應按鍵快速控制
              </div>

              <!-- Holographic Projector Viewport -->
              <div class="holo-projector relative w-full h-[140px] flex items-center justify-center overflow-visible">
                <!-- Holographic projector base rings -->
                <div class="holo-ring holo-ring-1"></div>
                <div class="holo-ring holo-ring-2"></div>
                
                <!-- Hologram Light Cone -->
                <div class="holo-cone"></div>
                
                <!-- Floating Controller wrapper -->
                <div class="holo-controller-wrapper relative z-10 select-none">
                  <img class="scene-pad-img mx-auto w-[130px] transition-transform duration-500" src="/overview/controller-neon.svg" alt="Xbox Controller" />
                  <!-- Glowing indicators -->
                  <span class="v2-btn-glow v2-btn-glow--a" :class="{ 'is-active': activeCombo === 'a' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--b" :class="{ 'is-active': activeCombo === 'b' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--x" :class="{ 'is-active': activeCombo === 'x' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--dpad-up" :class="{ 'is-active': activeCombo === 'dpad-up' }"></span>
                  <span class="v2-btn-glow v2-btn-glow--dpad-down" :class="{ 'is-active': activeCombo === 'dpad-down' }"></span>
                </div>
              </div>

              <!-- Holographic Grid Panel (6 Items) -->
              <div class="holo-grid grid grid-cols-3 gap-2 px-1 mt-2.5">
                <!-- Box 1 -->
                <div 
                  class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center"
                  :class="{ 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.25)]': activeCombo === 'a' }"
                  @mouseenter="activeCombo = 'a'"
                >
                  <div class="flex items-center justify-center gap-0.5 text-[8px] font-bold text-slate-300">
                    <kbd class="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[8px]">L3</kbd>
                    <span>+</span>
                    <kbd class="px-1 py-0.5 bg-green-500/20 text-green-400 rounded border border-green-500/30 text-[8px]">A</kbd>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">播放 / 暫停</div>
                </div>

                <!-- Box 2 -->
                <div 
                  class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center"
                  :class="{ 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.25)]': activeCombo === 'b' }"
                  @mouseenter="activeCombo = 'b'"
                >
                  <div class="flex items-center justify-center gap-0.5 text-[8px] font-bold text-slate-300">
                    <kbd class="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[8px]">L3</kbd>
                    <span>+</span>
                    <kbd class="px-1 py-0.5 bg-red-500/20 text-red-400 rounded border border-red-500/30 text-[8px]">B</kbd>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">下一首</div>
                </div>

                <!-- Box 3 -->
                <div 
                  class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center"
                  :class="{ 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.25)]': activeCombo === 'x' }"
                  @mouseenter="activeCombo = 'x'"
                >
                  <div class="flex items-center justify-center gap-0.5 text-[8px] font-bold text-slate-300">
                    <kbd class="px-1 py-0.5 bg-slate-800 rounded border border-slate-700 text-[8px]">L3</kbd>
                    <span>+</span>
                    <kbd class="px-1 py-0.5 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30 text-[8px]">X</kbd>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">上一首</div>
                </div>

                <!-- Box 4 -->
                <div 
                  class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center"
                  :class="{ 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.25)]': activeCombo === 'dpad-up' }"
                  @mouseenter="activeCombo = 'dpad-up'"
                >
                  <div class="flex items-center justify-center h-[18px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-cyan-400" width="20" height="20" style="width: 20px; height: 20px;">
                      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" fill="rgba(6, 182, 212, 0.05)" stroke="currentColor" opacity="0.3" />
                      <polygon points="12,3 9,7 15,7" fill="currentColor" />
                    </svg>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">調高音量</div>
                </div>

                <!-- Box 5 -->
                <div 
                  class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center"
                  :class="{ 'border-cyan-500/40 bg-cyan-500/10 shadow-[0_0_8px_rgba(6,182,212,0.25)]': activeCombo === 'dpad-down' }"
                  @mouseenter="activeCombo = 'dpad-down'"
                >
                  <div class="flex items-center justify-center h-[18px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-cyan-400" width="20" height="20" style="width: 20px; height: 20px;">
                      <path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6V3z" fill="rgba(6, 182, 212, 0.05)" stroke="currentColor" opacity="0.3" />
                      <polygon points="12,21 9,17 15,17" fill="currentColor" />
                    </svg>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">調低音量</div>
                </div>

                <!-- Box 6 -->
                <div class="holo-grid-item cursor-pointer transition-all border border-cyan-500/10 bg-cyan-950/5 hover:border-cyan-500/35 hover:bg-cyan-500/10 rounded-lg p-1 text-center">
                  <div class="flex items-center justify-center h-[18px]">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-cyan-400" width="20" height="20" style="width: 20px; height: 20px;">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                  </div>
                  <div class="text-[8px] text-slate-400 mt-2 font-semibold">可自訂按鍵</div>
                </div>
              </div>

              <!-- Customizable Hotkey Button -->
              <div class="w-full flex justify-center mt-3">
                <button class="flex items-center justify-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-950/20 text-[9px] font-bold text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.15)] transition-all hover:bg-cyan-500/20 hover:shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-2.5 h-2.5">
                    <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
                  </svg>
                  <span>可自訂按鍵</span>
                </button>
              </div>
            </article>

            <!-- Card 4: Three Themes (V2 with interactive tabs) -->
            <article class="feature-card feature-card--4 flex-shrink-0" :style="getCardStyle(5)">
              <div class="scene-themes-header">Overlay Themes (互動切換)</div>
              
              <!-- Live Preview Simulator Window -->
              <div class="theme-live-preview" :class="`preview-${activeTheme}`">
                <!-- Liquid Glass Background Mesh (Only animated and visible in glass mode) -->
                <div class="preview-liquid-mesh" v-if="activeTheme === 'glass'">
                  <div class="mesh-blob mesh-blob-1"></div>
                  <div class="mesh-blob mesh-blob-2"></div>
                  <div class="mesh-blob mesh-blob-3"></div>
                </div>

                <!-- Sim Player Body -->
                <div class="sim-player" :class="`sim-${activeTheme}`">
                  <!-- Slim / Radio Bar Layout -->
                  <template v-if="activeTheme === 'radio'">
                    <div class="sim-radio-bar">
                      <div class="sim-radio-pulse"></div>
                      <span class="sim-radio-title">HOT - LE SSERAFIM</span>
                      <!-- Mini EQ bars -->
                      <div class="sim-radio-eq">
                        <div></div><div></div><div></div>
                      </div>
                    </div>
                  </template>
                  
                  <!-- Normal / Dark / Glass Player Layout -->
                  <template v-else>
                    <div class="sim-player-top">
                      <span class="sim-dot-red"></span>
                      <span class="sim-dot-yellow"></span>
                      <span class="sim-dot-green"></span>
                      <span class="sim-platform-badge">YouTube Music</span>
                    </div>
                    <div class="sim-player-content">
                      <img class="sim-album" src="/overview/album-art.png" alt="Album Art" />
                      <div class="sim-info">
                        <div class="sim-title">HOT</div>
                        <div class="sim-artist">LE SSERAFIM</div>
                        <div class="sim-progress-bar">
                          <div class="sim-progress-fill"></div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="scene-themes-grid">
                <!-- Dark Theme -->
                <div 
                  class="st-preview st-dark-theme" 
                  :class="{ 'theme-active': activeTheme === 'dark' }"
                  @click="activeTheme = 'dark'"
                >
                  <div class="st-mini-bar"></div>
                  <div class="st-mini-art"></div>
                  <div class="st-mini-lines">
                    <div></div>
                    <div></div>
                  </div>
                  <span>DARK</span>
                </div>

                <!-- Liquid Glass Theme -->
                <div 
                  class="st-preview st-glass-theme" 
                  :class="{ 'theme-active': activeTheme === 'glass' }"
                  @click="activeTheme = 'glass'"
                >
                  <div class="st-mini-bar"></div>
                  <div class="st-mini-art"></div>
                  <div class="st-mini-lines">
                    <div></div>
                    <div></div>
                  </div>
                  <span>GLASS</span>
                </div>

                <!-- Borderless Radio Theme -->
                <div 
                  class="st-preview st-radio-theme" 
                  :class="{ 'theme-active': activeTheme === 'radio' }"
                  @click="activeTheme = 'radio'"
                >
                  <div class="st-mini-bar"></div>
                  <div class="st-mini-art"></div>
                  <div class="st-mini-lines">
                    <div></div>
                    <div></div>
                  </div>
                  <span>RADIO</span>
                </div>
              </div>

              <!-- Interactive details for the selected theme -->
              <div class="theme-description-box mt-3 p-2 rounded border text-[9px] text-slate-400 leading-normal min-h-[44px]">
                <p v-if="activeTheme === 'dark'" class="animate-fade-in">
                  <strong class="text-cyan-400">Dark 主題</strong>：沉穩的深色風格，專為夜間極速賽道設計，低干擾高對比。
                </p>
                <p v-else-if="activeTheme === 'glass'" class="animate-fade-in">
                  <strong class="text-cyan-400">Liquid Glass</strong>：透光磨砂玻璃，動態透出遊戲畫面背景，極具科技感。
                </p>
                <p v-else-if="activeTheme === 'radio'" class="animate-fade-in">
                  <strong class="text-cyan-400">Radio 主題</strong>：極簡條狀無框收音機外觀，僅佔用最小遊戲視野。
                </p>
              </div>
            </article>

            <!-- Inert Clone 1 (Duplicate of Card 1 for looping) -->
            <article class="feature-card feature-card--1 flex-shrink-0 v2-clone" :style="getCardStyle(6)">
              <!-- Header -->
              <div class="v2-card-header flex items-center justify-between w-full">
                <div class="v2-header-left flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
                  <!-- Equalizer animated icon -->
                  <div class="v2-eq-mini flex items-end gap-0.5 h-3">
                    <span class="v2-eq-bar-mini" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                    <span class="v2-eq-bar-mini" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                    <span class="v2-eq-bar-mini" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                  </div>
                  <span>GMO</span>
                </div>
                
                <!-- Right Group (Badge + Three dots) -->
                <div class="v2-header-right flex items-center gap-2">
                  <!-- Dynamic Brand Badge Pill -->
                  <div 
                    class="v2-brand-badge flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold transition-all duration-500"
                    :style="{ 
                      backgroundColor: v2ActivePlatform.bgSoft, 
                      border: `1px solid ${v2ActivePlatform.borderSoft}`, 
                      color: v2ActivePlatform.color 
                    }"
                  >
                    <!-- Brand Icon SVG -->
                    <span class="w-3 h-3 flex items-center justify-center">
                      <svg v-if="v2ActivePlatform.id === 'youtube'" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                        <circle cx="12" cy="12" r="10" fill="currentColor"/>
                        <polygon points="10,8 16,12 10,16" fill="#000"/>
                      </svg>
                      <svg v-else-if="v2ActivePlatform.id === 'spotify'" viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
                        <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.565.387-.86.207-2.377-1.454-5.37-1.783-8.893-1.02-.336.073-.668-.138-.74-.474-.072-.336.137-.668.473-.74 3.856-.88 7.15-.506 9.814 1.128.295.18.387.566.207.86zm1.224-2.72c-.226.367-.707.487-1.074.26-2.72-1.672-6.87-2.157-10.077-1.182-.413.125-.847-.107-.972-.52-.125-.413.108-.847.52-.972 3.67-1.114 8.24-.57 11.34 1.34.367.228.487.708.26 1.075zm.106-2.833c-.273.443-.85.584-1.293.31-3.18-1.89-8.42-2.107-11.442-1.19-.502.15-1.03-.135-1.18-.636-.15-.502.135-1.03.636-1.18 3.6-1.093 9.4-0.84 13.01 1.302.44.272.58.85.31 1.294z"/>
                      </svg>
                      <svg v-else-if="v2ActivePlatform.id === 'kkbox'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
                        <path d="M9 18V5l12-2v13" />
                        <circle cx="6" cy="18" r="3" fill="currentColor" stroke="none" />
                        <circle cx="18" cy="16" r="3" fill="currentColor" stroke="none" />
                      </svg>
                    </span>
                    <span>{{ v2ActivePlatform.name }}</span>
                  </div>
                  
                  <!-- Three dots vertical icon -->
                  <div class="text-slate-500 hover:text-slate-300 cursor-pointer text-sm font-bold">
                    ⋮
                  </div>
                </div>
              </div>

              <!-- Album Art with Dynamic Glow -->
              <div class="v2-album-container my-2 flex justify-center relative">
                <div 
                  class="v2-album-glow absolute inset-0 blur-2xl opacity-60 rounded-full transition-all duration-500 scale-90"
                  :style="{ backgroundColor: v2ActivePlatform.color }"
                ></div>
                <img 
                  class="v2-album-art w-[150px] h-[150px] rounded-2xl object-cover relative z-10 border border-white/10 transition-transform duration-500 hover:scale-105"
                  src="/overview/album-art.png" 
                  alt="Album Art" 
                />
              </div>

              <!-- Song Info (HOT / LE SSERAFIM) + Heart -->
              <div class="v2-song-info flex items-center justify-between w-full px-2">
                <div class="w-5"></div> <!-- Left spacer -->
                
                <div class="v2-song-details text-center">
                  <div class="text-base font-bold text-white tracking-wide">HOT</div>
                  <div class="text-[11px] text-slate-400 font-medium mt-0.5">LE SSERAFIM</div>
                </div>
                
                <!-- Heart Button with dynamic brand color -->
                <button class="v2-heart-btn focus:outline-none transition-colors duration-300">
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    stroke-width="2.5" 
                    class="w-5 h-5 transition-all duration-500"
                    :style="{ color: v2ActivePlatform.color, filter: `drop-shadow(0 0 4px ${v2ActivePlatform.glow})` }"
                  >
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <!-- Progress Bar -->
              <div class="v2-progress-section w-full px-1 mt-2">
                <div class="v2-progress-bar-container relative h-1 bg-white/10 rounded-full cursor-pointer">
                  <div 
                    class="v2-progress-fill h-full rounded-full transition-all duration-300 relative" 
                    :style="{ width: v2Progress + '%', backgroundColor: v2ActivePlatform.color }"
                  >
                    <span 
                      class="v2-progress-handle absolute -right-1.5 -top-1.5 w-4 h-4 rounded-full bg-white transition-all duration-500"
                      :style="{ boxShadow: `0 0 8px ${v2ActivePlatform.color}` }"
                    ></span>
                  </div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5 font-mono">
                  <span>{{ v2ProgressTime }}</span>
                  <span>3:13</span>
                </div>
              </div>

              <!-- Controls Panel -->
              <div class="v2-controls-panel flex items-center justify-between w-full bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-1.5 mt-1">
                <!-- Shuffle -->
                <button class="v2-ctrl-btn text-slate-500 hover:text-slate-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
                </button>
                <!-- Prev -->
                <button class="v2-ctrl-btn text-slate-300 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="19,20 9,12 19,4"></polygon><rect x="5" y="4" width="2" height="16"></rect></svg>
                </button>
                <!-- Play/Pause -->
                <button 
                  class="v2-play-btn w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500 text-white"
                  :style="{ 
                    borderColor: v2ActivePlatform.color, 
                    boxShadow: `0 0 10px ${v2ActivePlatform.glow}`,
                    backgroundColor: `${v2ActivePlatform.color}15`
                  }"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4">
                    <rect x="6" y="4" width="4" height="16" rx="1"></rect>
                    <rect x="14" y="4" width="4" height="16" rx="1"></rect>
                  </svg>
                </button>
                <!-- Next -->
                <button class="v2-ctrl-btn text-slate-300 hover:text-white transition-colors">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4"><polygon points="5,4 15,12 5,20"></polygon><rect x="17" y="4" width="2" height="16"></rect></svg>
                </button>
                <!-- Repeat -->
                <button class="v2-ctrl-btn text-slate-500 hover:text-slate-300 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
                </button>
              </div>

              <!-- Lyrics Box Container -->
              <div class="v2-lyrics-box w-full border border-white/[0.07] bg-black/15 rounded-xl p-3 mt-2 h-[66px] overflow-hidden relative flex flex-col justify-center">
                <div class="v2-lyrics-viewport transition-transform duration-500 ease-in-out" :style="{ transform: `translateY(${(1 - v2LyricIndex) * 20}px)` }">
                  <p 
                    v-for="(lyric, idx) in v2LyricsList" 
                    :key="idx"
                    class="h-5 leading-5 text-[10px] text-center transition-all duration-300"
                    :class="idx === v2LyricIndex ? 'font-bold scale-105' : 'text-slate-500 opacity-40'"
                    :style="idx === v2LyricIndex ? { color: v2ActivePlatform.color } : {}"
                  >
                    {{ lyric }}
                  </p>
                </div>
              </div>

              <!-- Indicators footer -->
              <div class="v2-card-footer flex justify-center gap-1.5 mt-2.5 w-full">
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span class="w-3.5 h-1.5 rounded-full transition-all duration-500" :style="{ backgroundColor: v2ActivePlatform.color }"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span class="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              </div>
            </article>

            <!-- Inert Clone 2 (Duplicate of Card 2 for looping) -->
            <article class="feature-card feature-card--2 flex-shrink-0 v2-clone" :style="getCardStyle(7)">
              <div class="volume-console" :class="`volume-console--${volumeTarget}`">
                <div class="volume-console-head">
                  <div class="volume-title-wrap">
                    <span class="volume-main-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                        <path d="M15 9.5a5 5 0 0 1 0 5" />
                        <path d="M18 7a9 9 0 0 1 0 10" />
                      </svg>
                    </span>
                    <div>
                      <h3>Volume</h3>
                      <p>App / System routing</p>
                    </div>
                  </div>
                  <div class="volume-window-controls" aria-hidden="true">
                    <span></span>
                    <span></span>
                  </div>
                </div>

                <div class="volume-segmented">
                  <button type="button" :class="{ 'is-active': volumeTarget === 'app' }" @click="volumeTarget = 'app'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                      <rect x="4" y="6" width="16" height="12" rx="2" />
                      <path d="M8 18h8" />
                    </svg>
                    調整網頁 (App)
                  </button>
                  <button type="button" :class="{ 'is-active': volumeTarget === 'system' }" @click="volumeTarget = 'system'">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                      <rect x="5" y="4" width="14" height="11" rx="1.8" />
                      <path d="M9 20h6M12 15v5" />
                    </svg>
                    調整系統 (System)
                  </button>
                </div>

                <div class="volume-card-stack">
                  <div class="volume-control-card" :class="{ 'is-active': volumeTarget === 'app' }">
                    <span class="volume-card-tag">網頁 (App) 音量</span>
                    <div class="volume-card-body">
                      <span class="volume-card-icon volume-card-icon--app">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M3 12h18M12 3c2.3 2.5 3.5 5.5 3.5 9s-1.2 6.5-3.5 9M12 3c-2.3 2.5-3.5 5.5-3.5 9s1.2 6.5 3.5 9" />
                        </svg>
                      </span>
                      <div class="volume-card-main">
                        <strong>{{ v2VolumeApp }}%</strong>
                        <div class="scene-mixer-track" @pointerdown="beginVolumePointer($event, 'app')">
                          <div class="scene-mixer-fill" :style="{ width: v2VolumeApp + '%' }"></div>
                        </div>
                        <p>調整瀏覽器與網站的音量</p>
                      </div>
                    </div>
                  </div>

                  <div class="volume-control-card" :class="{ 'is-active': volumeTarget === 'system' }">
                    <span class="volume-card-tag volume-card-tag--system">系統 (System) 音量</span>
                    <div class="volume-card-body">
                      <span class="volume-card-icon volume-card-icon--system">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                          <rect x="5" y="5" width="14" height="10" rx="1.5" />
                          <path d="M8 20h8M12 15v5" />
                        </svg>
                      </span>
                      <div class="volume-card-main">
                        <strong>{{ v2VolumeSys }}%</strong>
                        <div class="scene-mixer-track" @pointerdown="beginVolumePointer($event, 'system')">
                          <div class="scene-mixer-fill scene-mixer-fill--sys" :style="{ width: v2VolumeSys + '%' }"></div>
                        </div>
                        <p>調整電腦與其他應用程式的音量</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="volume-master-row">
                  <div class="volume-master-copy">
                    <span class="volume-master-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1">
                        <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                        <path d="m19 9-4 6M15 9l4 6" />
                      </svg>
                    </span>
                    <div>
                      <small>總音量輸出</small>
                      <div class="volume-master-track">
                        <span style="width: 60%"></span>
                      </div>
                    </div>
                  </div>
                  <strong>60%</strong>
                  <button class="volume-mute-button" type="button">靜音</button>
                </div>
              </div>
            </article>

          </div>
        </div>
      </div>
    </section>

    <!-- QUICK GUIDE & INSTALL SECTION -->
    <section class="install install-lab py-16">
      <div class="wrap install-grid">
        <!-- QUICK GUIDE CAROUSEL -->
        <div class="install-column install-column--usage">
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
                  <div class="demo-panel guide-source-demo mt-4" :class="`is-${guideServiceKey}`">
                    <div class="guide-source-hud">
                      <div class="guide-source-top">
                        <span class="source-status-dot" />
                        <strong>{{ selectedService }}</strong>
                        <span class="source-clock">0:18 / 4:31</span>
                      </div>
                      <div class="guide-source-main">
                        <img src="/downloads/forza-music-overlay/iu-love-wins-all.png" alt="Love wins all 專輯封面">
                        <div>
                          <h4>Love wins all</h4>
                          <p>IU</p>
                        </div>
                      </div>
                      <div class="guide-source-progress">
                        <span />
                      </div>
                    </div>
                    <p class="guide-demo-caption">
                      {{ selectedService === 'Apple Music' ? 'Apple Music 使用黑白低彩度 HUD。' : `${selectedService} 會套用對應色彩與發光狀態。` }}
                    </p>
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
                  <div class="demo-panel guide-volume-demo mt-4">
                    <div class="volume-window">
                      <div class="volume-window-head">
                        <span class="volume-head-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
                            <path d="M11 5 6 9H3v6h3l5 4V5Z" />
                            <path d="M15 9.5a5 5 0 0 1 0 5" />
                          </svg>
                        </span>
                        <div>
                          <strong>音量控制</strong>
                          <p>分別調整網頁應用程式與系統音量</p>
                        </div>
                      </div>
                      <div class="volume-tabs" role="group" aria-label="音量控制目標">
                        <button type="button" :class="{ 'is-selected': volumeTarget === 'app' }" @click="volumeTarget = 'app'">網頁 App</button>
                        <button type="button" :class="{ 'is-selected': volumeTarget === 'system' }" @click="volumeTarget = 'system'">系統 System</button>
                      </div>
                      <div class="volume-control-row" :class="{ 'is-active': volumeTarget === 'app' }">
                        <span class="volume-round">App</span>
                        <div>
                          <strong>網頁音量 {{ v2VolumeApp }}%</strong>
                          <div class="volume-line" @pointerdown="beginVolumePointer($event, 'app')"><span :style="{ width: `${v2VolumeApp}%` }" /></div>
                          <small>只調整目前音樂網頁或 App。</small>
                        </div>
                      </div>
                      <div class="volume-control-row" :class="{ 'is-active': volumeTarget === 'system' }">
                        <span class="volume-round muted">PC</span>
                        <div>
                          <strong>系統音量 {{ v2VolumeSys }}%</strong>
                          <div class="volume-line is-system" @pointerdown="beginVolumePointer($event, 'system')"><span :style="{ width: `${v2VolumeSys}%` }" /></div>
                          <small>調整 Windows 主音量輸出。</small>
                        </div>
                      </div>
                      <label class="volume-lyric-toggle">
                        <input type="checkbox" v-model="lyricsOn">
                        <span>懸浮播放器顯示動態歌詞</span>
                      </label>
                    </div>
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
                  <div class="demo-panel guide-resize-demo mt-4">
                    <div class="resize-toolbar">
                      <span>播放器尺寸</span>
                      <strong>{{ playerScale }}%</strong>
                    </div>
                    <input class="demo-range guide-range" type="range" min="60" max="100" v-model.number="playerScale" />
                    <div class="resize-stage">
                      <div
                        class="resize-player"
                        :style="{ width: `${Math.round(320 * playerScale / 100)}px`, height: `${Math.round(104 * playerScale / 100)}px` }"
                      >
                        <img src="/downloads/forza-music-overlay/iu-love-wins-all.png" alt="播放器專輯封面">
                        <div>
                          <small>{{ selectedService }}</small>
                          <strong>Love wins all</strong>
                          <span>IU</span>
                          <div class="resize-player-progress"><i /></div>
                        </div>
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
                  <div class="demo-panel guide-position-demo mt-4">
                    <div class="position-toolbar">
                      <span>拖曳模式</span>
                      <strong>Ctrl + Alt + P</strong>
                    </div>
                    <div class="position-stage">
                      <span class="game-road" />
                      <div
                        class="position-player"
                        :style="{ left: `${dragPosition.x}px`, top: `${dragPosition.y}px` }"
                        @pointerdown="onDragStart"
                        @pointermove="onDragMove"
                        @pointerup="onDragEnd"
                        @pointercancel="onDragEnd"
                      >
                        <img src="/downloads/forza-music-overlay/iu-love-wins-all.png" alt="拖曳播放器封面">
                        <div>
                          <strong>Love wins all</strong>
                          <span>拖曳我</span>
                        </div>
                      </div>
                    </div>
                    <p class="guide-demo-caption">{{ dragFeedback }}</p>
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
                  <div class="demo-panel guide-play-demo mt-4">
                    <div class="hotkey-hud" :class="{ 'is-playing': isPlaying }">
                      <div class="hotkey-combo"><span>L3</span><b>+</b><span>A</span></div>
                      <div>
                        <small>Gamepad / Keyboard</small>
                        <strong>{{ isPlaying ? '播放中' : '已暫停' }}</strong>
                        <p>Love wins all · IU</p>
                      </div>
                      <button type="button" @click="togglePlay">{{ isPlaying ? 'Ⅱ' : '▶' }}</button>
                    </div>
                    <p class="guide-demo-caption">{{ playFeedback }} · Ctrl + Alt + Space</p>
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
                  <div class="demo-panel guide-track-demo mt-4">
                    <div class="track-switcher">
                      <button type="button" @click="prevTrack">上一首</button>
                      <div>
                        <small>目前播放</small>
                        <strong>{{ tracks[trackIndex] }}</strong>
                        <div class="track-timeline"><span :style="{ width: `${28 + trackIndex * 18}%` }" /></div>
                      </div>
                      <button type="button" @click="nextTrack">下一首</button>
                    </div>
                    <p class="guide-demo-caption">{{ trackFeedback }} · L3 + D-Pad 左/右</p>
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
                  <div class="demo-panel guide-volume-hud-demo mt-4">
                    <div class="ingame-volume-hud">
                      <div class="volume-hud-top">
                        <strong>{{ volumeTarget === 'app' ? '網頁 App 音量' : 'Windows 系統音量' }}</strong>
                        <span>{{ currentVolume }}%</span>
                      </div>
                      <div class="volume-hud-line"><span :style="{ width: `${currentVolume}%` }" /></div>
                      <div class="volume-hud-actions">
                        <button type="button" @click="volumeDown">D-Pad 下</button>
                        <button type="button" @click="volumeUp">D-Pad 上</button>
                      </div>
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
                  <div class="demo-panel guide-visibility-demo mt-4">
                    <div class="visibility-stage" :class="{ 'is-hidden': isOverlayHidden }">
                      <div class="visibility-player">
                        <img src="/downloads/forza-music-overlay/iu-love-wins-all.png" alt="顯示隱藏播放器封面">
                        <strong>Love wins all</strong>
                      </div>
                      <button type="button" @click="toggleOverlayVisibility">{{ isOverlayHidden ? '顯示播放器' : '隱藏播放器' }}</button>
                    </div>
                    <p class="guide-demo-caption">{{ overlayFeedback }}</p>
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
                  <div class="demo-panel guide-tray-demo mt-4">
                    <div class="tray-desktop" :class="{ 'is-minimized': consoleMinimized }">
                      <div class="tray-window">
                        <span>GMO 控制台</span>
                        <button type="button" @click="minimizeConsole">_</button>
                      </div>
                      <div class="tray-bar">
                        <button type="button" @click="restoreConsole">GMO</button>
                        <span>系統匣</span>
                      </div>
                    </div>
                    <p class="guide-demo-caption">{{ consoleFeedback }}</p>
                  </div>
                </div>
              </article>
            </template>
          </GuideCarousel>
        </div>

        <!-- INSTALL FLOW CAROUSEL -->
        <div class="install-column install-column--setup">
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
            :slidesCount="5"
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
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 1 · HERO DOWNLOAD</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">回到主視覺下載檔案</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">下載點在本站最上方主視覺區。點擊下方模擬按鈕會滑回主視覺下載鈕，對應實際使用路徑。</p>
                  <div class="demo-panel install-browser-demo install-hero-download-demo mt-4">
                    <div class="browser-chrome">
                      <span />
                      <span />
                      <span />
                      <p>https://scott0127.github.io/forza-music-overlay/</p>
                    </div>
                    <div class="download-page hero-download-page">
                      <div class="hero-download-mini">
                        <small>MAIN VISUAL DOWNLOAD</small>
                        <strong>GamingMusicOverlay</strong>
                        <button class="hero-download-hotspot" type="button" @click="jumpToHeroDownload">
                          <span class="click-ripple" />
                          點擊主視覺下載
                        </button>
                      </div>
                      <div class="download-shelf" :class="{ 'is-ready': downloadReady }">
                        <span class="file-pill">RAR</span>
                        <div>
                          <strong>GamingMusicOverlay-release3.5.0_nuitka-standalone-safe.rar</strong>
                          <small>{{ downloadReady ? '已回到主視覺下載點' : '等待點擊主視覺下載' }}</small>
                        </div>
                      </div>
                    </div>
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
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 2 · OPTIONAL DONATION</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">自由捐助開發</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">下載後可自由支持開發；這一步不會阻擋下載，也不影響工具使用。</p>
                  <div class="demo-panel install-donate-demo mt-4">
                    <div class="donate-card">
                      <img class="donate-qr-img" src="/downloads/forza-music-overlay/bmc_qr.png" alt="Buy Me a Coffee 贊助 QR Code">
                      <div>
                        <strong>一杯咖啡，讓免費工具繼續更新</strong>
                      </div>
                      <button type="button" @click="handleDonationViewed">{{ donationViewed ? '已略過/已查看' : '自由選擇' }}</button>
                    </div>
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
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 3 · OPEN ARCHIVE</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">打開壓縮檔查看內容</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">先打開壓縮檔確認裡面有 EXE、資源資料夾與批次檔；不要直接在壓縮檔內執行 EXE。</p>
                  <div class="demo-panel install-explorer-demo install-folder-demo mt-4">
                    <div class="win-explorer" :class="{ 'is-opened': zipOpened }">
                      <div class="win-tabbar">
                        <span class="folder-tab">GamingMusicOverlay-release4.0.0</span>
                        <button type="button" @click="handleZipOpen">{{ zipOpened ? '已開啟壓縮檔' : '打開 RAR' }}</button>
                      </div>
                      <div class="win-address">
                        <span>下載</span>
                        <b>›</b>
                        <span>GamingMusicOverlay-release4.0.0_nuitka-standalone-safe</span>
                      </div>
                      <div class="win-body">
                        <aside>
                          <span>桌面</span>
                          <span class="is-selected">下載</span>
                          <span>文件</span>
                        </aside>
                        <div class="win-table">
                          <div class="win-row win-head"><span>名稱</span><span>類型</span><span>大小</span></div>
                          <div class="win-row"><span><i class="folder-dot" />AppFiles</span><span>檔案資料夾</span><span>-</span></div>
                          <div class="win-row is-focused"><span><i class="exe-dot" />GamingMusicOverlay</span><span>應用程式</span><span>114 KB</span></div>
                          <div class="win-row"><span><i class="doc-dot" />README</span><span>Markdown</span><span>11 KB</span></div>
                        </div>
                      </div>
                    </div>
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
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 4 · COPY TO FOLDER</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">複製到普通資料夾</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">把壓縮檔內全部內容拖到一般資料夾，例如文件或桌面資料夾，避免在壓縮檔環境中執行。</p>
                  <div class="demo-panel install-copy-demo mt-4">
                    <div class="copy-flow copy-drag-demo" :class="{ 'is-copied': filesCopied }">
                      <div class="folder-card folder-card-a">
                        <small>A · 壓縮檔內</small>
                        <strong>AppFiles</strong>
                        <strong>GamingMusicOverlay.exe</strong>
                      </div>
                      <button class="copy-drag-object" type="button" @click="handleCopyFiles">
                        <span class="folder-mini">A</span>
                        {{ filesCopied ? '已拖曳複製' : '拖曳到 B' }}
                      </button>
                      <div class="folder-card folder-card-b">
                        <small>B · 普通資料夾</small>
                        <strong>{{ filesCopied ? 'AppFiles' : '等待拖入' }}</strong>
                        <strong>{{ filesCopied ? 'GamingMusicOverlay.exe' : 'C:/GMO' }}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <!-- STEP 5 -->
              <article class="carousel-slide install-card" :class="{ 'is-active': currentIndex === 4 }">
                <div class="install-icon">
                  <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3">
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                </div>
                <div>
                  <p class="step-label text-cyan-750 text-xs font-bold uppercase">STEP 5 · RUN EXE</p>
                  <h3 class="text-slate-900 font-black text-lg mt-2">打開 EXE 啟動控制台</h3>
                  <p class="guide-copy text-slate-600 text-sm mt-2">在普通資料夾中雙擊 <span class="text-cyan-700 font-bold">ForzaMusicOverlay.exe</span>。啟動後選擇音樂來源，播放器就會出現在遊戲上方。</p>
                  <div class="demo-panel install-launch-demo mt-4">
                    <div class="app-launch-window exe-launch-demo" :class="{ 'is-running': simulatedLaunch }">
                      <div class="window-title">
                        <span>C:/Users/scott/Documents/GMO</span>
                        <button type="button" @click="handleLaunch">{{ simulatedLaunch ? '已啟動' : '模擬雙擊' }}</button>
                      </div>
                      <div class="window-body exe-directory">
                        <button class="exe-row" type="button" @click="handleLaunch">
                          <span class="app-logo-mini">EXE</span>
                          <div>
                            <strong>GamingMusicOverlay.exe</strong>
                            <p>應用程式 · 點擊後開啟控制台</p>
                          </div>
                          <span class="click-cursor" />
                        </button>
                        <div class="launch-toast">
                          <strong>{{ simulatedLaunch ? '控制台已就緒' : '等待啟動' }}</strong>
                          <p>{{ simulatedLaunch ? '選擇音樂來源後就能在遊戲內操作。' : '雙擊 EXE 會載入控制台與懸浮播放器。' }}</p>
                        </div>
                      </div>
                    </div>
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
          <span class="text-slate-400 text-sm">最新版本: v4.1.0</span>
        </div>

        <div class="update-list border-t border-b border-slate-800">
          <!-- UPDATE V4.1.0 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 hover:bg-slate-900/10 hover:translate-x-1 transition-all duration-200">
            <div>
              <p class="update-version text-cyan-300 font-black text-sm">v4.1.0</p>
              <p class="update-date text-slate-500 text-sm mt-2">2026-06-16</p>
            </div>
            <div>
              <h3 class="text-white font-black text-xl">KKBOX 支援與字體/效能優化</h3>
              <div class="entry-actions flex items-center gap-3 flex-wrap mt-3">
                <a
                  class="button primary cursor-pointer"
                  :href="googleDriveDownloadUrl"
                  @click="handleDownloadClick($event, googleDriveDownloadUrl)"
                >
                  下載 v4.1.0
                </a>
                <p class="entry-file text-slate-500 text-sm">GamingMusicOverlay-release4.1.0_portable-test.zip</p>
              </div>
              <ul class="notes text-slate-300 text-sm list-none pl-0 mt-4 space-y-2">
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 更新KKBOX支援：現在支援讀取 KKBOX 播放狀態與歌曲資訊。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 更新字體大小調整：提供字體大小自訂功能，滿足不同螢幕需求。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> UI優化與效能最佳化：改善介面流暢度並減少系統資源佔用。</li>
              </ul>
            </div>
          </article>

          <!-- UPDATE V3.5.0 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 border-t border-slate-800">
            <div>
              <p class="update-version text-cyan-300 font-black text-sm">v3.5.0</p>
              <p class="update-date text-slate-500 text-sm mt-2">2026-06-08</p>
            </div>
            <div>
              <h3 class="text-white font-black text-xl">Nuitka Standalone Safe 穩定版本</h3>
              <div class="entry-actions flex items-center gap-3 flex-wrap mt-3">
                <a
                  class="button primary cursor-pointer"
                  :href="googleDriveDownloadUrl"
                  @click="handleDownloadClick($event, googleDriveDownloadUrl)"
                >
                  下載 v3.5.0
                </a>
                <p class="entry-file text-slate-500 text-sm">GamingMusicOverlay-release3.5.0_nuitka-standalone-safe.rar</p>
              </div>
              <ul class="notes text-slate-300 text-sm list-none pl-0 mt-4 space-y-2">
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> 穩定載點更新為 Nuitka standalone safe RAR 版本。</li>
                <li class="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-150"><span class="text-cyan-400 font-black">✓</span> SHA256: 941c3e8b67225ed2f5ad4c77e33ebc91d0f6b88f811733f06d61e3e71254cc85</li>
              </ul>
            </div>
          </article>

          <!-- UPDATE V3.1.0 -->
          <article class="update grid grid-cols-[180px_1fr] gap-6 py-7 border-t border-slate-800 hover:bg-slate-900/10 hover:translate-x-1 transition-all duration-200">
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
