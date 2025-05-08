/* eslint-disable no-await-in-loop */
import { danger, fail, message, warn } from 'danger'

// -- Constants ---------------------------------------------------------------
const TYPE_COMMENT = `// -- Types --------------------------------------------- //`
const STATE_COMMENT = `// -- State --------------------------------------------- //`
const CONTROLLER_COMMENT = `// -- Controller ---------------------------------------- //`
const RENDER_COMMENT = `// -- Render -------------------------------------------- //`
const STATE_PROPERTIES_COMMENT = `// -- State & Properties -------------------------------- //`
const PRIVATE_COMMENT = `// -- Private ------------------------------------------- //`
const RELATIVE_IMPORT_SAME_DIR = `'./`
const RELATIVE_IMPORT_PARENT_DIR = `'../`
const RELATIVE_IMPORT_EXTENSION = `.js'`
const PRIVATE_FUNCTION_REGEX = /private\s+(?:\w+)\s*\(\s*\)/gu

// -- Data --------------------------------------------------------------------
const { modified_files, created_files, deleted_files, diffForFile } = danger.git
const updated_files = [...modified_files, ...created_files].filter(f => !f.includes('dangerfile'))
const all_files = [...updated_files, ...created_files, ...deleted_files].filter(
  f => !f.includes('dangerfile')
)

