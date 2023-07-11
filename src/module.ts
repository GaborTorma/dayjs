import { defineNuxtModule, addPlugin, addImports, createResolver, addTemplate } from '@nuxt/kit'

export interface RelativeTimeOptions {
  future: string,
  past: string,
  s: string,
  m: string,
  mm: string,
  h: string,
  hh: string,
  d: string,
  dd: string,
  M: string,
  MM: string,
  y: string,
  yy: string,
}

interface LocaleConfig {
  /**
   * The starting day of a week, 1 for Monday / 7 for Sunday
   */
  weekStart?: number
  /**
   * Ability to configure relatvieTime with updateLocale
   * https://day.js.org/docs/en/customization/relative-time
   */
  relativeTime?: RelativeTimeOptions
}

// Module options TypeScript interface definition
export interface ModuleOptions {
  /**
   * An array of optional locales to load
   * @example ['en', 'fr']
   */

  locales?: string[]

  /**
   * The default locale to use
   */
  defaultLocale?: string | [string, LocaleConfig]


  /**
   * The default timezone to use
   */
  defaultTimezone?: string

  /**
   * An array of optional plugins to load
   * @example ['timezone', 'utc']
   */

  plugins?: string[]
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'dayjs',
    configKey: 'dayjs',
    compatibility: {
      nuxt: '^3'
    }
  },
  // Default configuration options of the Nuxt module
  defaults: {
    locales: [],
    plugins: ['updateLocale', 'utc'],
    defaultLocale: undefined,
    defaultTimezone: undefined,
  },
  setup (options, nuxt) {

    const resolver = createResolver(import.meta.url)
    options.plugins = [...new Set(options.plugins)]

    if (options.defaultTimezone && !options.plugins.includes('timezone'))
      throw new Error('You must include the timezone plugin in order to set a default timezone')

    addPlugin(resolver.resolve('./runtime/plugin'))
    addImports({
      name: 'useDayjs',
      as: 'useDayjs',
      from: resolver.resolve('./runtime/composables/dayjs')
    })
    addTemplate({
      filename: 'dayjs.imports.mjs',
      getContents: () => generateImports(options),
    })

    // Add dayjs plugin types
    nuxt.hook('prepare:types', ({ references }) => {
      if (options.plugins) {
        const plugins = options.plugins.map((p) => ({ types: `dayjs/plugin/${p}` }))
        references.push(...plugins)
      }
    })
  }
})

const generateImports = ({ locales, plugins, defaultLocale, defaultTimezone }: ModuleOptions) => `
// Generated by dayjs-nuxt-module
import dayjs from 'dayjs'
${locales?.map(locale => `import 'dayjs/locale/${locale}'`).join('\n')}
${plugins?.map(plugin => `import ${plugin} from 'dayjs/plugin/${plugin}'`).join('\n')}
${defaultLocale ?  "import updateLocale from 'dayjs/plugin/updateLocale'" : ''}

${plugins?.map(plugin => `dayjs.extend(${plugin})`).join('\n')}
${defaultLocale ?  "dayjs.extend(updateLocale)" : ''}
${locales?.map(locale =>  `dayjs.locale('${locale}')`).join('\n')}
${defaultTimezone ? `dayjs.tz.setDefault('${defaultTimezone}')` : ''}

${defaultLocale ? `
dayjs.updateLocale(${JSON.stringify(defaultLocale).replace(/^\(|\)$|^\[|\]$/g, '')})` : ""}

export default dayjs
`
