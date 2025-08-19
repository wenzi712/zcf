import type { McpServicesTranslations, TranslationStructure } from '../../types'
import { api } from './api'
import { bmad } from './bmad'
import { ccrMessages } from './ccr'
import { cli } from './cli'
import { cometixMessages } from './cometix'
import { common } from './common'
import { configuration } from './configuration'
import { errors } from './errors'
import { installation } from './installation'
import { language } from './language'
import { mcp, mcpServices } from './mcp'
import { menu } from './menu'
import { tools } from './tools'
import { updater } from './updater'
import { workflow } from './workflow'

// New structure with namespaces
export const en: TranslationStructure = {
  common,
  language,
  installation,
  api,
  configuration,
  mcp,
  menu,
  workflow,
  cli,
  bmad,
  errors,
  tools,
  ccr: ccrMessages,
  cometix: cometixMessages,
  updater,
}

export const enMcpServices: McpServicesTranslations = mcpServices
