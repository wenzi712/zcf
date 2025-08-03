import { exec } from 'tinyexec';
import type { SupportedLang } from '../constants';
import { I18N } from '../constants';
import { commandExists, getPlatform } from './platform';

export async function isClaudeCodeInstalled(): Promise<boolean> {
  return await commandExists('claude');
}

export async function installClaudeCode(lang: SupportedLang): Promise<void> {
  const i18n = I18N[lang];
  console.log(i18n.installing);

  try {
    // Check if npm is available
    if (!(await commandExists('npm'))) {
      throw new Error(i18n.npmNotFound);
    }

    // Always use npm for installation to ensure automatic updates work
    await exec('npm', ['install', '-g', '@anthropic-ai/claude-code']);

    // Verify installation after a short delay (especially for Windows)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (await isClaudeCodeInstalled()) {
      console.log(`✔ ${i18n.installSuccess}`);
    } else {
      // On Windows, PATH might not be refreshed yet
      if (getPlatform() === 'windows') {
        console.log(`✔ ${i18n.installSuccess}`);
        console.log(`\n⚠ ${i18n.windowsRestartHint}`);
      } else {
        console.log(`✔ ${i18n.installSuccess}`);
      }
    }
  } catch (error) {
    console.error(`✖ ${i18n.installFailed}`);
    throw error;
  }
}
