import ansis from 'ansis';
import { I18N, type SupportedLang } from '../constants';

/**
 * Validate API Key format
 * Only allows letters, numbers, underscores and hyphens
 * @param apiKey - API Key to validate
 * @param lang - Language for error messages
 * @returns Validation result
 */
export function validateApiKey(apiKey: string, lang: SupportedLang = 'zh-CN'): { isValid: boolean; error?: string } {
  const i18n = I18N[lang];

  // Empty check
  if (!apiKey || apiKey.trim() === '') {
    return {
      isValid: false,
      error: i18n.apiKeyValidation.empty,
    };
  }

  // Format validation: only allow letters, numbers, underscores, hyphens
  const apiKeyPattern = /^[A-Za-z0-9_-]+$/;

  if (!apiKeyPattern.test(apiKey)) {
    return {
      isValid: false,
      error: i18n.apiKeyValidation.invalid,
    };
  }

  // Length check (optional, adjust based on requirements)
  if (apiKey.length < 1) {
    return {
      isValid: false,
      error: i18n.apiKeyValidation.tooShort,
    };
  }

  if (apiKey.length > 256) {
    return {
      isValid: false,
      error: i18n.apiKeyValidation.tooLong,
    };
  }

  return { isValid: true };
}

/**
 * Format API Key for display (hide middle part)
 * @param apiKey - Original API Key
 * @returns Formatted API Key
 */
export function formatApiKeyDisplay(apiKey: string): string {
  if (!apiKey || apiKey.length < 12) {
    return apiKey;
  }

  // Show first 8 and last 4 characters
  return `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`;
}

/**
 * Display API Key validation error message
 * @param error - Error message
 * @param lang - Language for example format
 */
export function showApiKeyError(error: string, lang: SupportedLang = 'zh-CN'): void {
  const i18n = I18N[lang];

  console.log(ansis.red(`✗ ${error}`));
  console.log(ansis.gray(i18n.apiKeyValidation.example));
}
