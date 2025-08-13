import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exec } from 'node:child_process';
import * as installerModule from '../../../src/utils/ccr/installer';
import * as i18n from '../../../src/i18n';

const { getCcrVersion, startCcrService } = installerModule;

vi.mock('node:child_process');
vi.mock('node:util', () => ({
  promisify: vi.fn((fn) => {
    return (...args: any[]) => {
      return new Promise((resolve, reject) => {
        fn(...args, (err: any, stdout: any, stderr: any) => {
          if (err) reject(err);
          else resolve({ stdout, stderr });
        });
      });
    };
  })
}));
vi.mock('../../../src/i18n');

describe('CCR installer - edge cases', () => {
  let consoleLogSpy: any;
  let consoleErrorSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.mocked(i18n.getTranslation).mockReturnValue({
      ccr: {
        ccrAlreadyInstalled: 'CCR is already installed',
        installingCcr: 'Installing CCR...',
        ccrInstallSuccess: 'CCR installed successfully',
        ccrInstallFailed: 'Failed to install CCR',
        failedToStartCcrService: 'Failed to start CCR service',
        errorStartingCcrService: 'Error starting CCR service'
      },
      updater: {
        checkingVersion: 'Checking version...',
        ccrNotInstalled: 'CCR is not installed',
        ccrUpToDate: 'CCR is up to date (version: {version})',
        ccrNeedsUpdate: 'CCR needs update',
        updateConfirm: 'Do you want to update?',
        updating: 'Updating...',
        updateSuccess: 'Update successful',
        updateFailed: 'Update failed'
      }
    } as any);
  });

  afterEach(() => {
    consoleLogSpy?.mockRestore();
    consoleErrorSpy?.mockRestore();
  });

  describe('isCcrInstalled - edge cases', () => {
    it('should handle empty stdout', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version' || cmd === 'which ccr') {
            callback(null, '', ''); // Empty but success
          } else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            callback(new Error('not found'), '', ''); // Package not found
          } else {
            callback(null, '', '');
          }
        }
      });

      const result = await installerModule.isCcrInstalled();
      expect(result.isInstalled).toBe(true); // Empty output but no error means success
      expect(result.hasCorrectPackage).toBe(false); // No package list response
    });

    it('should handle malformed exec callback', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            // @ts-ignore - testing malformed callback
            callback(null);
          } else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            callback(new Error('not found'), '', '');
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      const result = await installerModule.isCcrInstalled();
      expect(result.isInstalled).toBe(true);
      expect(result.hasCorrectPackage).toBe(false);
    });

    it('should handle timeout-like behavior', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd === 'ccr version') {
            // Simulate a very slow response
            setTimeout(() => callback(null, 'CCR version 1.0.0', ''), 100);
          } else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            setTimeout(() => callback(new Error('not found'), '', ''), 50);
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      const result = await installerModule.isCcrInstalled();
      expect(result.isInstalled).toBe(true);
      expect(result.hasCorrectPackage).toBe(false);
    });

    it('should handle special characters in error messages', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(new Error('命令未找到 🚫'), '', '');
        }
      });

      const result = await installerModule.isCcrInstalled();
      expect(result.isInstalled).toBe(false);
      expect(result.hasCorrectPackage).toBe(false);
    });
  });

  describe('getCcrVersion - edge cases', () => {
    it('should handle multiple version patterns in output', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(null, 'Version 1.0.0\nActual version: 2.3.4\n', '');
        }
      });

      const version = await getCcrVersion();
      expect(version).toBe('1.0.0'); // Should return first match
    });

    it('should handle version with pre-release tags', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(null, 'v3.0.0-alpha.1', '');
        }
      });

      const version = await getCcrVersion();
      expect(version).toBe('3.0.0');
    });

    it('should handle stderr output', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(null, '', 'Warning: deprecated\nVersion: 1.5.0');
        }
      });

      const version = await getCcrVersion();
      expect(version).toBeNull(); // Only checks stdout
    });

    it('should handle very long version strings', async () => {
      const mockExec = vi.mocked(exec);
      const longVersion = '9'.repeat(100) + '.0.0';
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callback(null, `Version ${longVersion}`, '');
        }
      });

      const version = await getCcrVersion();
      expect(version).toBe(longVersion);
    });

    it('should handle null/undefined in callback', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          // @ts-ignore
          callback(null, null, null);
        }
      });

      const version = await getCcrVersion();
      expect(version).toBeNull();
    });
  });

  describe('installCcr - edge cases', () => {
    it('should handle network timeout errors', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd.includes('npm install')) {
            const error = new Error('ETIMEDOUT');
            callback(error, '', '');
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      await expect(installerModule.installCcr('en')).rejects.toThrow('ETIMEDOUT');
    });

    it('should handle partial EEXIST error messages', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd.includes('npm install')) {
            const error = new Error('npm ERR! code EEXIST\nnpm ERR! path /usr/local/bin/ccr');
            callback(error, '', '');
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      await installerModule.installCcr('en');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('CCR is already installed')
      );
    });

    it('should handle npm warnings in stdout', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd.includes('npm install')) {
            callback(null, 'npm WARN deprecated package@1.0.0\nadded 5 packages', '');
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      await installerModule.installCcr('zh-CN');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('CCR installed successfully')
      );
    });

    it('should handle empty error objects', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd.includes('npm install')) {
            const error = new Error();
            callback(error, '', '');
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      await expect(installerModule.installCcr('en')).rejects.toThrow();
    });

    it('should handle concurrent installation attempts', async () => {
      const mockExec = vi.mocked(exec);
      let installCount = 0;
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          if (cmd.includes('npm install')) {
            installCount++;
            setTimeout(() => callback(null, 'installed', ''), 50);
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      const results = await Promise.all([
        installerModule.installCcr('en'),
        installerModule.installCcr('zh-CN')
      ]);

      expect(installCount).toBe(2);
      expect(results).toHaveLength(2);
    });
  });

  describe('startCcrService - edge cases', () => {
    it('should handle immediate service crash', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          // Immediate error
          callback(new Error('Service crashed immediately'), '', '');
        }
      });

      await startCcrService('en');
      // Wait for async error handling
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to start CCR service'),
        expect.any(Error)
      );
    });

    it('should handle service with delayed error', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          // Error after delay
          setTimeout(() => callback(new Error('Service crashed after start'), '', ''), 500);
        }
      });

      await startCcrService('zh-CN');
      // Should complete without waiting for delayed error
      expect(mockExec).toHaveBeenCalled();
    });

    it('should handle exception during exec', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation(() => {
        throw new Error('Exec failed');
      });

      await startCcrService('en');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error starting CCR service'),
        expect.any(Error)
      );
    });

    it('should handle undefined language gracefully', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          setTimeout(() => callback(null, '', ''), 10);
        }
      });

      await startCcrService(undefined);
      expect(i18n.getTranslation).toHaveBeenCalledWith('zh-CN');
    });

    it('should handle service that never responds', async () => {
      const mockExec = vi.mocked(exec);
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        // Never call callback - simulating hanging process
      });

      const promise = startCcrService('en');
      
      // Should still resolve after timeout
      await expect(Promise.race([
        promise,
        new Promise(resolve => setTimeout(() => resolve('timeout'), 3000))
      ])).resolves.toBe(undefined);
    });
  });

  describe('race conditions', () => {
    it('should handle rapid successive calls to isCcrInstalled', async () => {
      const mockExec = vi.mocked(exec);
      let callCount = 0;
      // @ts-ignore
      mockExec.mockImplementation((cmd, callback) => {
        if (typeof callback === 'function') {
          callCount++;
          if (cmd === 'ccr version') {
            setTimeout(() => callback(null, 'CCR version 1.0.0', ''), Math.random() * 50);
          } else if (cmd === 'npm list -g @musistudio/claude-code-router') {
            setTimeout(() => callback(new Error('not found'), '', ''), Math.random() * 30);
          } else {
            callback(new Error('not found'), '', '');
          }
        }
      });

      const results = await Promise.all([
        installerModule.isCcrInstalled(),
        installerModule.isCcrInstalled(),
        installerModule.isCcrInstalled()
      ]);

      expect(results).toEqual([
        { isInstalled: true, hasCorrectPackage: false },
        { isInstalled: true, hasCorrectPackage: false },
        { isInstalled: true, hasCorrectPackage: false }
      ]);
      expect(callCount).toBeGreaterThanOrEqual(3);
    });
  });
});