// -- Dependency Checks -------------------------------------------------------
async function checkPackageJsons() {
  const packageJsons = all_files.filter(f => f.includes('package.json'))
  const pnpmLock = updated_files.find(f => f.includes('pnpm-lock.yaml'))
  const yarnLock = updated_files.find(f => f.includes('yarn.lock'))
  const npmLock = updated_files.find(f => f.includes('package-lock.json'))

  if (packageJsons.length && !pnpmLock) {
    warn('Changes were made to one or more package.json(s), but not to pnpm-lock.yaml')
  }

  if (yarnLock || npmLock) {
    fail('Non pnpm lockfile(s) detected (yarn / npm), please use pnpm')
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
  const deleted_ui_composites = deleted_files.filter(f => f.includes('ui/src/composites'))
  const created_ui_layout = created_files.filter(f => f.includes('ui/src/layout'))
  const deleted_ui_layout = deleted_files.filter(f => f.includes('ui/src/layout'))
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

    if (diff?.added.includes('import @reown/appkit-controllers')) {
      fail(`${f} is importing @reown/appkit-controllers, which is not allowed in ui package`)
    }

    if (!diff?.added.includes(RENDER_COMMENT) && diff?.added.includes('render()')) {
      fail(`${f} is missing \`${RENDER_COMMENT}\` comment`)
    }

    if (diff?.added.includes('@property(') && !diff.added.includes(STATE_PROPERTIES_COMMENT)) {
      fail(`${f} is missing \`${STATE_PROPERTIES_COMMENT}\` comment`)
    }

    const privateFunctionsAdded = diff?.added.match(PRIVATE_FUNCTION_REGEX)?.length

    if (privateFunctionsAdded && !diff?.added.includes(PRIVATE_COMMENT)) {
      message(
        `${f} is missing \`${PRIVATE_COMMENT}\` comment, but seems to have private members. Check if this is correct`
      )
    }

    if (!diff?.added.includes(`@customElement('wui-`)) {
      fail(`${f} is a ui element, but does not define wui- prefix`)
    }

    if (diff?.added.includes('@reown/appkit-ui/')) {
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
  const types_util_index = modified_files.find(f => f.includes('ui/src/utils/JSXTypeUtil.ts'))
  const types_util_diff = types_util_index ? await diffForFile(types_util_index) : undefined
  const created_ui_components_index_ts = created_ui_components.filter(f => f.endsWith('index.ts'))
  const created_ui_composites_index_ts = created_ui_composites.filter(f => f.endsWith('index.ts'))
  const deleted_ui_composites_index_ts = deleted_ui_composites.filter(f => f.endsWith('index.ts'))
  const is_new_composites_added =
    created_ui_composites_index_ts.length > deleted_ui_composites_index_ts.length
  const created_ui_layout_index_ts = created_ui_layout.filter(f => f.endsWith('index.ts'))
  const deleted_ui_layout_index_ts = deleted_ui_layout.filter(f => f.endsWith('index.ts'))
  const is_new_layout_added = created_ui_layout_index_ts.length > deleted_ui_layout_index_ts.length

  if (created_ui_components_index_ts.length && !ui_index_diff?.added.includes('src/components')) {
    fail('New components were added, but not exported in ui/index.ts')
  }

  if (is_new_composites_added && !types_util_diff) {
    fail('New composites were added, but JSXTypeUtil.ts is not modified')
  }

  if (created_ui_layout_index_ts.length && !ui_index_diff?.added.includes('src/layout')) {
    fail('New layout components were added, but not exported in ui/index.ts')
  }

  if (created_ui_components_index_ts.length && !types_util_diff?.added.includes('../components')) {
    fail(
      `New components were added, but not exported in ui/utils/JSXTypeUtil.ts: ${created_ui_components.join(
        ', '
      )}`
    )
  }

  if (is_new_composites_added && !types_util_diff?.added.includes('../composites')) {
    fail('New composites were added, but not exported in ui/utils/JSXTypeUtil.ts')
  }

  if (is_new_layout_added && !types_util_diff?.added.includes('../layout')) {
    fail('New layout components were added, but not exported in ui/utils/JSXTypeUtil.ts')
  }

  if (created_ui_components.length && !created_ui_components_stories.length) {
    fail('New components were added, but no stories were created')
  }

  if (is_new_composites_added && !created_ui_composites_stories.length) {
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

  const modified_core_controllers = modified_files.filter(f => f.includes('core/src/controllers'))
  const modified_core_controllers_tests = modified_files.filter(f =>
    f.includes('core/tests/controllers')
  )

  for (const f of created_core_controllers) {
    const diff = await diffForFile(f)

    if (diff?.added.includes('import @reown/appkit-ui')) {
      fail(`${f} is importing @reown/appkit-ui, which is not allowed in core package`)
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

    if (diff?.added.includes('@reown/appkit-controllers/')) {
      fail(`${f} should use relative imports instead of direct package access`)
    }

    if (diff?.added.includes("'valtio'")) {
      fail(`${f} is importing valtio, but should use valtio/vanilla`)
    }
  }

  if (created_core_controllers.length && !created_core_controllers_tests.length) {
    fail('New controllers were added, but no tests were created')
  }

  if (modified_core_controllers.length && !modified_core_controllers_tests) {
    message(`
      The following controllers were modified, but not tests were changed:
      ${modified_core_controllers.join('\n')}
    `)
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

    if (!diff?.added.includes(RENDER_COMMENT) && diff?.added.includes('render()')) {
      fail(`${f} is missing \`${RENDER_COMMENT}\` comment`)
    }

    if (
      (diff?.added.includes('@state(') || diff?.added.includes('@property(')) &&
      !diff.added.includes(STATE_PROPERTIES_COMMENT)
    ) {
      fail(`${f} is missing \`${STATE_PROPERTIES_COMMENT}\` comment`)
    }

    const privateFunctionsAdded = diff?.added.match(PRIVATE_FUNCTION_REGEX)?.length

    if (privateFunctionsAdded && !diff?.added.includes(PRIVATE_COMMENT)) {
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
      diff?.added.includes('@reown/appkit-controllers/') ||
      diff?.added.includes('@reown/appkit-ui/') ||
      diff?.added.includes('@reown/scaffold/')
    ) {
      fail(`${f} should use relative imports instead of direct package access`)
    }
  }
}
checkScaffoldHtmlPackage()

// -- Client(s) Package Checks ----------------------------------------------------

// -- Helper functions
function isRelativeImport(addition: string | undefined) {
  const sameDir = addition?.includes(RELATIVE_IMPORT_SAME_DIR)
  const parentDir = addition?.includes(RELATIVE_IMPORT_PARENT_DIR)

  return sameDir || parentDir
}
function containsRelativeImportWithoutJSExtension(addition: string | undefined) {
  const hasImportStatement = addition?.includes('import')
  const lacksJSExtension = !addition?.includes(RELATIVE_IMPORT_EXTENSION)
  const hasRelativePath = isRelativeImport(addition)

  return hasImportStatement && lacksJSExtension && hasRelativePath
}
async function checkClientPackages() {
  const client_files = modified_files.filter(f =>
    /\/packages\/(?:wagmi|solana|ethers|ethers5)\//u.test(f)
  )

  for (const f of client_files) {
    const diff = await diffForFile(f)

    if (diff?.added.includes("from '@reown/appkit-controllers")) {
      fail(`${f} is not allowed to import from @reown/appkit-controllers`)
    }

    if (diff?.added.includes("from '@reown/appkit-ui")) {
      fail(`${f} is not allowed to import from @reown/appkit-ui`)
    }

    if (containsRelativeImportWithoutJSExtension(diff?.added)) {
      fail(`${f} contains relative imports without .js extension`)
    }
  }
}
checkClientPackages()

// -- Check wallet ------------------------------------------------------------

async function checkWallet() {
  const wallet_files = modified_files.filter(f => f.includes('/wallet/'))
  for (const f of wallet_files) {
    const diff = await diffForFile(f)
    if (f.includes('W3mFrameConstants') && diff?.added.includes('SECURE_SITE_SDK')) {
      warn('Secure site URL has been changed')
    }
  }
}

checkWallet()

// -- Check laboratory ------------------------------------------------------------

async function checkLaboratory() {
  const lab_files = modified_files.filter(f => f.includes('/laboratory/'))
  for (const f of lab_files) {
    const diff = await diffForFile(f)
    if (f.includes('project') && (diff?.removed.includes('spec') || diff?.added.includes('spec'))) {
      warn('Testing spec changed')
    }
  }

  // Check that no .only is present in tests
  const test_files = lab_files.filter(f => f.includes('.spec.ts'))
  for (const f of test_files) {
    const fileContent = await danger.github.utils.fileContents(f)
    if (fileContent.includes('.only')) {
      fail(`${f} contains .only, please remove it`)
    }
  }
}

checkLaboratory()

// -- Check left over development constants ---------------------------------------
async function checkDevelopmentConstants() {
  for (const f of updated_files) {
    if (f.includes('README.md') || f.includes('.yml')) {
      // eslint-disable-next-line no-continue
      continue
    }
    const diff = await diffForFile(f)
    const fileContent = await danger.github.utils.fileContents(f)

    if (diff?.added.includes('localhost:') && !fileContent.includes('// Allow localhost')) {
      warn(`${f} uses localhost: which is likely a mistake`)
    }
  }
}
checkDevelopmentConstants()

// -- Check changesets ------------------------------------------------------------
async function checkChangesetFiles() {
  const changesetFiles = updated_files
    .filter(f => f.startsWith('.changeset/'))
    .filter(f => f.endsWith('.md') && !f.startsWith('README.md'))

  const ignoredChangesetFiles = [
    '@apps/gallery-new',
    '@reown/appkit-ui-new',
    '@reown/appkit-scaffold-ui-new',
    '@apps/laboratory-new',
    '@reown/appkit-new'
  ]

  for (const f of changesetFiles) {
    const fileContent = await danger.github.utils.fileContents(f)

    if (fileContent.includes('@examples/')) {
      fail(`Changeset file ${f} cannot include @examples/* packages as part of the changeset`)
    }

    if (ignoredChangesetFiles.some(ignored => fileContent.includes(ignored))) {
      fail(
        `Changeset file ${f} cannot include ${ignoredChangesetFiles
          .map(changesetFile => changesetFile)
          .join(', ')} packages as part of the changeset`
      )
    }
  }
}
checkChangesetFiles()

// -- Check Workflows ------------------------------------------------------------
function checkWorkflows() {
  const updatedWorkflows = updated_files.filter(f => f.includes('.github/workflows/'))
  const deletedWorkflows = deleted_files.filter(f => f.includes('.github/workflows/'))

  for (const f of deletedWorkflows) {
    fail(`Workflow file(s) ${f} has been deleted`)
  }

  for (const f of updatedWorkflows) {
    warn(`Workflow file ${f} has been modified`)
  }
}
checkWorkflows()

// - Check for keys in the codebase
async function checkForKeys() {
  const allFiles = [...updated_files, ...created_files]

  for (const f of allFiles) {
    const fileContent = await danger.github.utils.fileContents(f)

    if (fileContent.toLowerCase().includes('key') || fileContent.toLowerCase().includes('secret')) {
      warn(`File ${f} contains a KEY or SECRET`)
    }
  }
}
checkForKeys()
