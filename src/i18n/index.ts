import type { McpServicesTranslations, SupportedLang, TranslationStructure } from './types'
import { en, enMcpServices } from './locales/en'
import { zhCN, zhCNMcpServices } from './locales/zh-CN'

export * from './types'

// Main i18n structure
export const I18N: Record<SupportedLang, TranslationStructure> = {
  'zh-CN': zhCN,
  'en': en,
}

export const mcpServiceTranslations: Record<SupportedLang, McpServicesTranslations> = {
  'zh-CN': zhCNMcpServices,
  'en': enMcpServices,
}

export function getTranslation(lang: SupportedLang): TranslationStructure {
  return I18N[lang]
}

export function getMcpServiceTranslation(lang: SupportedLang): McpServicesTranslations {
  return mcpServiceTranslations[lang]
}
