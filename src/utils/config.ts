import dayjs from 'dayjs';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'pathe';
import type { SupportedLang } from '../constants';
import { CLAUDE_DIR, SETTINGS_FILE } from '../constants';

export function ensureClaudeDir() {
  if (!existsSync(CLAUDE_DIR)) {
    mkdirSync(CLAUDE_DIR, { recursive: true });
  }
}

export function backupExistingConfig() {
  if (!existsSync(CLAUDE_DIR)) {
    return null;
  }

  const timestamp = dayjs().format('YYYY-MM-DD_HH-mm-ss');
  const backupBaseDir = join(CLAUDE_DIR, 'backup');
  const backupDir = join(backupBaseDir, `backup_${timestamp}`);

  // Create backup directory
  mkdirSync(backupDir, { recursive: true });

  // Copy all files from CLAUDE_DIR to backup directory (excluding backup folder itself)
  const entries = readdirSync(CLAUDE_DIR);
  for (const entry of entries) {
    if (entry === 'backup') continue; // Skip backup directory itself
    const srcPath = join(CLAUDE_DIR, entry);
    const destPath = join(backupDir, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }

  return backupDir;
}

export function copyConfigFiles(lang: SupportedLang, onlyMd: boolean = false) {
  // Get the root directory of the package
  const currentFileUrl = new URL(import.meta.url);
  const currentFilePath = currentFileUrl.pathname;
  // Navigate from dist/shared/xxx.mjs to package root
  const distDir = dirname(dirname(currentFilePath));
  const rootDir = dirname(distDir);
  const sourceDir = join(rootDir, 'templates', lang);

  if (!existsSync(sourceDir)) {
    throw new Error(`Template directory not found: ${sourceDir}`);
  }

  if (onlyMd) {
    // Only copy .md files and maintain directory structure
    copyMdFiles(sourceDir, CLAUDE_DIR);
  } else {
    // Copy all files
    copyDirectory(sourceDir, CLAUDE_DIR);
  }
}

function copyMdFiles(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy directories to maintain structure
      copyMdFiles(srcPath, destPath);
    } else if (entry.endsWith('.md')) {
      // Only copy .md files
      copyFileSync(srcPath, destPath);
    }
  }
}

function copyDirectory(src: string, dest: string) {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

export interface ApiConfig {
  url: string;
  key: string;
}

export function configureApi(apiConfig: ApiConfig | null) {
  if (!apiConfig) return;

  let settings: any = {
    $schema: 'https://json.schemastore.org/claude-code-settings.json',
    env: {},
    includeCoAuthoredBy: false,
    permissions: {
      allow: [
        'Bash(*)',
        'LS(*)',
        'Read(*)',
        'Write(*)',
        'Edit(*)',
        'MultiEdit(*)',
        'Glob(*)',
        'Grep(*)',
        'WebFetch(*)',
        'WebSearch(*)',
        'TodoWrite(*)',
        'NotebookRead(*)',
        'NotebookEdit(*)',
      ],
      deny: [],
    },
    hooks: {},
    model: 'opus',
  };

  if (existsSync(SETTINGS_FILE)) {
    const content = readFileSync(SETTINGS_FILE, 'utf-8');
    try {
      const existingSettings = JSON.parse(content);
      // Deep merge existing settings with defaults
      settings = { ...settings, ...existingSettings };
      if (existingSettings.env) {
        settings.env = { ...settings.env, ...existingSettings.env };
      }
    } catch (error) {
      console.error('Failed to parse existing settings.json, using defaults:', error);
    }
  }

  // Update API configuration
  settings.env.ANTHROPIC_API_KEY = apiConfig.key;
  settings.env.ANTHROPIC_BASE_URL = apiConfig.url;

  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export function mergeConfigs(sourceFile: string, targetFile: string) {
  if (!existsSync(sourceFile)) return;

  let target: any = {};
  if (existsSync(targetFile)) {
    const content = readFileSync(targetFile, 'utf-8');
    try {
      target = JSON.parse(content);
    } catch {
      target = {};
    }
  }

  const source = JSON.parse(readFileSync(sourceFile, 'utf-8'));

  // Deep merge logic
  const merged = deepMerge(target, source);

  writeFileSync(targetFile, JSON.stringify(merged, null, 2));
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }

  return result;
}
