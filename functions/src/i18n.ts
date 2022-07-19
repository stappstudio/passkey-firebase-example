import { I18n } from 'i18n'
import { join } from 'path'

// Workaround alert
//
// Those files must be .json, as required by i18n library, they can't be .js
// We MUST import/require this .json files, because without this import
//    the TypeScript compiler will NOT copy those files correctly to the dist/ folder.
//    Source: https://stackoverflow.com/a/59419449
// However, we don't have a use for the imports, so TS will throw an "is declared but its value is never read" error.
// So, the only option we have is to suppress those errors and import the files nevertheless.

// @ts-ignore
import * as en from './locales/en.json';
// @ts-ignore
import * as br from './locales/pt-BR.json';

const i18n = new I18n({
  locales: ['en', 'pt-BR'],
  directory: join(__dirname, 'locales')
})

export { i18n }