const fs = require('node:fs')
const path = require('node:path')
const { fileURLToPath } = require('node:url')

// Read version from appkit package.json
const appkitPackageJsonPath = path.join(__dirname, '../../packages/appkit/package.json')
const appkitPackageJson = JSON.parse(fs.readFileSync(appkitPackageJsonPath, 'utf8'))
const appkitVersion = appkitPackageJson.version

// Inject version into main.js file
const mainJsPath = path.join(__dirname, 'main.js')
let mainJsContent = fs.readFileSync(mainJsPath, 'utf8')

// Regular expression to match both __VERSION__ and any semver version
const versionRegex = /@reown\/appkit-cdn@(__VERSION__|[\d.]+)/

if (versionRegex.test(mainJsContent)) {
  mainJsContent = mainJsContent.replace(versionRegex, `@reown/appkit-cdn@${appkitVersion}`)
  fs.writeFileSync(mainJsPath, mainJsContent, 'utf8')
  console.log(`Version ${appkitVersion} injected into main.js file.`)
} else {
  console.warn('Version placeholder not found in main.js file. No changes made.')
}
