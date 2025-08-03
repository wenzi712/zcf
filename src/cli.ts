#!/usr/bin/env node
import cac from 'cac'
import ansis from 'ansis'
import { version } from '../package.json'
import { init } from './commands/init'
import { update } from './commands/update'

const cli = cac('zcf')

// Default command - init
cli
  .command('[lang]', 'Initialize Claude Code configuration (default)')
  .option('--config-lang, -c <lang>', 'Configuration language (zh-CN, en)')
  .option('--force, -f', 'Force overwrite existing configuration')
  .action(async (lang, options) => {
    await init({
      lang: lang || options.lang,
      configLang: options.configLang,
      force: options.force
    })
  })

// Update command
cli
  .command('update', 'Update Claude Code prompts only')
  .alias('u')
  .option('--config-lang, -c <lang>', 'Configuration language (zh-CN, en)')
  .action(async (options) => {
    await update({ configLang: options.configLang })
  })

// Custom help with aliases
cli.help((sections) => {
  // Add custom header
  sections.unshift({
    title: '',
    body: ansis.cyan.bold(`ZCF - Zero-Config Claude-Code Flow v${version}`)
  })
  
  // Add commands section with aliases
  sections.push({
    title: ansis.yellow('Commands:'),
    body: [
      `  ${ansis.cyan('zcf')}              Initialize configuration (default)`,
      `  ${ansis.cyan('zcf update')} | ${ansis.cyan('u')}   Update prompts only with backup`,
      '',
      ansis.gray('  Shortcut:'),
      `  ${ansis.cyan('zcf u')}            Quick update`
    ].join('\n')
  })
  
  // Add options section
  sections.push({
    title: ansis.yellow('Options:'),
    body: [
      `  ${ansis.green('--config-lang, -c')} <lang>  Configuration language (zh-CN, en)`,
      `  ${ansis.green('--force, -f')}           Force overwrite existing configuration`,
      `  ${ansis.green('--help, -h')}            Display help`,
      `  ${ansis.green('--version, -v')}         Display version`
    ].join('\n')
  })
  
  // Add examples section
  sections.push({
    title: ansis.yellow('Examples:'),
    body: [
      ansis.gray('  # Initialize with interactive prompts'),
      `  ${ansis.cyan('npx zcf')}`,
      '',
      ansis.gray('  # Update prompts only'),
      `  ${ansis.cyan('npx zcf u')}`,
      '',
      ansis.gray('  # Force overwrite with Chinese config'),
      `  ${ansis.cyan('npx zcf -c zh-CN -f')}`,
      `  ${ansis.cyan('npx zcf --config-lang zh-CN --force')}`
    ].join('\n')
  })
  
  return sections
})

cli.version(version)
cli.parse()