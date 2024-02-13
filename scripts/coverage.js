// Loosely copied from https://gist.github.com/musatov/4fc2cdf6d3a8d984d4de6c233aee1836
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
// Params
const pathToPreviousReport = process.argv[2]

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Functions
/**
 * Reads the coverage-summary.{XXX}.json file and returns the parsed JSON object
 * @param {*} pathToReport
 * @returns {Object} parsed JSON object
 */
function readPreviousCoverageSummary(pathToReport) {
  if (!pathToReport) {
    console.warn('Previous coverage results were not provided.')

    return {}
  }
  // Read the JSON file
  const prevCoverage = JSON.parse(fs.readFileSync(pathToReport, 'utf8'))

  return prevCoverage
}

/**
 * Reads go through all the apps and packages and returns
 * an object with the paths to the coverage-summary.json files
 * @param {*} pathToReport
 * @returns
 *
 */
function getAllPathsForPackagesSummaries() {
  const getDirectories = source =>
    fs
      .readdirSync(source, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)

  const appsPath = path.join(__dirname, '..', 'apps')
  const appsNames = getDirectories(appsPath)

  const appsSummaries = appsNames.reduce(
    (summary, appName) => ({
      ...summary,
      [appName]: path.join(appsPath, appName, 'coverage', 'coverage-summary.json')
    }),
    {}
  )

  const packagesPath = path.join(__dirname, '..', 'packages')
  const packageNames = getDirectories(packagesPath)

  const packagesSummaries = packageNames.reduce(
    (summary, packageName) => ({
      ...summary,
      [packageName]: path.join(packagesPath, packageName, 'coverage', 'coverage-summary.json')
    }),
    {}
  )

  return { ...appsSummaries, ...packagesSummaries }
}

/**
 * Reads all the coverage-summary.json files and returns
 * an object with the total coverage for each package and the total coverage
 * @param {*} packagesSummaryPaths
 * @returns
 *
 */
function readSummaryPerPackageAndCreateJoinedSummaryReportWithTotal(packagesSummaryPaths) {
  return Object.keys(packagesSummaryPaths).reduce(
    (summary, packageName) => {
      const reportPath = packagesSummaryPaths[packageName]
      if (fs.existsSync(reportPath)) {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))

        const { total } = summary

        Object.keys(report?.total).forEach(key => {
          if (total[key]) {
            total[key].total += report?.total?.[key]?.total
            total[key].covered += report?.total?.[key]?.covered
            total[key].skipped += report?.total?.[key]?.skipped
            total[key].pct = Number(((total[key]?.covered / total[key]?.total) * 100).toFixed(2))
          } else {
            total[key] = { ...report.total[key] }
          }
        })

        return { ...summary, [packageName]: report?.total, total }
      }

      return summary
    },
    { total: {} }
  )
}

/**
 * Takes the current coverage and the previous coverage and returns
 * an object with the additional field pctDiff
 * @param {*} packagesSummaryPaths
 * @returns
 *
 */
function creteDiffCoverageReport(currCoverage, prevCoverage = {}) {
  return Object.keys(currCoverage).reduce((summary, packageName) => {
    const currPackageCoverage = currCoverage[packageName]
    const prevPackageCoverage = prevCoverage[packageName]
    if (prevPackageCoverage) {
      const coverageKeys = ['lines', 'statements', 'functions', 'branches']
      coverageKeys.forEach(key => {
        const prevPct = prevPackageCoverage[key]?.pct || 0
        const currPct = currPackageCoverage[key]?.pct || 0

        currPackageCoverage[key] = {
          ...currPackageCoverage[key],
          pctDiff: (parseFloat(currPct) - parseFloat(prevPct)).toFixed(2)
        }
      })
    }

    return { ...summary, [packageName]: currPackageCoverage }
  }, {})
}

function formatPtcWithDiff(ptc, ptcDiff) {
  return appendDiff(formatDecimal(ptc), ptcDiff && formatDecimal(ptcDiff))
}

function formatDecimal(ptc) {
  return parseFloat(ptc).toFixed(2)
}

function appendDiff(ptc, ptcDiff) {
  if (!ptcDiff || ptcDiff === ptc) {
    return ptc
  }

  return `${ptc} (${ptcDiff > 0 ? '+' : ''}${ptcDiff}%)`
}

/**
 * Takes the coverage report and returns an object with the
 * coverage for each package and the total coverage suitable
 * for the visual representation in a console table
 * @param {*} coverageReport
 * @returns
 *
 */
function createCoverageReportForVisualRepresentation(coverageReport) {
  return Object.keys(coverageReport).reduce((report, packageName) => {
    const { lines, statements, functions, branches } = coverageReport[packageName]

    return {
      ...report,
      [packageName]: {
        lines: formatPtcWithDiff(lines?.pct, lines?.pctDiff),
        statements: formatPtcWithDiff(statements?.pct, statements?.pctDiff),
        functions: formatPtcWithDiff(functions?.pct, functions?.pctDiff),
        branches: formatPtcWithDiff(branches?.pct, branches?.pctDiff)
      }
    }
  }, {})
}

function writeCoverageReportToFile(coverageReport) {
  function createDateTimeSuffix() {
    const date = new Date()

    return `${date.getFullYear()}-${
      date.getMonth() + 1
    }-${date.getDate()}_${date.getHours()}-${date.getMinutes()}`
  }

  const dir = path.join(__dirname, '..', 'coverage')

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir)
  }

  fs.writeFileSync(
    `coverage/coverage-total.${createDateTimeSuffix()}.json`,
    JSON.stringify(coverageReport, null, 2)
  )
}

/*
 * Execution Stages
 * 0. Read previous coverage-total.{XXX}.json file
 */
const prevCoverageReport = readPreviousCoverageSummary(pathToPreviousReport)
// 1. Read all coverage-total.json files && Merge them into one object
const packagesSummaryPaths = getAllPathsForPackagesSummaries()
const currCoverageReport =
  readSummaryPerPackageAndCreateJoinedSummaryReportWithTotal(packagesSummaryPaths)
// 2. Calculate diff
const diffCoverageReport = creteDiffCoverageReport(currCoverageReport, prevCoverageReport)
// 3. Create report for visual representation
const coverageReportForVisualRepresentation =
  createCoverageReportForVisualRepresentation(diffCoverageReport)
// 4. Print report
console.table(coverageReportForVisualRepresentation)
// 5. Save report to file
writeCoverageReportToFile(diffCoverageReport)
