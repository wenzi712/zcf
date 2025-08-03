import { exec } from 'tinyexec'
import { commandExists } from './platform'
import type { SupportedLang } from '../constants'
import { I18N } from '../constants'

export async function isClaudeCodeInstalled(): Promise<boolean> {
  return await commandExists('claude')
}

export async function installClaudeCode(lang: SupportedLang): Promise<void> {
  const i18n = I18N[lang]
  console.log(i18n.installing)
  
  try {
    // Check if npm is available
    if (!await commandExists('npm')) {
      throw new Error(i18n.npmNotFound)
    }
    
    // Always use npm for installation to ensure automatic updates work
    await exec('npm', ['install', '-g', '@anthropic-ai/claude-code'])
    console.log(`✔ ${i18n.installSuccess}`)
  } catch (error) {
    console.error(`✖ ${i18n.installFailed}`)
    throw error
  }
}