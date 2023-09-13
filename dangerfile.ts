/* eslint-disable no-await-in-loop */
import { danger, fail, message, warn } from 'danger'
import corePackageJson from './packages/core/package.json' assert { type: 'json' }
import { VERSION as WAGMI_PACKAGE_VERSION } from './packages/wagmi/src/utils/constants'

// -- Constants ---------------------------------------------------------------
const TYPE_COMMENT = `// -- Types --------------------------------------------- //`
const STATE_COMMENT = `// -- State --------------------------------------------- //`
const CONTROLLER_COMMENT = `// -- Controller ---------------------------------------- //`
const RENDER_COMMENT = `// -- Render -------------------------------------------- //`
const STATE_PROPERTIES_COMMENT = `// -- State & Properties -------------------------------- //`
const PRIVATE_COMMENT = `// -- Private ------------------------------------------- //`

// -- Data --------------------------------------------------------------------
const { modified_files, created_files, deleted_files, diffForFile } = danger.git
const updated_files = [...modified_files, ...created_files]
const all_files = [...updated_files, ...created_files, ...deleted_files]

// -- Dependency Checks -------------------------------------------------------
async function checkPackageJsons() {
  const packageJsons = all_files.filter(f => f.includes('package.json'))
  const packageLock = updated_files.find(f => f.includes('package-lock.json'))
  const yarnLock = updated_files.find(f => f.includes('yarn.lock'))
  const pnpmLock = updated_files.find(f => f.includes('pnpm-lock.yaml'))

  if (packageJsons.length && !packageLock) {
    warn('Changes were made to one or more package.json(s), but not to package-lock.json')
  }

  if (yarnLock || pnpmLock) {
    fail('Non npm lockfile(s) detected (yarn / pnpm), please use npm')
  }

  for (const f of packageJsons) {
    const diff = await diffForFile(f)
    if (diff?.added.includes('^') || diff?.added.includes('~')) {
      fail(`Loose dependency versions in ${f}, please use strict versioning`)
    }
  }
}
checkPackageJsons()

// -- Ui Package Checks -------------------------------------------------------
async function checkUiPackage() {
  const created_ui_components = created_files.filter(f => f.includes('ui/src/components'))
  const created_ui_composites = created_files.filter(f => f.includes('ui/src/composites'))
  const created_ui_layout = created_files.filter(f => f.includes('ui/src/layout'))
  const created_ui_files = [
    ...created_ui_components,
    ...created_ui_composites,
    ...created_ui_layout
  ]
  const created_ui_index_files = created_ui_files.filter(f => f.includes('index.ts'))
  const created_ui_style_files = created_ui_files.filter(f => f.includes('styles.ts'))

  for (const f of created_ui_index_files) {
    const diff = await diffForFile(f)

    if (!diff?.added.includes('[resetStyles')) {
      fail(`${f} does not apply resetStyles`)
    }

    if (diff?.added.includes('@state(')) {
      fail(`${f} is using @state decorator, which is not allowed in ui package`)
    }

    if (diff?.added.includes('import @web3modal/core')) {
      fail(`${f} is importing @web3modal/core, which is not allowed in ui package`)
    }

    if (!diff?.added.includes(RENDER_COMMENT)) {
      fail(`${f} is missing \`${RENDER_COMMENT}\` comment`)
    }

    if (diff?.added.includes('@property(') && !diff.added.includes(STATE_PROPERTIES_COMMENT)) {
      fail(`${f} is missing \`${STATE_PROPERTIES_COMMENT}\` comment`)
    }

    if (diff?.added.includes('private ') && !diff.added.includes(PRIVATE_COMMENT)) {
      message(
        `${f} is missing \`${PRIVATE_COMMENT}\` comment, but seems to have private members. Check if this is correct`
      )
    }

    if (!diff?.added.includes(`@customElement('wui-`)) {
      fail(`${f} is a ui element, but does not define wui- prefix`)
    }

    if (diff?.added.includes('@web3modal/ui/')) {
      fail(`${f} should use relative imports instead of direct package access`)
    }
  }

  for (const f of created_ui_style_files) {
    const diff = await diffForFile(f)

    if (diff?.added.includes(':host') && !diff.added.includes('display: ')) {
      fail(`${f} uses :host container, but does not set display style on it`)
    }
  }

  const created_ui_components_stories = created_files.filter(f =>
    f.includes('gallery/stories/components')
  )
  const created_ui_composites_stories = created_files.filter(f =>
    f.includes('gallery/stories/composites')
  )
  const created_ui_layout_stories = created_files.filter(f => f.includes('gallery/stories/layout'))

  const ui_index = modified_files.find(f => f.includes('ui/index.ts'))
  const ui_index_diff = ui_index ? await diffForFile(ui_index) : undefined

  if (created_ui_components.length && !ui_index_diff?.added.includes('src/components')) {
    fail('New components were added, but not exported in ui/index.ts')
  }

  if (created_ui_composites.length && !ui_index_diff?.added.includes('src/composites')) {
    fail('New composites were added, but not exported in ui/index.ts')
  }

  if (created_ui_layout.length && !ui_index_diff?.added.includes('src/layout')) {
    fail('New layout components were added, but not exported in ui/index.ts')
  }

  if (created_ui_components.length && !created_ui_components_stories.length) {
    fail('New components were added, but no stories were created')
  }

  if (created_ui_composites.length && !created_ui_composites_stories.length) {
    fail('New composites were added, but no stories were created')
  }

  if (created_ui_layout.length && !created_ui_layout_stories.length) {
    fail('New layout components were added, but no stories were created')
  }
}
checkUiPackage()

