<template>
  <span class="animated-gmo-logo" aria-hidden="true">
    <svg class="animated-gmo-logo__svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 280" focusable="false">
      <defs>
        <linearGradient id="animated-gmo-cream" x1="0" x2="1">
          <stop offset="0" stop-color="#f2ede5" />
          <stop offset=".62" stop-color="#d8b793" />
          <stop offset="1" stop-color="#fff8ec" />
        </linearGradient>
        <linearGradient id="animated-gmo-steel" x1="0" x2="1">
          <stop offset="0" stop-color="#18202c" />
          <stop offset=".52" stop-color="#5d6e82" />
          <stop offset="1" stop-color="#141a24" />
        </linearGradient>
        <linearGradient id="animated-gmo-rose" x1="0" x2="1">
          <stop offset="0" stop-color="#d7a9ab" stop-opacity="0" />
          <stop offset=".35" stop-color="#d7a9ab" />
          <stop offset="1" stop-color="#d7a9ab" stop-opacity="0" />
        </linearGradient>
        <linearGradient id="animated-gmo-scan" x1="0" x2="1">
          <stop offset="0" stop-color="#67e8f9" stop-opacity="0" />
          <stop offset=".5" stop-color="#ffffff" stop-opacity=".9" />
          <stop offset="1" stop-color="#c084fc" stop-opacity="0" />
        </linearGradient>
        <filter id="animated-gmo-glow" x="-25%" y="-50%" width="150%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g class="animated-gmo-logo__mark" fill="none" fill-rule="evenodd">
        <g class="animated-gmo-logo__outline" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 29 257 80l-15 31L28 63z" />
          <path d="M0 45 296 111l-14 33L0 78z" />
          <path d="m0 208 258-58 24 28L0 246z" />
          <path d="m254 113 266 58-1 17-267 28z" />
          <path d="M94 142h316" />
        </g>
        <g class="animated-gmo-logo__particles" fill="#67e8f9">
          <circle cx="72" cy="120" r="3" />
          <circle cx="182" cy="96" r="2.5" />
          <circle cx="322" cy="105" r="2" />
          <circle cx="438" cy="128" r="2.7" />
          <circle cx="384" cy="222" r="2.2" />
        </g>
        <g class="animated-gmo-logo__steel animated-gmo-logo__steel--top">
          <path fill="url(#animated-gmo-steel)" d="M20 29 257 80l-15 31L28 63z" />
        </g>
        <g class="animated-gmo-logo__cream animated-gmo-logo__cream--top">
          <path fill="url(#animated-gmo-cream)" d="M0 45 296 111l-14 33L0 78z" />
        </g>
        <g class="animated-gmo-logo__steel animated-gmo-logo__steel--bottom">
          <path fill="url(#animated-gmo-steel)" d="m0 208 258-58 24 28L0 246z" />
          <path fill="url(#animated-gmo-steel)" d="m103 228 208-47 17 21-225 57z" opacity=".72" />
        </g>
        <g class="animated-gmo-logo__beam">
          <path fill="url(#animated-gmo-cream)" d="m254 113 266 58-1 17-267 28z" />
          <path fill="#f2ede5" d="m247 158 223 25-221 8z" opacity=".88" />
        </g>
        <g class="animated-gmo-logo__rose">
          <path fill="url(#animated-gmo-rose)" d="m351 119 100 12-87 8z" />
          <path fill="url(#animated-gmo-rose)" d="m361 222 90-17-75 27z" />
          <path fill="#d7a9ab" d="m430 98 58 5-52 7z" opacity=".9" />
        </g>
        <g class="animated-gmo-logo__bars" fill="#f2ede5" filter="url(#animated-gmo-glow)">
          <path d="M94 142h5v12h-5z" />
          <path d="M119 136h5v24h-5z" />
          <path d="M145 144h5v9h-5z" />
          <path d="M171 131h5v34h-5z" />
          <path d="M197 141h5v15h-5z" />
          <path d="M223 128h5v39h-5z" />
          <path d="M249 137h5v24h-5z" />
          <path d="M275 124h5v48h-5z" />
          <path d="M301 137h5v24h-5z" />
          <path d="M327 130h5v36h-5z" />
          <path d="M353 141h5v15h-5z" />
          <path d="M379 135h5v27h-5z" />
          <path d="M405 143h5v11h-5z" />
        </g>
        <path class="animated-gmo-logo__scan" fill="url(#animated-gmo-scan)" d="m-90 98 116 25-7 28-116-25z" />
      </g>
    </svg>
  </span>
</template>
