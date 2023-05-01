import dayjs from 'dayjs/esm/index.js'
import '#build/dayjs.imports.mjs'
import { defineNuxtPlugin } from '#app'

declare module '#app' {
  interface NuxtApp {
    $dayjs: typeof dayjs
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $dayjs: typeof dayjs
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $dayjs: typeof dayjs
  }
}

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.provide('dayjs', dayjs)
})

// https://api.github.com/repos/iamkun/dayjs/contents/src/locale
