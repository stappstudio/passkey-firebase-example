import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  ssr: false,
  target: "static",
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@intlify/nuxt3'
  ],
  intlify: {
    localeDir: "locales",
    vueI18n: {
      locale: "pt-BR",
      fallbackLocale: "en",
      availableLocales: ["pt-BR", "en"],
      sync: true,
    },
},
})
