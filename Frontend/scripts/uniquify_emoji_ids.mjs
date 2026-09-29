import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { c, log } from './_log.mjs'

const SVG_DIR = process.argv[2] || 'src/features/Emoji/svg'

function findUsedIds(source) {
  const ids = new Set()
  for (const m of source.matchAll(/\bid=["']([^"']+)["']/g)) ids.add(m[1])
  for (const m of source.matchAll(/url\(#([^)]+)\)/g)) ids.add(m[1])
  for (const m of source.matchAll(/(?:xlink)?[Hh]ref=["']#([^"']+)["']/g))
    ids.add(m[1])
  return ids
}

function uniquify(source, usedIds) {
  let result = source

  for (const id of usedIds) {
    const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    result = result.replace(
      new RegExp('\\bid=["\']' + escaped + '["\']', 'g'),
      'id={`' + id + '_${uid}`}',
    )

    result = result.replace(
      new RegExp(
        '(\\b(?:fill|stroke|clipPath|mask|filter))=["\']url\\(#' +
          escaped +
          '\\)["\']',
        'g',
      ),
      '$1={`url(#' + id + '_${uid})`}',
    )

    result = result.replace(
      new RegExp(
        '(fill|stroke|clipPath):\\s*["\']url\\(#' + escaped + '\\)["\']',
        'g',
      ),
      '$1: `url(#' + id + '_${uid})`',
    )

    result = result.replace(
      new RegExp('(href)=["\']#' + escaped + '["\']', 'g'),
      '$1={`#' + id + '_${uid}`}',
    )

    result = result.replace(
      new RegExp('xlinkHref=["\']#' + escaped + '["\']', 'g'),
      'href={`#' + id + '_${uid}`}',
    )
  }

  return result
}

function injectUseId(source) {
  let result = source

  if (!result.includes('useId')) {
    if (result.includes("import type { SVGProps } from 'react'")) {
      result = result.replace(
        "import type { SVGProps } from 'react'",
        "import { useId } from 'react'\nimport type { SVGProps } from 'react'",
      )
    } else {
      result = "import { useId } from 'react'\n" + result
    }
  }

  result = result.replace(
    /const (Svg\w+) = \(props: SVGProps<SVGSVGElement>\) => \(\n/,
    'const $1 = (props: SVGProps<SVGSVGElement>) => {\n' +
      "  const uid = useId().replace(/:/g, '')\n" +
      '  return (\n',
  )

  result = result.replace(
    /\n\)\n+export default (Svg\w+)/,
    '\n  )\n}\n\nexport default $1',
  )

  return result
}

function processFile(filePath) {
  const source = readFileSync(filePath, 'utf-8')
  const name = basename(filePath)

  if (source.includes('useId')) {
    log.skip(`${log.file(name)} — already processed`)
    return 'skipped'
  }

  const usedIds = findUsedIds(source)

  if (usedIds.size === 0) {
    log.skip(`${log.file(name)} — no ids`)
    return 'skipped'
  }

  let result = uniquify(source, usedIds)
  result = injectUseId(result)

  writeFileSync(filePath, result, 'utf-8')
  log.ok(`${log.file(name)} — ${log.count(usedIds.size, 'id')} uniquified`)
  return 'processed'
}

function walk(dir) {
  const stats = { processed: 0, skipped: 0 }

  function visit(current) {
    for (const entry of readdirSync(current)) {
      const full = join(current, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) {
        visit(full)
      } else if (entry.endsWith('.tsx')) {
        const result = processFile(full)
        if (result === 'processed') stats.processed++
        else if (result === 'skipped') stats.skipped++
      }
    }
  }

  visit(dir)
  return stats
}

log.step('Uniquifying emoji SVG ids')
const { processed, skipped } = walk(SVG_DIR)
console.log(
  '\n' +
    c.bold(
      `  ${log.count(processed, 'file')} processed, ${log.count(
        skipped,
        'file',
      )} skipped`,
    ),
)
