// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NUXT_DEVTOOLS === 'true' },
  modules: ['@nuxtjs/tailwindcss'],
  css: [
    '~/assets/css/main.css',
    '~/assets/css/signal-handoff.css',
    '~/assets/css/hero-actions-motion.css',
    '~/assets/css/title-interaction.css',
    '~/assets/css/support-energy-motion.css',
    '~/assets/css/sponsor-goal-motion.css'
  ],
  app: {
    baseURL: '/forza-music-overlay/',
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/forza-music-overlay/brand/gmo-favicon.svg' }
      ]
    }
  }
})
