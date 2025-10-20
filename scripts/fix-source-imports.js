#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

const CUSTOM_SCOPE = '@laughingwhales'
const ORIGINAL_SCOPE = '@reown'

// Packages we kept as @laughingwhales (everything else should be @reown)
const KEEP_CUSTOM = [
  '@laughingwhales/appkit',
  '@laughingwhales/appkit-adapter-polkadot',
  '@laughingwhales/appkit-adapter-solana',
  '@laughingwhales/appkit-common',
  '@laughingwhales/appkit-scaffold-ui',
  '@laughingwhales/appkit-siwx',
  '@laughingwhales/appkit-ui',
  '@laughingwhales/appkit-wallet-button'
]

function findSourceFiles(dir, fileList = []) {
  const files = readdirSync(dir)
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      findSourceFiles(filePath, fileList)
    } else if (
      file.endsWith('.ts') ||
      file.endsWith('.tsx') ||
      file.endsWith('.js') ||
      file.endsWith('.jsx')
    ) {
      fileList.push(filePath)
    }
  }
  return fileList
}

console.log('🔧 Fixing source code imports...')
console.log('')

const sourceFiles = findSourceFiles('packages')
let fixed = 0

for (const filePath of sourceFiles) {
  let content = readFileSync(filePath, 'utf8')
  let changed = false

  // Replace imports from @laughingwhales packages that were reverted to @reown
  const importRegex = /from ['"](@laughingwhales\/appkit[^'"]*)['"]/g
  const matches = [...content.matchAll(importRegex)]

  for (const match of matches) {
    const importPath = match[1]

    // Check if this package should be @reown instead
    if (!KEEP_CUSTOM.includes(importPath.split('/').slice(0, 2).join('/'))) {
      const originalImport = importPath.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
      content = content.replace(
        new RegExp(`from ['"]${importPath.replace(/\//g, '\\/')}['"]`, 'g'),
        `from '${originalImport}'`
      )
      changed = true
    }
  }

  // Also check import statements
  const importStatementRegex = /import ['"](@laughingwhales\/appkit[^'"]*)['"]/g
  const importMatches = [...content.matchAll(importStatementRegex)]

  for (const match of importMatches) {
    const importPath = match[1]

    if (!KEEP_CUSTOM.includes(importPath.split('/').slice(0, 2).join('/'))) {
      const originalImport = importPath.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
      content = content.replace(
        new RegExp(`import ['"]${importPath.replace(/\//g, '\\/')}['"]`, 'g'),
        `import '${originalImport}'`
      )
      changed = true
    }
  }

  // Also check dynamic import() statements (including multi-line)
  const dynamicImportRegex = /import\(\s*['"](@laughingwhales\/appkit[^'"]*)['"]\s*\)/gs
  const dynamicMatches = [...content.matchAll(dynamicImportRegex)]

  for (const match of dynamicMatches) {
    const importPath = match[1]

    if (!KEEP_CUSTOM.includes(importPath.split('/').slice(0, 2).join('/'))) {
      const originalImport = importPath.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
      // Replace the entire match to preserve formatting
      const originalMatch = match[0]
      const newMatch = originalMatch.replace(importPath, originalImport)
      content = content.replace(originalMatch, newMatch)
      changed = true
    }
  }

  if (changed) {
    writeFileSync(filePath, content)
    console.log(`🔧 Fixed: ${filePath}`)
    fixed++
  }
}

console.log('')
console.log(`📊 Fixed ${fixed} files`)
console.log('')
console.log('Now run: pnpm build')
