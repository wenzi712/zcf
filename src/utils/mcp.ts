import dayjs from 'dayjs';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'pathe';
import { CLAUDE_DIR, ClAUDE_CONFIG_FILE } from '../constants';
import type { ClaudeConfiguration, McpServerConfig } from '../types';

export function getMcpConfigPath(): string {
  return ClAUDE_CONFIG_FILE;
}

export function readMcpConfig(): ClaudeConfiguration | null {
  if (!existsSync(ClAUDE_CONFIG_FILE)) {
    return null;
  }

  try {
    const content = readFileSync(ClAUDE_CONFIG_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse MCP config:', error);
    return null;
  }
}

export function writeMcpConfig(config: ClaudeConfiguration): void {
  const dir = dirname(ClAUDE_CONFIG_FILE);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  writeFileSync(ClAUDE_CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function backupMcpConfig(): string | null {
  if (!existsSync(ClAUDE_CONFIG_FILE)) {
    return null;
  }

  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const backupBaseDir = join(CLAUDE_DIR, 'backup');
  const backupPath = join(backupBaseDir, `.claude.json.backup_${timestamp}.json`);

  try {
    // Ensure backup directory exists
    if (!existsSync(backupBaseDir)) {
      mkdirSync(backupBaseDir, { recursive: true });
    }

    const content = readFileSync(ClAUDE_CONFIG_FILE, 'utf-8');
    writeFileSync(backupPath, content);
    return backupPath;
  } catch (error) {
    console.error('Failed to backup MCP config:', error);
    return null;
  }
}

export function mergeMcpServers(
  existing: ClaudeConfiguration | null,
  newServers: Record<string, McpServerConfig>
): ClaudeConfiguration {
  const config: ClaudeConfiguration = existing || { mcpServers: {} };

  if (!config.mcpServers) {
    config.mcpServers = {};
  }

  // Merge new servers into existing config
  Object.assign(config.mcpServers, newServers);

  return config;
}

export function buildMcpServerConfig(
  baseConfig: McpServerConfig,
  apiKey?: string,
  placeholder: string = 'YOUR_EXA_API_KEY'
): McpServerConfig {
  if (!apiKey) {
    return { ...baseConfig };
  }

  // Deep clone the config to avoid mutation
  const config = JSON.parse(JSON.stringify(baseConfig));

  // Replace API key placeholder in args if exists
  if (config.args) {
    config.args = config.args.map((arg: string) => arg.replace(placeholder, apiKey));
  }

  // Replace in URL if exists
  if (config.url) {
    config.url = config.url.replace(placeholder, apiKey);
  }

  return config;
}

export function addCompletedOnboarding(): void {
  try {
    // Read existing config or create new one
    let config = readMcpConfig();
    if (!config) {
      config = { mcpServers: {} };
    }

    // Add hasCompletedOnboarding flag
    config.hasCompletedOnboarding = true;

    // Write updated config
    writeMcpConfig(config);
  } catch (error) {
    console.error('Failed to add hasCompletedOnboarding flag:', error);
    throw error;
  }
}
