import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// -- Functions ---------------------------------------------------------------
function mergeCoverageReports() {
  const getDirectories = source =>
    fs
      .readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  const packagesPath = path.join(__dirname, '..', 'packages')
  const packageNames = getDirectories(packagesPath)

  // Move all coverage final objects into an array
  const coverageFinalReports = packageNames.map(packageName => {
    const coveragePath = path.join(packagesPath, packageName, 'coverage', 'coverage-final.json')
    if (fs.existsSync(coveragePath)) {
      return JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    }
    return {}
  })

  // Move all coverage summary objects into an array
  const coverageSummaryReports = packageNames.map(packageName => {
    const coveragePath = path.join(packagesPath, packageName, 'coverage', 'coverage-summary.json')
    if (fs.existsSync(coveragePath)) {
      return JSON.parse(fs.readFileSync(coveragePath, 'utf8'))
    }
    return {}
  })

  // Merge all coverage final objects into one object
  const mergedReport = coverageFinalReports.reduce((merged, report) => {
    Object.keys(report).forEach(packageName => {
      if (merged[packageName]) {
        merged[packageName] = {
          ...merged[packageName],
          ...report[packageName]
        }
      } else {
        merged[packageName] = report[packageName]
      }
    })
    return merged
  }, {})

  const mergedSummaryReport = {}

  const totalSummary = {
    lines: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    statements: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    functions: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    branches: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    },
    branchesTrue: {
      total: 0,
      covered: 0,
      skipped: 0,
      pct: 0
    }
  }

  coverageSummaryReports.forEach(summary => {
    Object.keys(summary).forEach(key => {
      if (key === 'total') {
        // Calculate the total values of all files
        totalSummary.lines.total += summary.total.lines.total
        totalSummary.lines.covered += summary.total.lines.covered
        totalSummary.lines.skipped += summary.total.lines.skipped
        totalSummary.lines.pct += summary.total.lines.pct

        totalSummary.statements.total += summary.total.statements.total
        totalSummary.statements.covered += summary.total.statements.covered
        totalSummary.statements.skipped += summary.total.statements.skipped
        totalSummary.statements.pct += summary.total.statements.pct

        totalSummary.functions.total += summary.total.functions.total
        totalSummary.functions.covered += summary.total.functions.covered
        totalSummary.functions.skipped += summary.total.functions.skipped
        totalSummary.functions.pct += summary.total.functions.pct

        totalSummary.branches.total += summary.total.branches.total
        totalSummary.branches.covered += summary.total.branches.covered
        totalSummary.branches.skipped += summary.total.branches.skipped
        totalSummary.branches.pct += summary.total.branches.pct

        totalSummary.branchesTrue.total += summary.total.branchesTrue.total
        totalSummary.branchesTrue.covered += summary.total.branchesTrue.covered
        totalSummary.branchesTrue.skipped += summary.total.branchesTrue.skipped
        totalSummary.branchesTrue.pct += summary.total.branchesTrue.pct
      } else {
        mergedSummaryReport[key] = summary[key]
      }
    })
  })

  mergedSummaryReport.total = totalSummary

  const finalOutputFilePath = path.join(__dirname, '..', 'coverage', 'coverage-merged-final.json')
  fs.mkdirSync(path.dirname(finalOutputFilePath), { recursive: true })
  fs.writeFileSync(finalOutputFilePath, JSON.stringify(mergedReport, null, 2))

  const summaryOutputFilePath = path.join(
    __dirname,
    '..',
    'coverage',
    'coverage-merged-summary.json'
  )
  fs.writeFileSync(summaryOutputFilePath, JSON.stringify(mergedSummaryReport, null, 2))
}

// -- Function calls ---------------------------------------------------------------
mergeCoverageReports()
