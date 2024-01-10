import { promises as fs } from 'fs'
import path from 'path'

const directoryPath = './coverage' // Replace with your directory path

async function printCoverageSummary() {
  try {
    const file = await readFirstAlphabeticallyDescendingFile(directoryPath)
    const data = await fs.readFile(path.join(directoryPath, file), 'utf8')

    return coverageJsonToHumanReadable(data)
  } catch (error) {
    return `Failed to summarize coverage: ${error}`
  }
}

async function coverageJsonToHumanReadable(coverageJson) {
  const coverageJsonParsed = JSON.parse(coverageJson)
  const total = coverageJsonParsed.total

  const keys = Object.keys(coverageJsonParsed)
    .filter(key => key !== 'total')
    .map(key => {
      const coverage = coverageJsonParsed[key]
      return `${key}: ${coverage.lines.pct}%`
    })
    .join('/')

  return `Total coverage: ${total.lines.pct}% (${keys})`
}

async function readFirstAlphabeticallyDescendingFile(directory) {
  // Read files from directory
  const files = await fs.readdir(directory)

  // Sort files alphabetically in descending order
  files.sort((a, b) => b.localeCompare(a))

  // Get the first file (alphabetically last)
  const firstFile = files[0]
  if (firstFile) {
    return firstFile
  }

  throw new Error('No files found in directory')
}

printCoverageSummary().then(console.log)
