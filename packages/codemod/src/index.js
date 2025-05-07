#!/usr/bin/env node
import chalk from 'chalk'
import fs from 'fs'
import latestVersion from 'latest-version'
import path from 'path'

const IGNORED_FOLDERS = ['node_modules', 'ui-new', '.git', 'dist']

// Function to recursively find all package.json files
function findAllPackageJsonFiles(dir, maxDepth = 5, depth = 0) {
  if (depth > maxDepth) return []
  let packageJsonFiles = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory() && !IGNORED_FOLDERS.includes(entry.name)) {
      packageJsonFiles = packageJsonFiles.concat(
        findAllPackageJsonFiles(fullPath, maxDepth, depth + 1)
      )
    } else if (entry.isFile() && entry.name === 'package.json') {
      // console.log(`Found ${chalk.bgGray(fullPath)}`)
      packageJsonFiles.push(fullPath)
    }
  }

  return packageJsonFiles
}

// Function to update dependencies in all relevant package.json files
async function updateDependencies(packages) {
  const rootDir = path.resolve(new URL('.', import.meta.url).pathname, '../../../')
  const packageJsonFiles = findAllPackageJsonFiles(rootDir)

  for (const packageJsonPath of packageJsonFiles) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

      for (const pkg of packages) {
        if (pkg.endsWith('/*')) {
          // Handle wildcard patterns
          const org = pkg.slice(0, -2)
          const dependencies = packageJson.dependencies || {}
          const matchingPackages = Object.keys(dependencies).filter(dep => dep.startsWith(org))

          for (const matchingPkg of matchingPackages) {
            await updatePackageVersion(packageJson, matchingPkg, packageJsonPath)
          }
        } else {
          const currentVersion =
            packageJson.dependencies?.[pkg] ||
            packageJson.peerDependencies?.[pkg] ||
            packageJson.optionalDependencies?.[pkg]
          // Handle specific package names
          if (packageJson.dependencies && currentVersion) {
            await updatePackageVersion(packageJson, pkg, packageJsonPath)
          }
        }
      }
    } catch (error) {
      console.error(`Failed to process ${packageJsonPath}:`, error)
    }
  }
}

// Function to update a specific package version
async function updatePackageVersion(packageJson, pkg, packageJsonPath) {
  try {
    const currentVersion =
      packageJson.dependencies?.[pkg] ||
      packageJson.peerDependencies?.[pkg] ||
      packageJson.optionalDependencies?.[pkg]

    const latest = await Promise.race([
      latestVersion(pkg),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Request timed out')), 10000))
    ])

    // Preserve version constraints like ">="
    const versionPrefix = currentVersion.match(/^[^\d]*/)[0] || ''
    const newVersion = `${versionPrefix}${latest}`

    if (currentVersion !== newVersion) {
      if (packageJson.dependencies && packageJson.dependencies[pkg]) {
        packageJson.dependencies[pkg] = newVersion
      } else if (packageJson.peerDependencies && packageJson.peerDependencies[pkg]) {
        packageJson.peerDependencies[pkg] = newVersion
      } else if (packageJson.optionalDependencies && packageJson.optionalDependencies[pkg]) {
        packageJson.optionalDependencies[pkg] = newVersion
      }

      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))
      console.log(
        `Updated ${chalk.bgBlue(pkg)} in ${chalk.bold(JSON.parse(fs.readFileSync(packageJsonPath)).name)} from ${chalk.bgRed(currentVersion)} to ${chalk.bgGreen(newVersion)}`
      )
    }
  } catch (error) {
    console.error(`Failed to update ${pkg}:`, error)
  }
}

// Get command and package names from command-line arguments
const [command, ...packagesToUpdate] = process.argv.slice(2)

// Check if the command is 'upgrade'
if (command === 'upgrade') {
  // Execute the update function and handle errors
  updateDependencies(packagesToUpdate).catch(err => console.error(err))
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}
