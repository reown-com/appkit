#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testsDir = path.join(__dirname, '..', 'tests')

const TAG_CALL = /getCanaryTagAndAnnotation\(/g
const WIRING_CALL = /afterEachCanary\(/

function listSpecFiles(dir) {
  const out = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...listSpecFiles(full))
    } else if (entry.name.endsWith('.spec.ts')) {
      out.push(full)
    }
  }
  return out
}

const specFiles = listSpecFiles(testsDir)
const offenders = []

for (const file of specFiles) {
  const content = readFileSync(file, 'utf8')
  const tagCount = (content.match(TAG_CALL) || []).length
  if (tagCount > 0 && !WIRING_CALL.test(content)) {
    offenders.push({ file: path.relative(process.cwd(), file), tagCount })
  }
}

if (offenders.length > 0) {
  console.error('Found @canary-tagged tests with no afterEachCanary() wiring in the same file:')
  for (const offender of offenders) {
    console.error(
      `  - ${offender.file} (${offender.tagCount} canary tag(s), 0 afterEachCanary() calls)`
    )
  }
  console.error(
    '\nEvery test tagged via getCanaryTagAndAnnotation() must have a matching afterEach(...) ' +
      'in the same file that calls afterEachCanary(testInfo, timingRecords) — otherwise the test ' +
      'runs under `pnpm playwright:test:canary` but never reports pass/fail to CloudWatch, so its ' +
      'Grafana alert silently stops reflecting reality. See apps/laboratory/tests/canary.spec.ts ' +
      'for the reference pattern.'
  )
  process.exit(1)
}

console.log(
  `OK: all canary-tagged spec files (${specFiles.length} spec files scanned) wire up afterEachCanary().`
)
