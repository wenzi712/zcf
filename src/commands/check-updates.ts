import type { SupportedLang } from '../constants'
import process from 'node:process'
import ansis from 'ansis'
import { checkAndUpdateTools } from '../utils/auto-updater'
import { selectScriptLanguage } from '../utils/prompts'

export interface CheckUpdatesOptions {
  lang?: SupportedLang
}

export async function checkUpdates(options: CheckUpdatesOptions = {}): Promise<void> {
  // Select language first
  const scriptLang = options.lang || await selectScriptLanguage()

  try {
    await checkAndUpdateTools(scriptLang)
  }
  catch (error) {
    console.error(ansis.red('Error checking updates:'), error)
    process.exit(1)
  }
}
