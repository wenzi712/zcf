import type { SupportedLang } from '../constants'
import ansis from 'ansis'
import inquirer from 'inquirer'
import { getMcpServices } from '../config/mcp-services'
import { getTranslation } from '../i18n'

/**
 * Common function to select MCP services
 * @param scriptLang Current script language
 * @returns Array of selected service IDs, or undefined if cancelled
 */
export async function selectMcpServices(scriptLang: SupportedLang): Promise<string[] | undefined> {
  const i18n = getTranslation(scriptLang)
  const mcpServices = getMcpServices(scriptLang)

  // Build choices without ALL option
  const choices = mcpServices.map(service => ({
    name: `${service.name} - ${ansis.gray(service.description)}`,
    value: service.id,
    selected: false,
  }))

  const { services } = await inquirer.prompt<{ services: string[] }>({
    type: 'checkbox',
    name: 'services',
    message: `${i18n.mcp.selectMcpServices}${i18n.common.multiSelectHint}`,
    choices,
  })

  // Return undefined if cancelled (user pressed Ctrl+C or similar)
  if (services === undefined) {
    console.log(ansis.yellow(i18n.common.cancelled))
    return undefined
  }

  // Return the selected services (could be empty array)
  return services
}
