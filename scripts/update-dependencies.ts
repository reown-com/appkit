/* eslint-disable no-console */
import { execSync } from 'child_process'
import path from 'path'
import readline from 'readline'

ç /* eslint-disable no-console */

interface PackageInfo {
  package: string
  current: string
  wanted: string
  latest: string
  dependent: string
  location: string
}

interface WorkspaceInfo {
  path: string
  name: string
}

interface UpdateResult {
  success: boolean
  message: string
  package: string
  workspace: string
}

class PackageUpdater {
  private rl: readline.Interface
  private workspaces: WorkspaceInfo[] = []

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    this.initializeWorkspaces()
  }

  private initializeWorkspaces() {
    try {
      // Get all workspaces using pnpm list
      const output = execSync('pnpm list -r --json').toString()
      const workspaceData = JSON.parse(output)

      this.workspaces = workspaceData.map((ws: any) => ({
        path: ws.path,
        name: path.basename(ws.path)
      }))
    } catch (error) {
      console.error('Failed to initialize workspaces:', error)
      this.workspaces = [{ path: process.cwd(), name: 'root' }]
    }
  }

  private getOutdatedPackagesForWorkspace(workspace: WorkspaceInfo): PackageInfo[] {
    try {
      const output = execSync('pnpm outdated --json', {
        cwd: workspace.path
      }).toString()

      return JSON.parse(output)
    } catch (error) {
      if (error instanceof Error && 'stdout' in error) {
        const output = (error as { stdout: Buffer }).stdout.toString()
        try {
          const packages = JSON.parse(output)

          return Object.entries(packages).map(([name, info]) => ({
            ...(info as Omit<PackageInfo, 'package'>),
            package: name,
            location: workspace.path
          }))
        } catch (e) {
          console.error(`Failed to parse pnpm outdated output for ${workspace.name}:`, e)

          return []
        }
      }
      console.error(`Failed to execute pnpm outdated for ${workspace.name}:`, error)
      return []
    }
  }

  private async getAllOutdatedPackages(): Promise<PackageInfo[]> {
    const allPackages: PackageInfo[] = []

    for (const workspace of this.workspaces) {
      console.log(`\nChecking packages in ${workspace.name}...`)
      const packages = await this.getOutdatedPackagesForWorkspace(workspace)
      allPackages.push(...packages)
    }

    // Deduplicate packages based on name and current version
    return Array.from(
      new Map(allPackages.map(pkg => [`${pkg.package}-${pkg.current}`, pkg])).values()
    )
  }

  private filterMinorAndPatchUpdates(packages: PackageInfo[] = []): PackageInfo[] {
    return packages.filter(pkg => {
      const current = pkg.current?.split('.')
      const latest = pkg.latest?.split('.')

      // Ensure we have valid semver
      if (current.length !== 3 || latest.length !== 3) {
        console.warn(`Invalid version format for ${pkg.package}`)
        return false
      }

      // If major version is different, exclude
      if (current[0] !== latest[0]) {
        return false
      }

      // Include if either minor or patch version is different
      return current[1] !== latest[1] || current[2] !== latest[2]
    })
  }

  private async confirmUpdates(packages: PackageInfo[]): Promise<boolean> {
    console.log('\nAvailable minor and patch updates:')

    // Group updates by workspace
    const updatesByWorkspace = packages.reduce(
      (acc, pkg) => {
        const workspaceName =
          this.workspaces.find(ws => ws.path === pkg.location)?.name || 'unknown'
        if (!acc[workspaceName]) {
          acc[workspaceName] = []
        }
        acc[workspaceName].push(pkg)
        return acc
      },
      {} as Record<string, PackageInfo[]>
    )

    // Display updates grouped by workspace
    Object.entries(updatesByWorkspace).forEach(([workspace, pkgs]) => {
      console.log(`\nIn workspace "${workspace}":`)
      pkgs.forEach(pkg => {
        console.log(`  ${pkg.package}: ${pkg.current} → ${pkg.latest}`)
      })
    })

    return new Promise(resolve => {
      this.rl.question('\nDo you want to update these packages? (y/n) ', answer => {
        resolve(answer.toLowerCase() === 'y')
      })
    })
  }

  private async updatePackage(pkg: PackageInfo, workspace: WorkspaceInfo): Promise<UpdateResult> {
    const updateCmd = `pnpm update ${pkg.package}@${pkg.latest}`

    try {
      execSync(updateCmd, {
        stdio: 'inherit',
        cwd: workspace.path
      })
      return {
        success: true,
        message: `Successfully updated ${pkg.package} to ${pkg.latest}`,
        package: pkg.package,
        workspace: workspace.name
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${pkg.package}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        package: pkg.package,
        workspace: workspace.name
      }
    }
  }

  private async updatePackages(packages: PackageInfo[]): Promise<UpdateResult[]> {
    const results: UpdateResult[] = []

    // Group updates by workspace
    const updatesByWorkspace = packages.reduce<
      Record<string, { workspace: WorkspaceInfo; packages: PackageInfo[] }>
    >((acc, pkg) => {
      const workspace = this.workspaces.find(ws => ws.path === pkg.location)
      if (workspace) {
        const wsUpdates = acc[workspace.name] || { workspace, packages: [] }

        wsUpdates.packages.push(pkg)
        acc[workspace.name] = wsUpdates
      }

      return acc
    }, {})

    // Update packages workspace by workspace
    for (const { workspace, packages: pks } of Object.values(updatesByWorkspace)) {
      console.log(`\nUpdating packages in workspace "${workspace.name}"...`)

      const promises = pks.map(pkg => this.updatePackage(pkg, workspace))
      const resultsForWorkspace = await Promise.all(promises)
      results.push(...resultsForWorkspace)
    }

    return results
  }

  public async run(): Promise<void> {
    try {
      // Get outdated packages from all workspaces
      const outdatedPackages = await this.getAllOutdatedPackages()

      // Filter for minor and patch updates
      const updates = this.filterMinorAndPatchUpdates(outdatedPackages)

      if (updates.length === 0) {
        console.log('No minor or patch updates available.')
        return
      }

      // Get confirmation
      const shouldUpdate = await this.confirmUpdates(updates)

      if (shouldUpdate) {
        const results = await this.updatePackages(updates)
        const successCount = results.filter(r => r.success).length

        console.log('\nUpdate summary:')
        const updatesByWorkspace = results.reduce<
          Record<string, { success: number; total: number }>
        >((acc, { workspace, success }) => {
          const newUpdates = acc[workspace] || { success: 0, total: 0 }
          newUpdates.total += 1
          if (success) {
            newUpdates.success += 1
          }
          acc[workspace] = newUpdates

          return acc
        }, {})

        Object.entries(updatesByWorkspace).forEach(([workspace, counts]) => {
          console.log(
            `${workspace}: ${counts.success}/${counts.total} packages updated successfully`
          )
        })

        console.log(`\nTotal: ${successCount}/${results.length} packages updated successfully.`)
      } else {
        console.log('\nUpdate cancelled.')
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      this.rl.close()
    }
  }
}

// Run the updater
const updater = new PackageUpdater()
updater.run().catch(console.error)
