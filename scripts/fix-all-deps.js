#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs'
import { join } from 'path'

const CUSTOM_SCOPE = '@laughingwhales'
const ORIGINAL_SCOPE = '@reown'

// Packages YOU actually customized (keep as @laughingwhales)
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

function findPackageJsonFiles(dir, fileList = []) {
  const files = readdirSync(dir)
  for (const file of files) {
    const filePath = join(dir, file)
    const stat = statSync(filePath)
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      findPackageJsonFiles(filePath, fileList)
    } else if (file === 'package.json') {
      fileList.push(filePath)
    }
  }
  return fileList
}

console.log('🔧 Fixing ALL dependency references to match hybrid scope...')
console.log('')

const packageJsonFiles = findPackageJsonFiles('packages')
  .concat(findPackageJsonFiles('apps'))
  .concat(findPackageJsonFiles('examples'))
let fixed = 0

for (const filePath of packageJsonFiles) {
  const content = readFileSync(filePath, 'utf8')
  const pkg = JSON.parse(content)
  let changed = false

  // Fix dependencies
  if (pkg.dependencies) {
    for (const [dep, version] of Object.entries(pkg.dependencies)) {
      if (dep.startsWith(CUSTOM_SCOPE) && !KEEP_CUSTOM.includes(dep)) {
        // This should be @reown scope
        const originalDep = dep.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
        delete pkg.dependencies[dep]
        pkg.dependencies[originalDep] = version
        changed = true
      } else if (
        dep.startsWith(ORIGINAL_SCOPE) &&
        KEEP_CUSTOM.includes(dep.replace(ORIGINAL_SCOPE, CUSTOM_SCOPE))
      ) {
        // This should be @laughingwhales scope
        const customDep = dep.replace(ORIGINAL_SCOPE, CUSTOM_SCOPE)
        delete pkg.dependencies[dep]
        pkg.dependencies[customDep] = version
        changed = true
      }
    }
  }

  // Fix devDependencies
  if (pkg.devDependencies) {
    for (const [dep, version] of Object.entries(pkg.devDependencies)) {
      if (dep.startsWith(CUSTOM_SCOPE) && !KEEP_CUSTOM.includes(dep)) {
        const originalDep = dep.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
        delete pkg.devDependencies[dep]
        pkg.devDependencies[originalDep] = version
        changed = true
      } else if (
        dep.startsWith(ORIGINAL_SCOPE) &&
        KEEP_CUSTOM.includes(dep.replace(ORIGINAL_SCOPE, CUSTOM_SCOPE))
      ) {
        const customDep = dep.replace(ORIGINAL_SCOPE, CUSTOM_SCOPE)
        delete pkg.devDependencies[dep]
        pkg.devDependencies[customDep] = version
        changed = true
      }
    }
  }

  // Fix peerDependencies
  if (pkg.peerDependencies) {
    for (const [dep, version] of Object.entries(pkg.peerDependencies)) {
      if (dep.startsWith(CUSTOM_SCOPE) && !KEEP_CUSTOM.includes(dep)) {
        const originalDep = dep.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
        delete pkg.peerDependencies[dep]
        pkg.peerDependencies[originalDep] = version
        changed = true
      } else if (
        dep.startsWith(ORIGINAL_SCOPE) &&
        KEEP_CUSTOM.includes(dep.replace(ORIGINAL_SCOPE, CUSTOM_SCOPE))
      ) {
        const customDep = dep.replace(ORIGINAL_SCOPE, CUSTOM_SCOPE)
        delete pkg.peerDependencies[dep]
        pkg.peerDependencies[customDep] = version
        changed = true
      }
    }
  }

  if (changed) {
    writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
    console.log(`🔧 Fixed: ${filePath}`)
    fixed++
  }
}

console.log('')
console.log(`📊 Fixed ${fixed} files`)
console.log('')
console.log('Now run: pnpm install')
