import prompts from '@posva/prompts';
import ansis from 'ansis';
import { existsSync } from 'node:fs';
import { version } from '../../package.json';
import type { SupportedLang } from '../constants';
import { I18N, LANG_LABELS, SETTINGS_FILE, SUPPORTED_LANGS } from '../constants';
import { displayBanner } from '../utils/banner';
import { readZcfConfig, updateZcfConfig } from '../utils/zcf-config';
import { updatePromptOnly } from './init';

export interface UpdateOptions {
  configLang?: SupportedLang;
}

export async function update(options: UpdateOptions = {}) {
  try {
    // Display banner
    displayBanner('Update configuration for Claude Code');

    // Read zcf config to get user's preferred language
    let zcfConfig = readZcfConfig();
    let scriptLang: SupportedLang;
    
    // If no zcf config, ask user to select script language (like init)
    if (!zcfConfig) {
      const langResponse = await prompts({
        type: 'select',
        name: 'lang',
        message: 'Select script language / 选择脚本语言',
        choices: SUPPORTED_LANGS.map((l) => ({
          title: LANG_LABELS[l],
          value: l,
        })),
      });

      if (!langResponse.lang) {
        console.log(ansis.yellow('Operation cancelled / 操作已取消'));
        process.exit(0);
      }

      scriptLang = langResponse.lang as SupportedLang;
      
      // Save the selected language preference
      updateZcfConfig({
        version,
        preferredLang: scriptLang,
      });
    } else {
      scriptLang = zcfConfig.preferredLang;
    }
    
    // Now use the selected script language for all messages
    const i18n = I18N[scriptLang];
    
    // Check if config exists
    if (!existsSync(SETTINGS_FILE)) {
      console.log(ansis.yellow(i18n.noExistingConfig));
      process.exit(1);
    }

    // Select config language if not provided
    let configLang = options.configLang as SupportedLang;
    if (!configLang) {
      // Display hint in user's preferred language
      console.log(ansis.dim(`  ${i18n.configLangHint['zh-CN']}`));
      console.log(ansis.dim(`  ${i18n.configLangHint['en']}\n`));
      
      const configResponse = await prompts({
        type: 'select',
        name: 'lang',
        message: i18n.updateConfigLangPrompt,
        choices: SUPPORTED_LANGS.map((l) => ({
          title: `${LANG_LABELS[l]} - ${i18n.configLangHint[l]}`,
          value: l,
        })),
      });

      if (!configResponse.lang) {
        console.log(ansis.yellow(i18n.cancelled));
        process.exit(0);
      }

      configLang = configResponse.lang as SupportedLang;
    }

    console.log(ansis.cyan(`\n${i18n.updatingPrompts}\n`));

    // Execute prompt-only update
    await updatePromptOnly(configLang, scriptLang);
    
    // Update zcf config with new version
    updateZcfConfig({
      version,
      preferredLang: scriptLang,
    });
  } catch (error) {
    const zcfConfig = readZcfConfig();
    const defaultLang = zcfConfig?.preferredLang || 'en';
    const errorMsg = I18N[defaultLang].error;
    console.error(ansis.red(`${errorMsg}:`), error);
    process.exit(1);
  }
}