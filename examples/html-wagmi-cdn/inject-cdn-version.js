const fs = require('node:fs')
const path = require('node:path')
const { fileURLToPath } = require('node:url')

// Read version from appkit package.json
const appkitPackageJsonPath = path.join(__dirname, '../../packages/appkit/package.json')
const appkitPackageJson = JSON.parse(fs.readFileSync(appkitPackageJsonPath, 'utf8'))
const appkitVersion = appkitPackageJson.version

// Inject version into HTML file
const htmlPath = path.join(__dirname, 'index.html')
let htmlContent = fs.readFileSync(htmlPath, 'utf8')

// Regular expression to match both __VERSION__ and any semver version
const versionRegex = /@reown\/appkit-cdn@(__VERSION__|[\d.]+)/

if (versionRegex.test(htmlContent)) {
  htmlContent = htmlContent.replace(versionRegex, `@reown/appkit-cdn@${appkitVersion}`)
  fs.writeFileSync(htmlPath, htmlContent, 'utf8')
  console.log(`Version ${appkitVersion} injected into HTML file.`)
} else {
  console.warn('Version placeholder not found in HTML file. No changes made.')
}
