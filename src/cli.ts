#!/usr/bin/env node
import cac from 'cac'
import { version } from '../package.json'
import { init } from './commands/init'

const cli = cac('zcc')

cli
  .command('[lang]', 'Initialize Claude Code configuration')
  .option('--config-lang <lang>', 'Configuration language (zh-CN, en)')
  .option('--force', 'Force overwrite existing configuration')
  .option('--skip-install', 'Skip Claude Code installation check')
  .action(async (lang, options) => {
    await init({
      lang: lang || options.lang,
      configLang: options.configLang,
      force: options.force,
      skipInstall: options.skipInstall
    })
  })

cli.help()
cli.version(version)
cli.parse()