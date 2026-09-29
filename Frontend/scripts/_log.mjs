export const SIGN_CHECK = '✓'
export const SIGN_CROSS = '✗'
export const SIGN_WARNING = '⚠'

const isTTY = process.stdout.isTTY

// ANSI-codes. If not TTY (CI, pipe) — return empty strings,
// so logs are readable in CI.
const wrap = (code) => (isTTY ? (s) => `\x1b[${code}m${s}\x1b[0m` : (s) => s)

export const c = {
  bold: wrap('1'),
  dim: wrap('2'),
  red: wrap('31'),
  green: wrap('32'),
  yellow: wrap('33'),
  blue: wrap('34'),
  magenta: wrap('35'),
  cyan: wrap('36'),
  gray: wrap('90'),
}

export const log = {
  step: (msg) => console.log(`${c.cyan('▶')} ${c.bold(msg)}`),
  ok: (msg) => console.log(`  ${c.green(SIGN_CHECK)} ${msg}`),
  skip: (msg) => console.log(`  ${c.gray('○')} ${c.dim(msg)}`),
  warn: (msg) => console.log(`  ${c.yellow(SIGN_WARNING)} ${c.yellow(msg)}`),
  err: (msg) => console.error(`  ${c.red(SIGN_CROSS)} ${c.red(msg)}`),
  info: (msg) => console.log(`  ${c.blue('ℹ')} ${msg}`),
  count: (n, singular, plural = singular + 's') =>
    `${c.bold(c.magenta(String(n)))} ${n === 1 ? singular : plural}`,
  file: (name) => c.dim(name),
  code: (s) => c.cyan(s),
}
