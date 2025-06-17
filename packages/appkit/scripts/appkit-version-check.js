#!/usr/bin/env node
/* eslint-disable no-console */
import { existsSync, readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import semver from 'semver'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

/* CONFIG ------------------------------------------------------------------ */
const REOWN_SCOPE_PREFIX = '@reown/appkit'
const sections = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']
/* ------------------------------------------------------------------------- */

function findProjectRoot(startPath) {
  let current = startPath

  // Walk up the directory tree to find the consumer project
  while (current !== dirname(current)) {
    const packageJsonPath = join(current, 'package.json')

    if (existsSync(packageJsonPath)) {
      try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'))

        // Check if this package.json has @reown/appkit dependencies
        const hasReownDeps = sections.some(
          section =>
            pkg[section] &&
            Object.keys(pkg[section]).some(dep => dep.startsWith(REOWN_SCOPE_PREFIX))
        )

        // If it has @reown/appkit deps and it's not the @reown/appkit package itself
        if (hasReownDeps && pkg.name !== '@reown/appkit') {
          return { pkg, path: current }
        }
      } catch (error) {
        // Invalid package.json, continue searching
      }
    }

    current = dirname(current)
  }

  return null
}

function findProjectRootAlternative() {
  // Alternative approach: use process.env.INIT_CWD (npm) or process.env.PWD
  const initCwd = process.env.INIT_CWD || process.env.PWD || process.cwd()

  if (initCwd && existsSync(join(initCwd, 'package.json'))) {
    try {
      const pkg = JSON.parse(readFileSync(join(initCwd, 'package.json'), 'utf8'))
      const hasReownDeps = sections.some(
        section =>
          pkg[section] && Object.keys(pkg[section]).some(dep => dep.startsWith(REOWN_SCOPE_PREFIX))
      )

      if (hasReownDeps && pkg.name !== '@reown/appkit') {
        return { pkg, path: initCwd }
      }
    } catch (error) {
      // Ignore error
    }
  }

  return null
}

// Try multiple approaches to find the consumer project
let project = findProjectRoot(__dirname) || findProjectRootAlternative()

if (!project) {
  console.log('Could not find consumer project with @reown/appkit dependencies')
  process.exit(0)
}

console.log('Checking project at:', project.path)
console.log(`Found project: ${project.pkg.name}`)

// Get ALL @reown/appkit packages from the project
const allReownPackages = Object.fromEntries(
  sections
    .flatMap(s => Object.entries(project.pkg[s] || {}))
    .filter(([name]) => name.startsWith(REOWN_SCOPE_PREFIX))
)

console.log('Found @reown/appkit packages:', Object.keys(allReownPackages))

if (!Object.keys(allReownPackages).length) {
  console.log('No @reown/appkit packages found in project')
  process.exit(0)
}

// Resolve installed versions
const installed = {}
for (const packageName of Object.keys(allReownPackages)) {
  try {
    // Try multiple resolution strategies
    let packageJsonPath

    try {
      // Try resolving from the project root
      packageJsonPath = require.resolve(`${packageName}/package.json`, {
        paths: [project.path]
      })
    } catch (error) {
      // Fallback: try resolving from current working directory
      try {
        packageJsonPath = require.resolve(`${packageName}/package.json`)
      } catch (error2) {
        // Try direct path construction
        const directPath = join(project.path, 'node_modules', packageName, 'package.json')
        if (existsSync(directPath)) {
          packageJsonPath = directPath
        } else {
          throw error2
        }
      }
    }

    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'))
    installed[packageName] = packageJson.version
  } catch (error) {
    console.log(`Could not resolve ${packageName}:`, error.message)
  }
}

if (!Object.keys(installed).length) {
  console.log('No @reown/appkit packages could be resolved')
  process.exit(0)
}

console.log('Installed @reown/appkit packages and versions:')
Object.entries(installed).forEach(([pkg, version]) => {
  console.log(`  ${pkg}: ${version}`)
})

// Find the most common version (baseline)
const versions = Object.values(installed)
const versionCounts = {}
versions.forEach(v => {
  const normalized = semver.coerce(v)?.version || v
  versionCounts[normalized] = (versionCounts[normalized] || 0) + 1
})

const baseline = Object.entries(versionCounts).sort((a, b) => b[1] - a[1])[0][0]

// Check for mismatches
const mismatched = Object.entries(installed).filter(([, version]) => {
  const baselineCoerced = semver.coerce(baseline)
  const versionCoerced = semver.coerce(version)

  return baselineCoerced && versionCoerced && !semver.eq(versionCoerced, baselineCoerced)
})

if (mismatched.length > 0) {
  console.error('\n\u001b[31m✖ Reown AppKit version mismatch detected!\u001b[0m')
  console.error(`   Expected all @reown/appkit packages to be version ${baseline}\n`)
  console.error('   Mismatched packages:')
  mismatched.forEach(([pkg, version]) => {
    console.error(`     • ${pkg}: ${version} (expected ${baseline})`)
  })
  console.error(`\n   Please update all @reown/appkit packages to version ${baseline}`)
  console.error('   You can run the following commands:')
  mismatched.forEach(([pkg]) => {
    console.error(`     npm install ${pkg}@${baseline}`)
  })
  console.error('')
  process.exit(1)
} else {
  console.log(`\u001b[32m✓ All @reown/appkit packages are in sync (${baseline})\u001b[0m`)
}
