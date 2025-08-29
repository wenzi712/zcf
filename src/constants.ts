import { homedir } from 'node:os'
import { join } from 'pathe'

// Import I18N structure
import { I18N as I18N_STRUCTURE } from './i18n'

export const CLAUDE_DIR = join(homedir(), '.claude')
export const SETTINGS_FILE = join(CLAUDE_DIR, 'settings.json')
export const CLAUDE_MD_FILE = join(CLAUDE_DIR, 'CLAUDE.md')
export const ClAUDE_CONFIG_FILE = join(homedir(), '.claude.json')
// Legacy config path (for backward compatibility)
export const LEGACY_ZCF_CONFIG_FILE = join(homedir(), '.zcf.json')
// New config path (unified under .claude directory)
export const ZCF_CONFIG_FILE = join(CLAUDE_DIR, '.zcf-config.json')

export const SUPPORTED_LANGS = ['zh-CN', 'en'] as const
export type SupportedLang = (typeof SUPPORTED_LANGS)[number]

export const LANG_LABELS = {
  'zh-CN': '简体中文',
  'en': 'English',
} as const

export const AI_OUTPUT_LANGUAGES = {
  'zh-CN': { label: '简体中文', directive: 'Always respond in Chinese-simplified' },
  'en': { label: 'English', directive: 'Always respond in English' },
  'custom': { label: 'Custom', directive: '' },
} as const

export type AiOutputLanguage = keyof typeof AI_OUTPUT_LANGUAGES
export const I18N = I18N_STRUCTURE

// MCP_SERVICES has been moved to src/config/mcp-services.ts for better separation of concerns
