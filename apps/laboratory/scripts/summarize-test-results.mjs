#!/usr/bin/env node
import { readFileSync } from 'node:fs'

const [, , reportPath, label] = process.argv

if (!reportPath) {
  console.error('Usage: node summarize-test-results.mjs <path-to-playwright-json-report> [label]')
  process.exit(1)
}

let report
try {
  report = JSON.parse(readFileSync(reportPath, 'utf8'))
} catch {
  console.log(
    `## E2E results${label ? ' — ' + label : ''}\n\nNo report file found or it could not be parsed - see the raw job logs.`
  )
  process.exit(0)
}

// eslint-disable-next-line no-control-regex
const ANSI_PATTERN = /\u001b\[[0-9;]*m/g

function sanitizeForTable(value) {
  return String(value).replace(ANSI_PATTERN, '').replace(/\|/g, '\\|')
}

function collectSpecs(suite) {
  const specs = [...(suite.specs || [])]
  for (const child of suite.suites || []) {
    specs.push(...collectSpecs(child))
  }
  return specs
}

const failing = []
const selfHealed = []

for (const rootSuite of report.suites || []) {
  for (const spec of collectSpecs(rootSuite)) {
    for (const test of spec.tests || []) {
      const results = test.results || []
      if (results.length === 0) {
        continue
      }

      const finalResult = results[results.length - 1]
      const earlierResults = results.slice(0, -1)
      const hadEarlierFailure = earlierResults.some(result => result.status !== 'passed')
      const finalStatus = finalResult.status

      const row = {
        title: spec.title,
        project: test.projectName,
        attempts: results.length,
        finalStatus
      }

      if (finalStatus !== 'passed' && finalStatus !== 'skipped') {
        const message = finalResult.error?.message?.split('\n')[0] ?? '(no error message captured)'
        failing.push({ ...row, error: sanitizeForTable(message) })
      } else if (hadEarlierFailure) {
        selfHealed.push(row)
      }
    }
  }
}

const lines = [label ? `## E2E results — ${label}` : '## E2E results', '']

if (failing.length === 0) {
  lines.push('No failing tests in this run. ✅')
} else {
  lines.push(
    `### ❌ ${failing.length} failing test(s)`,
    '',
    '| Test | Project | Error |',
    '|---|---|---|'
  )
  for (const test of failing) {
    lines.push(
      `| ${sanitizeForTable(test.title)} | ${sanitizeForTable(test.project)} | ${test.error} |`
    )
  }
}

if (selfHealed.length > 0) {
  lines.push(
    '',
    `### 🔁 ${selfHealed.length} test(s) failed then passed on retry`,
    '',
    '| Test | Project | Attempts |',
    '|---|---|---|'
  )
  for (const test of selfHealed) {
    lines.push(
      `| ${sanitizeForTable(test.title)} | ${sanitizeForTable(test.project)} | ${test.attempts} |`
    )
  }
}

console.log(lines.join('\n'))
