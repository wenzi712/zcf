export interface McpService {
  id: string
  name: { 'en': string, 'zh-CN': string }
  description: { 'en': string, 'zh-CN': string }
  requiresApiKey: boolean
  apiKeyPrompt?: { 'en': string, 'zh-CN': string }
  apiKeyPlaceholder?: string
  apiKeyEnvVar?: string
  config: McpServerConfig
}

export interface McpServerConfig {
  type: 'stdio' | 'sse'
  command?: string
  args?: string[]
  url?: string
  env?: Record<string, string>
}

export interface ClaudeConfiguration {
  mcpServers: Record<string, McpServerConfig>
  hasCompletedOnboarding?: boolean
}
