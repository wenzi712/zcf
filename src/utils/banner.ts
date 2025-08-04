import ansis from 'ansis';

export function displayBanner(subtitle?: string) {
  const defaultSubtitle = 'One-click configuration tool for Claude Code';
  const subtitleText = subtitle || defaultSubtitle;
  const paddedSubtitle = subtitleText.padEnd(60, ' ');

  console.log(
    ansis.cyan.bold(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║   ███████╗  ██████╗ ███████╗                                   ║
║       ██╔╝  ██╔═══╝  ██╔═══╝                                   ║
║      ██╔╝   ██║      █████╗                                    ║
║    ██╔╝     ██║      ██╔══╝                                    ║
║   ███████╗  ╚██████╗ ██║                                       ║
║   ╚══════╝   ╚═════╝ ╚═╝                                       ║
║                                                                ║
║   ${ansis.white.bold('Zero-Config Claude-Code Flow')}                                 ║
║   ${ansis.gray(paddedSubtitle)} ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`)
  );
}
