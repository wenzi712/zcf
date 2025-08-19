import { exec, spawn } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as i18n from '../../../src/i18n'
import * as commandsModule from '../../../src/utils/cometix/commands'

// Don't destructure to allow proper mocking
const { runCometixPrintConfig, runCometixTuiConfig } = commandsModule

vi.mock('node:child_process', () => ({
  exec: vi.fn(),
  spawn: vi.fn(),
}))
vi.mock('node:util', () => ({
  promisify: vi.fn((fn) => {
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        fn(...args, (err: any, stdout: any, stderr: any) => {
          if (err)
            reject(err)
          else resolve({ stdout, stderr })
        })
      })
    }
  }),
}))
vi.mock('../../../src/i18n')

describe('cCometixLine commands', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(i18n.getTranslation).mockReturnValue({
      common: {},
      language: {},
      installation: {},
      api: {},
      menu: {},
      workflow: {},
      bmad: {},
      errors: {},
      updater: {},
      cometix: {
        installingOrUpdating: 'Installing/updating CCometixLine...',
        installUpdateSuccess: 'CCometixLine install/update completed',
        installUpdateFailed: 'Failed to install/update CCometixLine',
        printingConfig: 'Printing CCometixLine configuration...',
        printConfigSuccess: 'Configuration printed successfully',
        printConfigFailed: 'Failed to print configuration',
        enteringTuiConfig: 'Entering CCometixLine TUI configuration mode...',
        tuiConfigSuccess: 'TUI configuration completed successfully',
        tuiConfigFailed: 'Failed to run TUI configuration',
        commandNotFound: 'ccline command not found. Please install CCometixLine first.',
      },
    } as any)
  })

  afterEach(() => {
    consoleLogSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  describe('runCometixPrintConfig', () => {
    it('should print default configuration successfully', async () => {
      const mockExec = vi.mocked(exec)
      const configOutput = JSON.stringify(
        {
          segments: ['path', 'git', 'model', 'context'],
          theme: 'default',
        },
        null,
        2,
      )

      mockExec.mockImplementation((_command, callback: any) => {
        callback(null, configOutput, '')
        return {} as any
      })

      await runCometixPrintConfig('en')

      expect(mockExec).toHaveBeenCalledWith('ccline --print', expect.any(Function))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Printing CCometixLine configuration...'))
      expect(consoleLogSpy).toHaveBeenCalledWith(configOutput)
    })

    it('should handle ccline command not found', async () => {
      const mockExec = vi.mocked(exec)
      mockExec.mockImplementation((_command, callback: any) => {
        const error = new Error('command not found: ccline')
        callback(error, '', 'command not found: ccline')
        return {} as any
      })

      await expect(runCometixPrintConfig('en')).rejects.toThrow('command not found: ccline')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ccline command not found. Please install CCometixLine first.'),
      )
    })

    it('should handle configuration print failure', async () => {
      const mockExec = vi.mocked(exec)
      mockExec.mockImplementation((_command, callback: any) => {
        const error = new Error('Config file not found')
        callback(error, '', 'Error: Configuration file not found')
        return {} as any
      })

      await expect(runCometixPrintConfig('en')).rejects.toThrow('Config file not found')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to print configuration'))
    })
  })

  describe('runCometixTuiConfig', () => {
    it('should run TUI configuration successfully', async () => {
      const mockSpawn = vi.mocked(spawn)
      const mockChild = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            // Simulate successful completion
            callback(0)
          }
          return mockChild
        }),
      }

      mockSpawn.mockReturnValue(mockChild as any)

      await runCometixTuiConfig('en')

      expect(mockSpawn).toHaveBeenCalledWith('ccline', ['-c'], {
        stdio: 'inherit',
        shell: true,
      })
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Entering CCometixLine TUI configuration mode...'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('TUI configuration completed successfully'))
    })

    it('should handle ccline command not found in TUI config', async () => {
      const mockSpawn = vi.mocked(spawn)
      const mockChild = {
        on: vi.fn((event, callback) => {
          if (event === 'error') {
            // Simulate command not found error
            callback(new Error('spawn ccline ENOENT'))
          }
          return mockChild
        }),
      }

      mockSpawn.mockReturnValue(mockChild as any)

      await expect(runCometixTuiConfig('en')).rejects.toThrow('spawn ccline ENOENT')
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ccline command not found. Please install CCometixLine first.'),
      )
    })

    it('should handle TUI configuration failure', async () => {
      const mockSpawn = vi.mocked(spawn)
      const mockChild = {
        on: vi.fn((event, callback) => {
          if (event === 'close') {
            // Simulate exit with error code
            callback(1)
          }
          return mockChild
        }),
      }

      mockSpawn.mockReturnValue(mockChild as any)

      await expect(runCometixTuiConfig('en')).rejects.toThrow('ccline -c exited with code 1')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to run TUI configuration'))
    })
  })
})
