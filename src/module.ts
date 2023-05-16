import { defineNuxtModule, addPlugin, addImports, createResolver, addTemplate } from '@nuxt/kit'

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
  defaultLocale?: string


  /**
   * The default timezone to use
   */
  defaultTimezone?: string

  /**
   * An array of optional plugins to load
   * @example ['relativeTime', 'utc']
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
    plugins: ['relativeTime', 'utc'],
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
      const plugins = options?.plugins.map((p) => ({ types: `dayjs/plugin/${p}` }))
      references.push(...plugins)
    })
  }
})

const generateImports = ({ locales, plugins, defaultLocale, defaultTimezone }: ModuleOptions) => `
// Generated by dayjs-nuxt-module
import dayjs from 'dayjs'
${locales?.map(locale => `import ${locale} from 'dayjs/locale/${locale}'`).join('\n')}
${plugins?.map(plugin => `import ${plugin} from 'dayjs/plugin/${plugin}'`).join('\n')}

${plugins?.map(plugin => `dayjs.extend(${plugin})`).join('\n')}
${defaultLocale ? `dayjs.locale('${defaultLocale}')` : ''}
${defaultTimezone ? `dayjs.tz.setDefault('${defaultTimezone}')` : ''}
export default dayjs
`
