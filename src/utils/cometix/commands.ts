import { exec, spawn } from 'node:child_process';
import { promisify } from 'node:util';
import ansis from 'ansis';
import type { SupportedLang } from '../../constants';
import { getTranslation } from '../../i18n';
import { COMETIX_COMMANDS, COMETIX_COMMAND_NAME } from './common';
const execAsync = promisify(exec);

export async function runCometixPrintConfig(scriptLang: SupportedLang): Promise<void> {
  const i18n = getTranslation(scriptLang);
  
  try {
    console.log(ansis.blue(`${i18n.cometix.printingConfig}`));
    const { stdout } = await execAsync(COMETIX_COMMANDS.PRINT_CONFIG);
    console.log(stdout);
  } catch (error) {
    if ((error as Error).message.includes(`command not found: ${COMETIX_COMMAND_NAME}`)) {
      console.error(ansis.red(`✗ ${i18n.cometix.commandNotFound}`));
    } else {
      console.error(ansis.red(`✗ ${i18n.cometix.printConfigFailed}: ${error}`));
    }
    throw error;
  }
}

export async function runCometixTuiConfig(scriptLang: SupportedLang): Promise<void> {
  const i18n = getTranslation(scriptLang);
  
  return new Promise((resolve, reject) => {
    console.log(ansis.blue(`${i18n.cometix.enteringTuiConfig}`));
    
    // Use spawn with inherited stdio for proper TUI interaction
    const child = spawn(COMETIX_COMMAND_NAME, ['-c'], {
      stdio: 'inherit', // This allows the TUI to interact directly with the terminal
      shell: true,
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(ansis.green(`✓ ${i18n.cometix.tuiConfigSuccess}`));
        resolve();
      } else {
        const error = new Error(`${COMETIX_COMMAND_NAME} -c exited with code ${code}`);
        console.error(ansis.red(`✗ ${i18n.cometix.tuiConfigFailed}: ${error.message}`));
        reject(error);
      }
    });

    child.on('error', (error) => {
      if (error.message.includes(`command not found`) || error.message.includes('ENOENT')) {
        console.error(ansis.red(`✗ ${i18n.cometix.commandNotFound}`));
      } else {
        console.error(ansis.red(`✗ ${i18n.cometix.tuiConfigFailed}: ${error.message}`));
      }
      reject(error);
    });
  });
}