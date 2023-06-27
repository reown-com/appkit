/* eslint-disable no-await-in-loop */
import { danger, warn, fail } from 'danger'

// -- Data --------------------------------------------------------------------
const { modified_files, created_files, deleted_files, diffForFile } = danger.git
const updated_files = [...modified_files, ...created_files]
const all_files = [...updated_files, ...created_files, ...deleted_files]
const packageJsons = all_files.filter(f => f.includes('package.json'))
const packageLock = updated_files.find(f => f.includes('package-lock.json'))
const yarnLock = updated_files.find(f => f.includes('yarn.lock'))
const pnpmLock = updated_files.find(f => f.includes('pnpm-lock.yaml'))

// -- Dependency Checks -------------------------------------------------------
if (packageJsons.length && !packageLock) {
  warn('Changes were made to one or more package.json(s), but not to package-lock.json')
}

if (yarnLock || pnpmLock) {
  fail('yarn or pnpm lockfile(s) detected, please use npm')
}

async function checkStrictDependencies() {
  for (const f of packageJsons) {
    const diff = await diffForFile(f)
    if (diff && (diff.added.includes('^') || diff.added.includes('~'))) {
      fail(`${f} should use strict dependency versions`)
    }
  }
}
checkStrictDependencies()
