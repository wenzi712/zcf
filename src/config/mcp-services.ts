import type { SupportedLang } from '../i18n/types'
import type { McpServerConfig, McpService } from '../types'
import { getMcpServiceTranslation } from '../i18n'

// 纯业务配置，不包含任何i18n文本
export interface McpServiceConfig {
  id: string
  requiresApiKey: boolean
  apiKeyEnvVar?: string
  config: McpServerConfig
}

export const MCP_SERVICE_CONFIGS: McpServiceConfig[] = [
  {
    id: 'context7',
    requiresApiKey: false,
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@upstash/context7-mcp'],
      env: {},
    },
  },
  {
    id: 'spec-workflow',
    requiresApiKey: false,
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@pimzino/spec-workflow-mcp@latest', '--AutoStartDashboard'],
      env: {},
    },
  },
  {
    id: 'mcp-deepwiki',
    requiresApiKey: false,
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'mcp-deepwiki@latest'],
      env: {},
    },
  },
  {
    id: 'Playwright',
    requiresApiKey: false,
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', '@playwright/mcp@latest'],
      env: {},
    },
  },
  {
    id: 'exa',
    requiresApiKey: true,
    apiKeyEnvVar: 'EXA_API_KEY',
    config: {
      type: 'stdio',
      command: 'npx',
      args: ['-y', 'exa-mcp-server'],
      env: {
        EXA_API_KEY: 'YOUR_EXA_API_KEY',
      },
    },
  },
]

/**
 * 获取带翻译的完整MCP服务列表
 */
export function getMcpServices(lang: SupportedLang): McpService[] {
  const translations = getMcpServiceTranslation(lang)

  return MCP_SERVICE_CONFIGS.map((config) => {
    const translation = translations[config.id]

    if (!translation) {
      throw new Error(`Missing translation for MCP service: ${config.id}`)
    }

    const service: McpService = {
      id: config.id,
      name: translation.name,
      description: translation.description,
      requiresApiKey: config.requiresApiKey,
      config: config.config,
    }

    // 添加API密钥相关字段
    if (config.requiresApiKey && translation.apiKeyPrompt) {
      service.apiKeyPrompt = translation.apiKeyPrompt
    }

    if (config.apiKeyEnvVar) {
      service.apiKeyEnvVar = config.apiKeyEnvVar
    }

    return service
  })
}

/**
 * 根据ID获取指定的MCP服务
 */
export function getMcpService(id: string, lang: SupportedLang): McpService | undefined {
  const services = getMcpServices(lang)
  return services.find(service => service.id === id)
}
