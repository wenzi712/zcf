import type { SupportedLang } from '../../src/i18n/types'
import { describe, expect, it } from 'vitest'
import { getMcpService, getMcpServices, MCP_SERVICE_CONFIGS } from '../../src/config/mcp-services'

describe('mcp services configuration', () => {
  describe('mcp service configs', () => {
    it('should contain pure business configuration without any i18n texts', () => {
      expect(MCP_SERVICE_CONFIGS).toBeDefined()
      expect(Array.isArray(MCP_SERVICE_CONFIGS)).toBe(true)
      expect(MCP_SERVICE_CONFIGS.length).toBeGreaterThan(0)

      // Verify each config item does not contain hardcoded names and descriptions
      MCP_SERVICE_CONFIGS.forEach((config) => {
        expect(config).toHaveProperty('id')
        expect(config).toHaveProperty('requiresApiKey')
        expect(config).toHaveProperty('config')

        // Ensure no hardcoded name and description
        expect(config).not.toHaveProperty('name')
        expect(config).not.toHaveProperty('description')
      })
    })

    it('should contain all existing MCP services', () => {
      const expectedServiceIds = [
        'context7',
        'spec-workflow',
        'mcp-deepwiki',
        'Playwright',
        'exa',
      ]

      const actualIds = MCP_SERVICE_CONFIGS.map(config => config.id)
      expectedServiceIds.forEach((id) => {
        expect(actualIds).toContain(id)
      })
    })
  })

  describe('getMcpServices', () => {
    it('should return complete MCP service list with Chinese translations', () => {
      const lang: SupportedLang = 'zh-CN'
      const services = getMcpServices(lang)

      expect(Array.isArray(services)).toBe(true)
      expect(services.length).toBeGreaterThan(0)

      services.forEach((service) => {
        expect(service).toHaveProperty('id')
        expect(service).toHaveProperty('name')
        expect(service).toHaveProperty('description')
        expect(service).toHaveProperty('requiresApiKey')
        expect(service).toHaveProperty('config')

        // Verify translation content
        expect(typeof service.name).toBe('string')
        expect(service.name.length).toBeGreaterThan(0)
        expect(typeof service.description).toBe('string')
        expect(service.description.length).toBeGreaterThan(0)
      })
    })

    it('should return complete MCP service list with English translations', () => {
      const lang: SupportedLang = 'en'
      const services = getMcpServices(lang)

      expect(Array.isArray(services)).toBe(true)
      expect(services.length).toBeGreaterThan(0)

      services.forEach((service) => {
        expect(service).toHaveProperty('id')
        expect(service).toHaveProperty('name')
        expect(service).toHaveProperty('description')
        expect(service).toHaveProperty('requiresApiKey')
        expect(service).toHaveProperty('config')

        // Verify English content (simple check for no Chinese characters)
        expect(/[\u4E00-\u9FA5]/.test(service.name)).toBe(false)
        expect(/[\u4E00-\u9FA5]/.test(service.description)).toBe(false)
      })
    })

    it('should have same number of services in Chinese and English', () => {
      const zhServices = getMcpServices('zh-CN')
      const enServices = getMcpServices('en')

      expect(zhServices.length).toBe(enServices.length)

      // Verify ID lists are identical
      const zhIds = zhServices.map(s => s.id).sort()
      const enIds = enServices.map(s => s.id).sort()
      expect(zhIds).toEqual(enIds)
    })
  })

  describe('getMcpService', () => {
    it('should return specified MCP service by ID (Chinese)', () => {
      const service = getMcpService('context7', 'zh-CN')

      expect(service).toBeDefined()
      expect(service!.id).toBe('context7')
      expect(service!.name).toContain('Context7')
      expect(service!.description).toContain('文档')
      expect(service!.requiresApiKey).toBe(false)
    })

    it('should return specified MCP service by ID (English)', () => {
      const service = getMcpService('context7', 'en')

      expect(service).toBeDefined()
      expect(service!.id).toBe('context7')
      expect(service!.name).toContain('Context7')
      expect(service!.description).toContain('documentation')
      expect(service!.requiresApiKey).toBe(false)
    })

    it('should return undefined for non-existent service ID', () => {
      const service = getMcpService('non-existent-service', 'zh-CN')
      expect(service).toBeUndefined()
    })

    it('should correctly handle services that require API key', () => {
      const exaService = getMcpService('exa', 'zh-CN')

      expect(exaService).toBeDefined()
      expect(exaService!.requiresApiKey).toBe(true)
      expect(exaService!.apiKeyPrompt).toBeDefined()
      expect(exaService!.apiKeyEnvVar).toBe('EXA_API_KEY')
    })
  })

  describe('aPI key related functionality', () => {
    it('services requiring API key should contain prompt information', () => {
      const zhServices = getMcpServices('zh-CN')
      const enServices = getMcpServices('en')

      const zhExaService = zhServices.find(s => s.id === 'exa')
      const enExaService = enServices.find(s => s.id === 'exa')

      expect(zhExaService?.apiKeyPrompt).toContain('API Key')
      expect(enExaService?.apiKeyPrompt).toContain('API Key')

      // Chinese prompt should contain Chinese content
      expect(zhExaService?.apiKeyPrompt).toMatch(/[\u4E00-\u9FA5]/)
      // English prompt should be English (no Chinese characters)
      expect(/[\u4E00-\u9FA5]/.test(enExaService?.apiKeyPrompt || '')).toBe(false)
    })
  })

  describe('type safety', () => {
    it('returned services should conform to McpService interface', () => {
      const services = getMcpServices('zh-CN')

      services.forEach((service) => {
        // Basic property checks
        expect(typeof service.id).toBe('string')
        expect(typeof service.name).toBe('string')
        expect(typeof service.description).toBe('string')
        expect(typeof service.requiresApiKey).toBe('boolean')
        expect(service.config).toBeDefined()

        // Config structure checks
        expect(['stdio', 'sse']).toContain(service.config.type)

        if (service.config.type === 'stdio') {
          expect(service.config.command).toBeDefined()
          expect(Array.isArray(service.config.args)).toBe(true)
        }
      })
    })
  })
})
