#!/usr/bin/env node
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const OLD_SCOPE = '@reown'
const NEW_SCOPE = '@laughingwhales'

console.log(`🔄 Changing scope from ${OLD_SCOPE} to ${NEW_SCOPE}...\n`)

// Recursively find all package.json files
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

const packageJsonFiles = findPackageJsonFiles('packages')

let totalUpdated = 0
let totalDepsUpdated = 0

for (const filePath of packageJsonFiles) {
  const content = readFileSync(filePath, 'utf8')
  const pkg = JSON.parse(content)
  
  let updated = false
  let depsUpdated = 0
  
  // Update package name
  if (pkg.name && pkg.name.startsWith(OLD_SCOPE)) {
    const oldName = pkg.name
    pkg.name = pkg.name.replace(OLD_SCOPE, NEW_SCOPE)
    console.log(`  ✓ ${oldName} → ${pkg.name}`)
    updated = true
    totalUpdated++
  }
  
  // Update dependencies
  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
  
  for (const depType of depTypes) {
    if (pkg[depType]) {
      for (const [depName, version] of Object.entries(pkg[depType])) {
        if (depName.startsWith(OLD_SCOPE)) {
          const newDepName = depName.replace(OLD_SCOPE, NEW_SCOPE)
          pkg[depType][newDepName] = version
          delete pkg[depType][depName]
          depsUpdated++
          totalDepsUpdated++
        }
      }
    }
  }
  
  if (updated || depsUpdated > 0) {
    writeFileSync(filePath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
    if (depsUpdated > 0) {
      console.log(`    → Updated ${depsUpdated} internal dependencies`)
    }
  }
}

console.log(`\n✅ Done!`)
console.log(`   ${totalUpdated} packages renamed`)
console.log(`   ${totalDepsUpdated} dependency references updated`)

