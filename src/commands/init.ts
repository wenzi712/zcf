import inquirer from 'inquirer';
import ansis from 'ansis';
import { existsSync } from 'node:fs';
import { version } from '../../package.json';
import type { AiOutputLanguage, SupportedLang } from '../constants';
import { CLAUDE_DIR, I18N, LANG_LABELS, MCP_SERVICES, SETTINGS_FILE, SUPPORTED_LANGS } from '../constants';
import type { McpServerConfig } from '../types';
import { configureAiPersonality } from '../utils/ai-personality';
import { displayBannerWithInfo } from '../utils/banner';
import { handleExitPromptError, handleGeneralError } from '../utils/error-handler';
import {
  applyAiLanguageDirective,
  backupExistingConfig,
  configureApi,
  copyConfigFiles,
  ensureClaudeDir,
  getExistingApiConfig,
} from '../utils/config';
import {
  configureApiCompletely,
  modifyApiConfigPartially,
} from '../utils/config-operations';
import { installClaudeCode, isClaudeCodeInstalled } from '../utils/installer';
import {
  addCompletedOnboarding,
  backupMcpConfig,
  buildMcpServerConfig,
  fixWindowsMcpConfig,
  mergeMcpServers,
  readMcpConfig,
  writeMcpConfig,
} from '../utils/mcp';
import { isWindows, isTermux } from '../utils/platform';
import { resolveAiOutputLanguage, selectScriptLanguage } from '../utils/prompts';
import { formatApiKeyDisplay } from '../utils/validator';
import { readZcfConfig, updateZcfConfig } from '../utils/zcf-config';

export interface InitOptions {
  lang?: SupportedLang;
  configLang?: SupportedLang;
  aiOutputLang?: AiOutputLanguage | string;
  force?: boolean;
  skipBanner?: boolean;
}



