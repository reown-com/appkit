// scripts/injectVersion.js
import fs from 'node:fs'
import packageJson from '../packages/appkit/package.json' assert { type: 'json' }

const filePath = 'packages/appkit/exports/constants.ts'

// const PACKAGE_VERSION = '0.0.4'

const fileContent = fs.readFileSync(filePath, 'utf8')
const updatedContent = fileContent.replace(
  /export const PACKAGE_VERSION = '.*'/,
  `export const PACKAGE_VERSION = '${packageJson.version}'`
)
fs.writeFileSync(filePath, updatedContent, 'utf8')
console.log(`Injected version ${packageJson.version} into ${filePath}`)
