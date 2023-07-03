/* eslint-disable no-await-in-loop */
import { danger, fail, warn } from 'danger'

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
  fail('Non npm lockfile(s) detected (yarn / pnpm), please use npm')
}

async function checkStrictDependencies() {
  for (const f of packageJsons) {
    const diff = await diffForFile(f)
    if (diff && (diff.added.includes('^') || diff.added.includes('~'))) {
      fail(`Loose dependency versions in ${f}, please use strict versioning`)
    }
  }
}
checkStrictDependencies()

// -- Ui Package Checks -------------------------------------------------------
async function checkCreatedUiFiles() {
  const created_ui_components = created_files.filter(f => f.includes('ui/src/components'))
  const created_ui_composites = created_files.filter(f => f.includes('ui/src/composites'))
  const create_ui_components_tests = created_files.filter(f => f.includes('stories/components'))
  const create_ui_composites_tests = created_files.filter(f => f.includes('stories/composites'))
  const ui_index_diff = await diffForFile('ui/index.ts')

  if (created_ui_components.length && !ui_index_diff?.added.includes('src/components')) {
    fail('New components were added, but not exported in ui/index.ts')
  }

  if (created_ui_composites.length && !ui_index_diff?.added.includes('src/composites')) {
    fail('New composites were added, but not exported in ui/index.ts')
  }

  if (created_ui_components.length && !create_ui_components_tests.length) {
    fail('New components were added, but no tests were created')
  }

  if (created_ui_composites.length && !create_ui_composites_tests.length) {
    fail('New composites were added, but no tests were created')
  }
}
checkCreatedUiFiles()