export async function init(options: InitOptions = {}) {
  try {
    // Display banner
    if (!options.skipBanner) {
      displayBannerWithInfo();
    }

    // Step 1: Select ZCF display language
    const scriptLang = await selectScriptLanguage(options.lang);

    const i18n = I18N[scriptLang];
    
    // Show Termux environment info if detected
    if (isTermux()) {
      console.log(ansis.yellow(`\nℹ ${i18n.termuxDetected}`));
      console.log(ansis.gray(i18n.termuxEnvironmentInfo));
    }

    // Step 2: Select config language
    let configLang = options.configLang;
    if (!configLang) {
      const { lang } = await inquirer.prompt<{ lang: SupportedLang }>({
        type: 'list',
        name: 'lang',
        message: i18n.selectConfigLang,
        choices: SUPPORTED_LANGS.map((l) => ({
          name: `${LANG_LABELS[l]} - ${i18n.configLangHint[l]}`,
          value: l,
        })),
      });

      if (!lang) {
        console.log(ansis.yellow(i18n.cancelled));
        process.exit(0);
      }

      configLang = lang;
    }

    // Step 3: Select AI output language
    const zcfConfig = readZcfConfig();
    const aiOutputLang = await resolveAiOutputLanguage(scriptLang, options.aiOutputLang, zcfConfig);

    // Step 4: Check and install Claude Code
    const installed = await isClaudeCodeInstalled();
    if (!installed) {
      const { shouldInstall } = await inquirer.prompt<{ shouldInstall: boolean }>({
        type: 'confirm',
        name: 'shouldInstall',
        message: i18n.installPrompt,
        default: true,
      });

      if (shouldInstall === undefined) {
        console.log(ansis.yellow(i18n.cancelled));
        process.exit(0);
      }

      if (shouldInstall) {
        await installClaudeCode(scriptLang);
      } else {
        console.log(ansis.yellow(i18n.skip));
      }
    } else {
      console.log(ansis.green(`✔ ${i18n.installSuccess}`));
    }

    // Step 5: Handle existing config
    ensureClaudeDir();
    let onlyUpdateDocs = false;
    let action = 'new'; // default action for new installation

    if (existsSync(SETTINGS_FILE) && !options.force) {
      const { action } = await inquirer.prompt<{ action: string }>({
        type: 'list',
        name: 'action',
        message: i18n.existingConfig,
        choices: [
          { name: i18n.backupAndOverwrite, value: 'backup' },
          { name: i18n.updateDocsOnly, value: 'docs-only' },
          { name: i18n.mergeConfig, value: 'merge' },
          { name: i18n.skip, value: 'skip' },
        ],
      });

      if (!action) {
        console.log(ansis.yellow(i18n.cancelled));
        process.exit(0);
      }


      if (action === 'skip') {
        console.log(ansis.yellow(i18n.skip));
        return; // Exit early if user chooses to skip
      }

      if (action === 'docs-only') {
        onlyUpdateDocs = true;
      }
    }

    // Step 6: Configure API (skip if only updating docs or if user chose to skip)
    let apiConfig = null;
    const isNewInstall = !existsSync(SETTINGS_FILE);
    if (!onlyUpdateDocs && (isNewInstall || action === 'backup' || action === 'merge')) {
      // Check for existing API configuration
      const existingApiConfig = getExistingApiConfig();

      if (existingApiConfig) {
        // Display existing configuration
        console.log('\n' + ansis.blue(`ℹ ${i18n.existingApiConfig}`));
        console.log(ansis.gray(`  ${i18n.apiConfigUrl}: ${existingApiConfig.url || i18n.notConfigured}`));
        console.log(
          ansis.gray(
            `  ${i18n.apiConfigKey}: ${
              existingApiConfig.key ? formatApiKeyDisplay(existingApiConfig.key) : i18n.notConfigured
            }`
          )
        );
        console.log(ansis.gray(`  ${i18n.apiConfigAuthType}: ${existingApiConfig.authType || i18n.notConfigured}\n`));

        // Ask user what to do with existing config
        const { action: apiAction } = await inquirer.prompt<{ action: string }>({
          type: 'list',
          name: 'action',
          message: i18n.selectApiAction,
          choices: [
            { name: i18n.keepExistingConfig, value: 'keep' },
            { name: i18n.modifyAllConfig, value: 'modify-all' },
            { name: i18n.modifyPartialConfig, value: 'modify-partial' },
            { name: i18n.skipApi, value: 'skip' },
          ],
        });

        if (!apiAction) {
          console.log(ansis.yellow(i18n.cancelled));
          process.exit(0);
        }

        if (apiAction === 'keep' || apiAction === 'skip') {
          // Keep existing config, no changes needed
          apiConfig = null;
        } else if (apiAction === 'modify-partial') {
          // Handle partial modification
          await modifyApiConfigPartially(existingApiConfig, i18n, scriptLang);
          apiConfig = null; // No need to configure again
        } else if (apiAction === 'modify-all') {
          // Proceed with full configuration
          apiConfig = await configureApiCompletely(i18n, scriptLang);
        }
      } else {
        // No existing config, proceed with normal flow
        const { apiChoice } = await inquirer.prompt<{ apiChoice: string }>({
          type: 'list',
          name: 'apiChoice',
          message: i18n.configureApi,
          choices: [
            {
              name: `${i18n.useAuthToken} - ${ansis.gray(i18n.authTokenDesc)}`,
              value: 'auth_token',
              short: i18n.useAuthToken,
            },
            {
              name: `${i18n.useApiKey} - ${ansis.gray(i18n.apiKeyDesc)}`,
              value: 'api_key',
              short: i18n.useApiKey,
            },
            {
              name: i18n.skipApi,
              value: 'skip',
            },
          ],
        });

        if (!apiChoice) {
          console.log(ansis.yellow(i18n.cancelled));
          process.exit(0);
        }

        if (apiChoice !== 'skip') {
          apiConfig = await configureApiCompletely(i18n, scriptLang, apiChoice as 'auth_token' | 'api_key');
        }
      }
    }

    // Step 7: Execute the chosen action
    if (action === 'backup') {
      const backupDir = backupExistingConfig();
      if (backupDir) {
        console.log(ansis.gray(`✔ ${i18n.backupSuccess}: ${backupDir}`));
      }
      copyConfigFiles(configLang, false);
    } else if (action === 'docs-only') {
      const backupDir = backupExistingConfig();
      if (backupDir) {
        console.log(ansis.gray(`✔ ${i18n.backupSuccess}: ${backupDir}`));
      }
      copyConfigFiles(configLang, true);
    } else if (action === 'merge') {
      const backupDir = backupExistingConfig();
      if (backupDir) {
        console.log(ansis.gray(`✔ ${i18n.backupSuccess}: ${backupDir}`));
      }
      copyConfigFiles(configLang, false);
      // Merge will be handled after API config
    } else if (action === 'new') {
      copyConfigFiles(configLang, false);
    }

    // Step 8: Apply language directive to language.md
    applyAiLanguageDirective(aiOutputLang);
    // Step 8.5: Configure AI personality
    await configureAiPersonality(scriptLang);

    // Step 9: Apply API configuration (skip if only updating docs)
    if (apiConfig && !onlyUpdateDocs) {
      const configuredApi = configureApi(apiConfig);
      if (configuredApi) {
        console.log(ansis.green(`✔ ${i18n.apiConfigSuccess}`));
        console.log(ansis.gray(`  URL: ${configuredApi.url}`));
        console.log(ansis.gray(`  Key: ${formatApiKeyDisplay(configuredApi.key)}`));

        // Add hasCompletedOnboarding flag after successful API configuration
        try {
          addCompletedOnboarding();
        } catch (error) {
          console.error(ansis.red(i18n.failedToSetOnboarding), error);
        }
      }
    }

    // Step 10: Configure MCP services (skip if only updating docs)
    if (!onlyUpdateDocs) {
      const { shouldConfigureMcp } = await inquirer.prompt<{ shouldConfigureMcp: boolean }>({
        type: 'confirm',
        name: 'shouldConfigureMcp',
        message: i18n.configureMcp,
        default: true,
      });

      if (shouldConfigureMcp === undefined) {
        console.log(ansis.yellow(i18n.cancelled));
        process.exit(0);
      }

      if (shouldConfigureMcp) {
        // Show Windows-specific notice
        if (isWindows()) {
          console.log(
            ansis.blue(
              `ℹ ${
                scriptLang === 'zh-CN'
                  ? '检测到 Windows 系统，将自动配置兼容格式'
                  : 'Windows detected, will configure compatible format'
              }`
            )
          );
        }

        // Create choices array with "All" option first
        const choices = [
          {
            title: ansis.bold(i18n.allServices),
            value: 'ALL',
            selected: false,
          },
          ...MCP_SERVICES.map((service) => ({
            title: `${service.name[scriptLang]} - ${ansis.gray(service.description[scriptLang])}`,
            value: service.id,
            selected: false,
          })),
        ];

        const { services } = await inquirer.prompt<{ services: string[] }>({
          type: 'checkbox',
          name: 'services',
          message: i18n.selectMcpServices + ' ' + ansis.gray(i18n.spaceToSelectReturn),
          choices,
        });

        if (services === undefined) {
          console.log(ansis.yellow(i18n.cancelled));
          process.exit(0);
        }

        let selectedServices = services || [];

        // If "ALL" is selected, select all services
        if (selectedServices.includes('ALL')) {
          selectedServices = MCP_SERVICES.map((s) => s.id);
        }

        if (selectedServices.length > 0) {
          // Backup existing MCP config if exists
          const mcpBackupPath = backupMcpConfig();
          if (mcpBackupPath) {
            console.log(ansis.gray(`✔ ${i18n.mcpBackupSuccess}: ${mcpBackupPath}`));
          }

          // Build MCP server configs
          const newServers: Record<string, McpServerConfig> = {};

          for (const serviceId of selectedServices) {
            const service = MCP_SERVICES.find((s) => s.id === serviceId);
            if (!service) continue;

            let config = service.config;

            // Handle services that require API key
            if (service.requiresApiKey) {
              const { apiKey } = await inquirer.prompt<{ apiKey: string }>({
                type: 'input',
                name: 'apiKey',
                message: service.apiKeyPrompt![scriptLang],
                validate: (value) => !!value || i18n.keyRequired,
              });

              if (apiKey === undefined) {
                console.log(ansis.yellow(`${i18n.skip}: ${service.name[scriptLang]}`));
                continue;
              }

              if (apiKey) {
                config = buildMcpServerConfig(service.config, apiKey, service.apiKeyPlaceholder);
              } else {
                // Skip this service if no API key provided
                continue;
              }
            }

            newServers[service.id] = config;
          }

          // Merge with existing config
          const existingConfig = readMcpConfig();
          let mergedConfig = mergeMcpServers(existingConfig, newServers);

          // Fix Windows config if needed
          mergedConfig = fixWindowsMcpConfig(mergedConfig);

          // Write the config with error handling
          try {
            writeMcpConfig(mergedConfig);
            console.log(ansis.green(`✔ ${i18n.mcpConfigSuccess}`));
          } catch (error) {
            console.error(ansis.red(`${i18n.failedToWriteMcpConfig} ${error}`));
          }
        }
      }
    }

    // Step 12: Save zcf config
    updateZcfConfig({
      version,
      preferredLang: scriptLang,
      aiOutputLang: aiOutputLang,
    });

    // Step 13: Success message
    console.log(ansis.green(`✔ ${i18n.configSuccess} ${CLAUDE_DIR}`));
    console.log('\n' + ansis.cyan(i18n.complete));
  } catch (error) {
    if (!handleExitPromptError(error)) {
      handleGeneralError(error, options.lang);
    }
  }
}
