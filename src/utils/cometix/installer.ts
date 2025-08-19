import type { SupportedLang } from '../../constants'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import ansis from 'ansis'
import { getTranslation } from '../../i18n'
import { addCCometixLineConfig, hasCCometixLineConfig } from '../ccometixline-config'
import { COMETIX_COMMANDS } from './common'

const execAsync = promisify(exec)

export async function isCometixLineInstalled(): Promise<boolean> {
  try {
    await execAsync(COMETIX_COMMANDS.CHECK_INSTALL)
    return true
  }
  catch {
    return false
  }
}

export async function installCometixLine(scriptLang: SupportedLang): Promise<void> {
  const i18n = getTranslation(scriptLang)

  // Check if already installed
  const isInstalled = await isCometixLineInstalled()
  if (isInstalled) {
    console.log(ansis.green(`✔ ${i18n.cometix.cometixAlreadyInstalled}`))

    // Update CCometixLine
    try {
      console.log(ansis.blue(`${i18n.cometix.installingOrUpdating}`))
      await execAsync(COMETIX_COMMANDS.INSTALL)
      console.log(ansis.green(`✔ ${i18n.cometix.installUpdateSuccess}`))
    }
    catch (error) {
      console.log(ansis.yellow(`⚠ ${i18n.cometix.installUpdateFailed}: ${error}`))
    }

    // Check if statusLine config exists, add if missing
    if (!hasCCometixLineConfig()) {
      try {
        addCCometixLineConfig()
        console.log(ansis.green(`✔ ${i18n.cometix.statusLineConfigured || 'Claude Code statusLine configured'}`))
      }
      catch (error) {
        console.log(ansis.yellow(`⚠ ${i18n.cometix.statusLineConfigFailed || 'Failed to configure statusLine'}: ${error}`))
      }
    }
    else {
      console.log(ansis.blue(`ℹ ${i18n.cometix.statusLineAlreadyConfigured || 'Claude Code statusLine already configured'}`))
    }
    return
  }

  try {
    console.log(ansis.blue(`${i18n.cometix.installingCometix}`))
    await execAsync(COMETIX_COMMANDS.INSTALL)
    console.log(ansis.green(`✔ ${i18n.cometix.cometixInstallSuccess}`))

    // Configure Claude Code statusLine after successful installation
    try {
      addCCometixLineConfig()
      console.log(ansis.green(`✔ ${i18n.cometix.statusLineConfigured || 'Claude Code statusLine configured'}`))
    }
    catch (configError) {
      console.log(ansis.yellow(`⚠ ${i18n.cometix.statusLineConfigFailed || 'Failed to configure statusLine'}: ${configError}`))
      console.log(ansis.blue(`💡 ${i18n.cometix.statusLineManualConfig || 'Please manually add statusLine configuration to Claude Code settings'}`))
    }
  }
  catch (error) {
    console.error(ansis.red(`✗ ${i18n.cometix.cometixInstallFailed}: ${error}`))
    throw error
  }
}
