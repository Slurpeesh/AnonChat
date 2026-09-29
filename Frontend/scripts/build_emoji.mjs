import { spawn } from 'node:child_process'
import { c, log, SIGN_CHECK, SIGN_CROSS, SIGN_WARNING } from './_log.mjs'

const isTTY = process.stdout.isTTY

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']

// references for clean up on Ctrl+C
let activeChild = null
let activeSpinnerTimer = null

function cleanup() {
  if (activeSpinnerTimer) {
    clearInterval(activeSpinnerTimer)
    activeSpinnerTimer = null
    process.stdout.write('\r\x1b[K')
  }
  if (activeChild && !activeChild.killed) {
    activeChild.kill('SIGTERM')
  }
}

process.on('SIGINT', () => {
  console.log('\n' + c.yellow(`${SIGN_WARNING} Interrupted by user`))
  cleanup()
  process.exit(130)
})

function runWithSpinner(label, command) {
  log.step(label)
  const start = Date.now()

  return new Promise((resolve, reject) => {
    let frameIndex = 0

    const child = spawn(command, {
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    })

    activeChild = child

    if (isTTY) {
      activeSpinnerTimer = setInterval(() => {
        const frame = FRAMES[frameIndex++ % FRAMES.length]
        process.stdout.write(
          `\r  ${c.cyan(frame)} ${c.dim('working...')}\x1b[K`,
        )
      }, 80)
    }

    let stderrBuf = ''
    child.stdout.on('data', () => {})
    child.stderr.on('data', (chunk) => {
      stderrBuf += chunk.toString()
    })

    child.on('exit', (code) => {
      if (activeSpinnerTimer) {
        clearInterval(activeSpinnerTimer)
        activeSpinnerTimer = null
        process.stdout.write('\r\x1b[K')
      }
      activeChild = null

      const ms = Date.now() - start

      if (code === 0) {
        log.ok(`done in ${c.dim(ms + 'ms')}`)
        resolve()
      } else {
        log.err(`failed with exit code ${code}`)
        if (stderrBuf.trim()) {
          console.error(c.dim('--- stderr ---'))
          console.error(stderrBuf.trim())
          console.error(c.dim('--- /stderr ---'))
        }
        reject(new Error(`${label} failed`))
      }
    })

    child.on('error', (err) => {
      if (activeSpinnerTimer) {
        clearInterval(activeSpinnerTimer)
        activeSpinnerTimer = null
        process.stdout.write('\r\x1b[K')
      }
      activeChild = null
      log.err(`spawn error: ${err.message}`)
      reject(err)
    })
  })
}

function runNodeScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath], {
      stdio: 'inherit',
    })
    activeChild = child

    child.on('exit', (code) => {
      activeChild = null
      if (code === 0) resolve()
      else reject(new Error(`${scriptPath} failed`))
    })
    child.on('error', (err) => {
      activeChild = null
      reject(err)
    })
  })
}

// ---- pipeline ----

async function main() {
  await runWithSpinner('Cleaning svg/', 'npx rimraf src/features/Emoji/svg')

  await runWithSpinner(
    'Running SVGR',
    'npx @svgr/cli --silent --config-file .svgrrc.js --out-dir src/features/Emoji/svg src/emojisvgs',
  )

  await runNodeScript('./scripts/uniquify_emoji_ids.mjs')
  await runNodeScript('./scripts/generate_emoji_map.mjs')

  await runWithSpinner(
    'Formatting',
    'npx prettier --loglevel warn --write "src/features/Emoji/**/*.{ts,tsx}"',
  )

  console.log('\n' + c.bold(c.green(`${SIGN_CHECK} emoji:build complete`)))
}

main().catch((err) => {
  console.error(
    '\n' + c.red(`${SIGN_CROSS} emoji:build failed: `) + err.message,
  )
  process.exit(1)
})
