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

console.log('🔄 Reverting unused packages back to @reown/* scope...')
console.log('')

const packageJsonFiles = findPackageJsonFiles('packages')
let reverted = 0
let kept = 0

for (const filePath of packageJsonFiles) {
  const content = readFileSync(filePath, 'utf8')
  const pkg = JSON.parse(content)

  if (pkg.name && pkg.name.startsWith(CUSTOM_SCOPE)) {
    if (KEEP_CUSTOM.includes(pkg.name)) {
      console.log(`✅ Keeping: ${pkg.name}`)
      kept++
    } else {
      // Revert this package back to @reown
      const originalName = pkg.name.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)

      // Update package name
      pkg.name = originalName

      // Update dependencies to use @reown scope
      if (pkg.dependencies) {
        for (const [dep, version] of Object.entries(pkg.dependencies)) {
          if (dep.startsWith(CUSTOM_SCOPE)) {
            const originalDep = dep.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
            delete pkg.dependencies[dep]
            pkg.dependencies[originalDep] = version
          }
        }
      }

      // Update devDependencies
      if (pkg.devDependencies) {
        for (const [dep, version] of Object.entries(pkg.devDependencies)) {
          if (dep.startsWith(CUSTOM_SCOPE)) {
            const originalDep = dep.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
            delete pkg.devDependencies[dep]
            pkg.devDependencies[originalDep] = version
          }
        }
      }

      // Update peerDependencies
      if (pkg.peerDependencies) {
        for (const [dep, version] of Object.entries(pkg.peerDependencies)) {
          if (dep.startsWith(CUSTOM_SCOPE)) {
            const originalDep = dep.replace(CUSTOM_SCOPE, ORIGINAL_SCOPE)
            delete pkg.peerDependencies[dep]
            pkg.peerDependencies[originalDep] = version
          }
        }
      }

      writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n')
      console.log(`🔄 Reverted: ${pkg.name}`)
      reverted++
    }
  }
}

console.log('')
console.log(`📊 Summary:`)
console.log(`   ✅ Kept custom: ${kept}`)
console.log(`   🔄 Reverted: ${reverted}`)
console.log('')
console.log('Next steps:')
console.log('1. Run: pnpm install')
console.log('2. Update your app to use mix of @reown/* and @laughingwhales/*')
console.log('3. Test that everything works')
