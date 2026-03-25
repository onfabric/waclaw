const RESET = '\x1b[0m';

const LEVEL_STYLES: Record<string, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m', // green
  warn: '\x1b[33m', // yellow
  error: '\x1b[31m', // red
};

function write(level: 'debug' | 'info' | 'warn' | 'error', ...args: unknown[]): void {
  const ts = new Date().toISOString();
  const style = LEVEL_STYLES[level] ?? '';
  const tag = `${style}${level.toUpperCase().padEnd(5)}${RESET}`;
  const out = level === 'error' ? console.error : console.log;
  out(`${ts} ${tag}`, ...args);
}

export const logger = {
  debug(...args: unknown[]) {
    write('debug', ...args);
  },
  info(...args: unknown[]) {
    write('info', ...args);
  },
  warn(...args: unknown[]) {
    write('warn', ...args);
  },
  error(...args: unknown[]) {
    write('error', ...args);
  },
};
