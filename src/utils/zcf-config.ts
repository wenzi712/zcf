import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { ZCF_CONFIG_FILE, type AiOutputLanguage, type SupportedLang } from '../constants';

export interface ZcfConfig {
  version: string;
  preferredLang: SupportedLang;
  aiOutputLang?: AiOutputLanguage | string;
  lastUpdated: string;
}

export function readZcfConfig(): ZcfConfig | null {
  try {
    if (!existsSync(ZCF_CONFIG_FILE)) {
      return null;
    }
    const content = readFileSync(ZCF_CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as ZcfConfig;
  } catch (error) {
    console.error('Failed to read zcf config:', error);
    return null;
  }
}

export function writeZcfConfig(config: ZcfConfig): void {
  try {
    writeFileSync(ZCF_CONFIG_FILE, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Failed to write zcf config:', error);
  }
}

export function updateZcfConfig(updates: Partial<ZcfConfig>): void {
  const existingConfig = readZcfConfig();
  const newConfig: ZcfConfig = {
    version: updates.version || existingConfig?.version || '1.0.0',
    preferredLang: updates.preferredLang || existingConfig?.preferredLang || 'en',
    aiOutputLang: updates.aiOutputLang || existingConfig?.aiOutputLang,
    lastUpdated: new Date().toISOString(),
  };
  writeZcfConfig(newConfig);
}