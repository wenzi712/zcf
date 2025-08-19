import { exec } from 'node:child_process'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as i18n from '../../../src/i18n'
import * as installerModule from '../../../src/utils/ccr/installer'

// Don't destructure to allow proper mocking
const { getCcrVersion, startCcrService } = installerModule

vi.mock('node:child_process')
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

describe('cCR installer', () => {
  let consoleLogSpy: any
  let consoleErrorSpy: any

  beforeEach(() => {
    vi.clearAllMocks()
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.mocked(i18n.getTranslation).mockReturnValue({
      ccr: {
        ccrAlreadyInstalled: 'CCR is already installed',
        installingCcr: 'Installing CCR...',
        ccrInstallSuccess: 'CCR installed successfully',
        ccrInstallFailed: 'Failed to install CCR',
        failedToStartCcrService: 'Failed to start CCR service',
        errorStartingCcrService: 'Error starting CCR service',
        detectedIncorrectPackage: 'Detected incorrect package claude-code-router, uninstalling...',
        uninstalledIncorrectPackage: 'Successfully uninstalled incorrect package',
        failedToUninstallIncorrectPackage: 'Failed to uninstall incorrect package, continuing with installation',
      },
      updater: {
        checkingVersion: 'Checking version...',
        ccrNotInstalled: 'CCR is not installed',
        ccrUpToDate: 'CCR is up to date (version: {version})',
        ccrNeedsUpdate: 'CCR needs update',
        updateConfirm: 'Do you want to update?',
        updating: 'Updating...',
        updateSuccess: 'Update successful',
        updateFailed: 'Update failed',
      },
    } as any)
  })

  afterEach(() => {
    consoleLogSpy?.mockRestore()
    consoleErrorSpy?.mockRestore()
  })

  describe('isCcrInstalled', () => {
    it('should detect correct package when installed', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            callback(null, 'CCR version 1.0.0', '')
          }
          else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            callback(null, '@musistudio/claude-code-router@1.0.36', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      const result = await installerModule.isCcrInstalled()
      expect(result.isInstalled).toBe(true)
      expect(result.hasCorrectPackage).toBe(true)
    })

    it('should detect incorrect package when ccr exists but correct package not installed', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            callback(null, 'CCR version 2.1.1', '')
          }
          else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            callback(new Error('not found'), '', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      const result = await installerModule.isCcrInstalled()
      expect(result.isInstalled).toBe(true)
      expect(result.hasCorrectPackage).toBe(false)
    })

    it('should return false for both when nothing is installed', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('command not found'), '', '')
        }
      })

      const result = await installerModule.isCcrInstalled()
      expect(result.isInstalled).toBe(false)
      expect(result.hasCorrectPackage).toBe(false)
    })
  })

  describe('getCcrVersion', () => {
    it('should extract version from ccr version output', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            callback(null, 'CCR version 1.2.3', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      const version = await getCcrVersion()
      expect(version).toBe('1.2.3')
    })

    it('should handle version with additional text', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            callback(null, 'claude-code-router version: 1.0.36', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      const version = await getCcrVersion()
      expect(version).toBe('1.0.36')
    })

    it('should return null when version pattern not found', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            callback(null, 'No version info', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      const version = await getCcrVersion()
      expect(version).toBeNull()
    })

    it('should return null when command fails', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('command not found'), '', '')
        }
      })

      const version = await getCcrVersion()
      expect(version).toBeNull()
    })
  })

  describe('installCcr', () => {
    it('should skip installation if already installed and no incorrect package', async () => {
      // Mock isCcrInstalled to return correct package installed
      vi.spyOn(installerModule, 'isCcrInstalled').mockResolvedValue({ isInstalled: true, hasCorrectPackage: true })

      // Also need to mock exec for any potential checks
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'npm list -g claude-code-router') {
            // No incorrect package
            callback(new Error('not found'), '', '')
          }
          else {
            callback(null, 'CCR version 1.0.0', '')
          }
        }
      })

      await installerModule.installCcr('en')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CCR is already installed'))
    })

    it('should reinstall if incorrect package is detected even if ccr command exists', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            // CCR command exists
            callback(null, 'CCR version 2.1.1', '')
          }
          else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            // Correct package NOT installed
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g claude-code-router') {
            // Incorrect package is installed
            callback(null, 'claude-code-router@2.1.1', '')
          }
          else if (cmd === 'npm uninstall -g claude-code-router') {
            callback(null, 'removed 1 package', '')
          }
          else if (cmd === 'npm install -g @musistudio/claude-code-router --force') {
            callback(null, 'added 1 package', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      await installerModule.installCcr('en')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Detected incorrect package'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Successfully uninstalled'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Installing CCR'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CCR installed successfully'))
    })

    it('should install CCR when not installed', async () => {
      // Mock isCcrInstalled to return not installed
      vi.spyOn(installerModule, 'isCcrInstalled').mockResolvedValue({ isInstalled: false, hasCorrectPackage: false })
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version' || cmd === 'which ccr') {
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g claude-code-router') {
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm install -g @musistudio/claude-code-router --force') {
            callback(null, 'added 1 package', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      await installerModule.installCcr('zh-CN')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Installing CCR'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CCR installed successfully'))
    })

    it('should install correct package when neither is installed', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version' || cmd === 'which ccr') {
            // CCR command not found
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            // Correct package not installed
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g claude-code-router') {
            // Incorrect package also not installed
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm install -g @musistudio/claude-code-router --force') {
            callback(null, 'added 1 package', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      await installerModule.installCcr('en')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Installing CCR'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CCR installed successfully'))
    })

    it('should continue installation even if uninstall fails', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            // CCR command exists (incorrect package installed)
            callback(null, 'CCR version 2.1.1', '')
          }
          else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            // Correct package not installed
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g claude-code-router') {
            // Incorrect package is installed
            callback(null, 'claude-code-router@2.1.1', '')
          }
          else if (cmd === 'npm uninstall -g claude-code-router') {
            // Uninstall fails
            callback(new Error('Permission denied'), '', '')
          }
          else if (cmd === 'npm install -g @musistudio/claude-code-router --force') {
            callback(null, 'added 1 package', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      await installerModule.installCcr('en')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Detected incorrect package'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to uninstall'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Installing CCR'))
      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CCR installed successfully'))
    })

    it('should handle EEXIST error gracefully', async () => {
      // Mock isCcrInstalled to return not installed
      vi.spyOn(installerModule, 'isCcrInstalled').mockResolvedValue({ isInstalled: false, hasCorrectPackage: false })
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version' || cmd === 'which ccr') {
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g claude-code-router') {
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm install -g @musistudio/claude-code-router --force') {
            const error = new Error('EEXIST: file already exists')
            callback(error, '', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      await installerModule.installCcr('en')

      expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('CCR is already installed'))
    })

    it('should throw error for non-EEXIST installation failures', async () => {
      // Mock isCcrInstalled to return not installed
      vi.spyOn(installerModule, 'isCcrInstalled').mockResolvedValue({ isInstalled: false, hasCorrectPackage: false })
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version' || cmd === 'which ccr') {
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm list -g claude-code-router') {
            callback(new Error('not found'), '', '')
          }
          else if (cmd === 'npm install -g @musistudio/claude-code-router --force') {
            callback(new Error('Permission denied'), '', '')
          }
          else {
            callback(new Error('command not found'), '', '')
          }
        }
      })

      await expect(installerModule.installCcr('en')).rejects.toThrow('Permission denied')
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to install CCR'))
    })
  })

  describe('startCcrService', () => {
    it('should start CCR service successfully', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'ccr') {
          // Simulate successful start (no error)
          setTimeout(() => callback(null, '', ''), 10)
        }
      })

      await startCcrService('en')

      // Service should be called
      expect(mockExec).toHaveBeenCalledWith('ccr', expect.any(Function))
    })

    it('should handle service start failure', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'ccr') {
          // Call the callback asynchronously to simulate real behavior
          setTimeout(() => callback(new Error('Service failed'), '', ''), 0)
        }
      })

      await startCcrService('zh-CN')

      // Wait a bit for the async callback to be processed
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start CCR service'),
        expect.any(Error),
      )
    })

    it('should use default language when not specified', async () => {
      const mockExec = vi.mocked(exec)
      // @ts-expect-error - testing purpose
      mockExec.mockImplementation((cmd, callback) => {
        if (cmd === 'ccr') {
          setTimeout(() => callback(null, '', ''), 10)
        }
      })

      await startCcrService()

      expect(i18n.getTranslation).toHaveBeenCalledWith('zh-CN')
    })
  })
})
