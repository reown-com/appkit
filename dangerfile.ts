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

async function checkPackageJsons() {
  for (const f of packageJsons) {
    const diff = await diffForFile(f)
    if (diff && (diff.added.includes('^') || diff.added.includes('~'))) {
      fail(`Loose dependency versions in ${f}, please use strict versioning`)
    }
  }
}
checkPackageJsons()

// -- Ui Package Checks -------------------------------------------------------
async function checkUiPackage() {
  const created_ui_components = created_files.filter(f => f.includes('ui/src/components'))
  const created_ui_composites = created_files.filter(f => f.includes('ui/src/composites'))
  const created_ui_components_stories = created_files.filter(f =>
    f.includes('gallery/stories/components')
  )
  const created_ui_composites_stories = created_files.filter(f =>
    f.includes('gallery/stories/composites')
  )
  const ui_index_diff = await diffForFile('ui/index.ts')

  if (created_ui_components.length && !ui_index_diff?.added.includes('src/components')) {
    fail('New components were added, but not exported in ui/index.ts')
  }

  if (created_ui_composites.length && !ui_index_diff?.added.includes('src/composites')) {
    fail('New composites were added, but not exported in ui/index.ts')
  }

  if (created_ui_components.length && !created_ui_components_stories.length) {
    fail('New components were added, but no tests were created')
  }

  if (created_ui_composites.length && !created_ui_composites_stories.length) {
    fail('New composites were added, but no tests were created')
  }
}
checkUiPackage()

// -- Core Package Checks -----------------------------------------------------
function checkCorePackage() {
  const created_core_controllers = created_files.filter(f => f.includes('core/src/controllers'))
  const created_core_controllers_tests = created_files.filter(f =>
    f.includes('core/tests/controllers')
  )

  if (created_core_controllers.length && !created_core_controllers_tests.length) {
    fail('New controllers were added, but no tests were created')
  }
}
checkCorePackage()