// -- Core Package Checks -----------------------------------------------------
async function checkCorePackage() {
  const created_core_controllers = created_files.filter(f => f.includes('core/src/controllers'))
  const created_core_controllers_tests = created_files.filter(f =>
    f.includes('core/tests/controllers')
  )

  for (const f of created_core_controllers) {
    const diff = await diffForFile(f)

    if (diff?.added.includes('import @web3modal/ui')) {
      fail(`${f} is importing @web3modal/ui, which is not allowed in core package`)
    }

    if (!diff?.added.includes(TYPE_COMMENT)) {
      fail(`${f} is missing \`${TYPE_COMMENT}\` comment`)
    }

    if (!diff?.added.includes(STATE_COMMENT)) {
      fail(`${f} is missing \`${STATE_COMMENT}\` comment`)
    }

    if (!diff?.added.includes(CONTROLLER_COMMENT)) {
      fail(`${f} is missing \`${CONTROLLER_COMMENT}\` comment`)
    }

    if (diff?.added.includes('this.state')) {
      fail(`${f} is using this.state, use just state`)
    }

    if (diff?.added.includes('@web3modal/core/')) {
      fail(`${f} should use relative imports instead of direct package access`)
    }

    if (diff?.added.includes("'valtio'")) {
      fail(`${f} is importing valtio, but should use valtio/vanilla`)
    }
  }

  if (created_core_controllers.length && !created_core_controllers_tests.length) {
    fail('New controllers were added, but no tests were created')
  }
}
checkCorePackage()

// -- Scaffold Html Package Checks --------------------------------------------
async function checkScaffoldHtmlPackage() {
  const created_modal = created_files.filter(f => f.includes('scaffold/src/modal'))
  const created_pages = created_files.filter(f => f.includes('scaffold/src/pages'))
  const created_partials = created_files.filter(f => f.includes('scaffold/src/partials'))
  const created_scaffold_files = [...created_modal, ...created_pages, ...created_partials]
  const created_scaffold_index_files = created_scaffold_files.filter(f => f.includes('index.ts'))

  for (const f of created_scaffold_index_files) {
    const diff = await diffForFile(f)

    if (!diff?.added.includes(RENDER_COMMENT)) {
      fail(`${f} is missing \`${RENDER_COMMENT}\` comment`)
    }

    if (
      (diff?.added.includes('@state(') || diff?.added.includes('@property(')) &&
      !diff.added.includes(STATE_PROPERTIES_COMMENT)
    ) {
      fail(`${f} is missing \`${STATE_PROPERTIES_COMMENT}\` comment`)
    }

    if (diff?.added.includes('private ') && !diff.added.includes(PRIVATE_COMMENT)) {
      message(
        `${f} is missing \`${PRIVATE_COMMENT}\` comment, but seems to have private members. Check if this is correct`
      )
    }

    if (!diff?.added.includes(`@customElement('w3m-`)) {
      fail(`${f} is a scaffold element, but does not define w3m- prefix`)
    }

    if (diff?.added.includes('.subscribe') && !diff.added.includes('this.unsubscribe.forEach')) {
      fail(`${f} is subscribing to controller states without unsubscribe logic`)
    }

    if (
      diff?.added.includes('@web3modal/core/') ||
      diff?.added.includes('@web3modal/ui/') ||
      diff?.added.includes('@web3modal/scaffold/')
    ) {
      fail(`${f} should use relative imports instead of direct package access`)
    }
  }
}
checkScaffoldHtmlPackage()

// -- Client(s) Package Checks ----------------------------------------------------
async function checkClientPackages() {
  const wagmi_files = modified_files.filter(f => f.includes('/wagmi/'))

  for (const f of wagmi_files) {
    const diff = await diffForFile(f)

    if (diff?.added.includes('@web3modal/core')) {
      fail(`${f} is not allowed to import from @web3modal/core`)
    }

    if (diff?.added.includes('@web3modal/ui')) {
      fail(`${f} is not allowed to import from @web3modal/ui`)
    }
  }
}
checkClientPackages()

// -- Check sdkVersion ------------------------------------------------------------
function checkSdkVersion() {
  if (WAGMI_PACKAGE_VERSION !== corePackageJson.version) {
    fail(`VERSION in wagmi/utils/constants does't match core package.json version`)
  }
}
checkSdkVersion()
