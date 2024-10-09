/**
 * This script injects the version from the packages/appkit/package.json into the packages/appkit/exports/constants.ts file.
 * This is a alternative solution to not import the package.json file in our packages due to restriction on bundlers.
 * It's run before the build process of the packages starts with `prebuild` script.
 * See https://pnpm.io/it/next/cli/run#enable-pre-post-scripts
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const packageJsonPath = path.join(__dirname, '../packages/appkit/package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

const filePath = 'packages/appkit/exports/constants.ts'

const fileContent = fs.readFileSync(filePath, 'utf8')
const updatedContent = fileContent.replace(
  /export const PACKAGE_VERSION = '.*'/,
  `export const PACKAGE_VERSION = '${packageJson.version}'`
)
fs.writeFileSync(filePath, updatedContent, 'utf8')
console.log(`Injected version ${packageJson.version} into ${filePath}`)
