import { platform } from 'node:os'
import { exec } from 'tinyexec'

export function getPlatform() {
  const p = platform()
  if (p === 'win32') return 'windows'
  if (p === 'darwin') return 'macos'
  return 'linux'
}

export async function commandExists(command: string): Promise<boolean> {
  try {
    const cmd = getPlatform() === 'windows' ? 'where' : 'which'
    await exec(cmd, [command])
    return true
  } catch {
    return false
  }
}