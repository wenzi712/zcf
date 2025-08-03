import prompts from '@posva/prompts';
import ansis from 'ansis';
import { existsSync } from 'node:fs';
import type { SupportedLang } from '../constants';
import { CLAUDE_DIR, I18N, LANG_LABELS, MCP_SERVICES, SETTINGS_FILE, SUPPORTED_LANGS } from '../constants';
import type { McpServerConfig } from '../types';
import { backupExistingConfig, configureApi, copyConfigFiles, ensureClaudeDir } from '../utils/config';
import { installClaudeCode, isClaudeCodeInstalled } from '../utils/installer';
import { backupMcpConfig, buildMcpServerConfig, mergeMcpServers, readMcpConfig, writeMcpConfig } from '../utils/mcp';

export interface InitOptions {
  lang?: SupportedLang;
  configLang?: SupportedLang;
  force?: boolean;
  skipInstall?: boolean;
}

export async function init(options: InitOptions = {}) {
  try {
    // Step 1: Select script language
    let scriptLang = options.lang;
    if (!scriptLang) {
      const response = await prompts({
        type: 'select',
        name: 'lang',
        message: 'Select script language / 选择脚本语言',
        choices: SUPPORTED_LANGS.map((l) => ({
          title: LANG_LABELS[l],
          value: l,
        })),
      });
      scriptLang = response.lang as SupportedLang;
    }

    if (!scriptLang) {
      console.error(ansis.red('Language not selected'));
      process.exit(1);
    }

    const i18n = I18N[scriptLang];

    // Step 2: Select config language
    let configLang = options.configLang;
    if (!configLang) {
      const response = await prompts({
        type: 'select',
        name: 'lang',
        message: i18n.selectConfigLang,
        choices: SUPPORTED_LANGS.map((l) => ({
          title: `${LANG_LABELS[l]} - ${i18n.configLangHint[l]}`,
          value: l,
        })),
      });
      configLang = response.lang as SupportedLang;
    }

    // Step 3: Check and install Claude Code
    if (!options.skipInstall) {
      const installed = await isClaudeCodeInstalled();
      if (!installed) {
        const response = await prompts({
          type: 'confirm',
          name: 'shouldInstall',
          message: i18n.installPrompt,
          initial: true,
        });

        if (response.shouldInstall) {
          await installClaudeCode(scriptLang);
        } else {
          console.log(ansis.yellow(i18n.skip));
        }
      } else {
        console.log(ansis.green(`✔ Claude Code ${i18n.installSuccess}`));
      }
    }

    // Step 4: Handle existing config
    ensureClaudeDir();
    let onlyUpdateDocs = false;
    let action = 'new'; // default action for new installation

    if (existsSync(SETTINGS_FILE) && !options.force) {
      const actionResponse = await prompts({
        type: 'select',
        name: 'action',
        message: i18n.existingConfig,
        choices: [
          { title: i18n.backupAndOverwrite, value: 'backup' },
          { title: i18n.updateDocsOnly, value: 'docs-only' },
          { title: i18n.mergeConfig, value: 'merge' },
          { title: i18n.skip, value: 'skip' },
        ],
      });
      action = actionResponse.action;

      if (action === 'skip') {
        console.log(ansis.yellow(i18n.skip));
        return; // Exit early if user chooses to skip
      }

      if (action === 'docs-only') {
        onlyUpdateDocs = true;
      }
    }

    // Step 5: Configure API (skip if only updating docs or if user chose to skip)
    let apiConfig = null;
    const isNewInstall = !existsSync(SETTINGS_FILE);
    if (!onlyUpdateDocs && (isNewInstall || action === 'backup' || action === 'merge')) {
      const apiResponse = await prompts({
        type: 'select',
        name: 'apiChoice',
        message: i18n.configureApi,
        choices: [
          { title: i18n.customApi, value: 'custom' },
          { title: i18n.skipApi, value: 'skip' },
        ],
      });
      const apiChoice = apiResponse.apiChoice;

      if (apiChoice === 'custom') {
        const urlResponse = await prompts({
          type: 'text',
          name: 'url',
          message: i18n.enterApiUrl,
          validate: (value) => {
            if (!value) return 'URL is required';
            try {
              new URL(value);
              return true;
            } catch {
              return 'Invalid URL';
            }
          },
        });
        const url = urlResponse.url;

        const keyResponse = await prompts({
          type: 'text',
          name: 'key',
          message: i18n.enterApiKey,
          validate: (value) => !!value || 'API Key is required',
        });
        const key = keyResponse.key;

        apiConfig = { url, key };
      }
    }

    // Step 6: Execute the chosen action
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

    // Step 7: Apply API configuration (skip if only updating docs)
    if (apiConfig && !onlyUpdateDocs) {
      configureApi(apiConfig);
      console.log(ansis.green(`✔ ${i18n.apiConfigSuccess}`));
    }

    // Step 8: Configure MCP services (skip if only updating docs)
    if (!onlyUpdateDocs) {
      const mcpResponse = await prompts({
        type: 'confirm',
        name: 'shouldConfigureMcp',
        message: i18n.configureMcp,
        initial: true,
      });

      if (mcpResponse.shouldConfigureMcp) {
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

        const selectedResponse = await prompts({
          type: 'multiselect',
          name: 'services',
          message: i18n.selectMcpServices,
          choices,
          instructions: false,
          hint: '- Space to select. Return to submit',
        });

        let selectedServices = selectedResponse.services || [];

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
              const apiKeyResponse = await prompts({
                type: 'text',
                name: 'apiKey',
                message: service.apiKeyPrompt![scriptLang],
                validate: (value) => !!value || 'API Key is required',
              });

              if (apiKeyResponse.apiKey) {
                config = buildMcpServerConfig(service.config, apiKeyResponse.apiKey, service.apiKeyPlaceholder);
              } else {
                // Skip this service if no API key provided
                continue;
              }
            }

            newServers[service.id] = config;
          }

          // Merge with existing config
          const existingConfig = readMcpConfig();
          const mergedConfig = mergeMcpServers(existingConfig, newServers);

          // Write the config with error handling
          try {
            writeMcpConfig(mergedConfig);
            console.log(ansis.green(`✔ ${i18n.mcpConfigSuccess}`));
          } catch (error) {
            console.error(ansis.red(`Failed to write MCP config: ${error}`));
          }
        }
      }
    }

    // Step 9: Success message
    console.log(ansis.green(`✔ ${i18n.configSuccess} ${CLAUDE_DIR}`));
    console.log('\n' + ansis.cyan(i18n.complete));
  } catch (error) {
    console.error(ansis.red(`${I18N[options.lang || 'en'].error}:`), error);
    process.exit(1);
  }
}
