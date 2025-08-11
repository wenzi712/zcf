import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import semver from 'semver';

const execAsync = promisify(exec);

interface VersionCache {
  [packageName: string]: {
    version: string;
    checkedAt: number;
  };
}

const CACHE_DIR = join(homedir(), '.claude', 'cache');
const CACHE_FILE = join(CACHE_DIR, 'version-cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function ensureCacheDir(): Promise<void> {
  try {
    await mkdir(CACHE_DIR, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
}

async function readCache(): Promise<VersionCache> {
  try {
    const content = await readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function writeCache(cache: VersionCache): Promise<void> {
  await ensureCacheDir();
  await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2));
}

export async function getInstalledVersion(command: string): Promise<string | null> {
  try {
    // Try -v first (more universal), then --version
    let stdout: string;
    try {
      const result = await execAsync(`${command} -v`);
      stdout = result.stdout;
    } catch {
      // Fallback to --version if -v doesn't work
      const result = await execAsync(`${command} --version`);
      stdout = result.stdout;
    }
    
    // Extract version from output
    const versionMatch = stdout.match(/(\d+\.\d+\.\d+(?:-[\w.]+)?)/);
    return versionMatch ? versionMatch[1] : null;
  } catch {
    return null;
  }
}

export async function getLatestVersion(packageName: string, useCache = true): Promise<string | null> {
  // Check cache first
  if (useCache) {
    const cache = await readCache();
    const cached = cache[packageName];
    
    if (cached && Date.now() - cached.checkedAt < CACHE_DURATION) {
      return cached.version;
    }
  }
  
  try {
    const { stdout } = await execAsync(`npm view ${packageName} version`);
    const version = stdout.trim();
    
    // Update cache
    const cache = await readCache();
    cache[packageName] = {
      version,
      checkedAt: Date.now()
    };
    await writeCache(cache);
    
    return version;
  } catch {
    return null;
  }
}

export function compareVersions(current: string, latest: string): number {
  // Returns: -1 if current < latest, 0 if equal, 1 if current > latest
  if (!semver.valid(current) || !semver.valid(latest)) {
    return -1; // Assume update needed if version is invalid
  }
  
  return semver.compare(current, latest);
}

export function shouldUpdate(current: string, latest: string): boolean {
  return compareVersions(current, latest) < 0;
}

export async function checkCcrVersion(): Promise<{
  installed: boolean;
  currentVersion: string | null;
  latestVersion: string | null;
  needsUpdate: boolean;
}> {
  const currentVersion = await getInstalledVersion('ccr');
  // Try both package names
  let latestVersion = await getLatestVersion('@musistudio/claude-code-router');
  if (!latestVersion) {
    latestVersion = await getLatestVersion('claude-code-router');
  }
  
  return {
    installed: currentVersion !== null,
    currentVersion,
    latestVersion,
    needsUpdate: currentVersion && latestVersion ? shouldUpdate(currentVersion, latestVersion) : false
  };
}

export async function checkClaudeCodeVersion(): Promise<{
  installed: boolean;
  currentVersion: string | null;
  latestVersion: string | null;
  needsUpdate: boolean;
}> {
  const currentVersion = await getInstalledVersion('claude');
  const latestVersion = await getLatestVersion('@anthropic-ai/claude-code');
  
  return {
    installed: currentVersion !== null,
    currentVersion,
    latestVersion,
    needsUpdate: currentVersion && latestVersion ? shouldUpdate(currentVersion, latestVersion) : false
  };
}