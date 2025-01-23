import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

// Path to the index.ts file
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const indexFilePath = path.join(__dirname, 'exports/index.ts')
const outputFilePath = path.join(__dirname, 'exports-config.json')
console.log(indexFilePath)
// Directory where new files will be created
var exportDir = path.join(__dirname, 'exports')
// Ensure the export directory exists
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true })
}
// Read the index.ts file
var fileContent = fs.readFileSync(indexFilePath, 'utf-8')
var lines = fileContent.split('\n')
var exportsObject = {}

lines.forEach(function (line) {
  console.log(line)
  var match = line.match(/export \* from '.*\/(.*)\/index\.js'/)
  if (match) {
    var componentName = match[1]
    var newFilePath = path.join(exportDir, `${componentName}.ts`)
    // Write the export line to the new file
    fs.writeFileSync(newFilePath, `${line}\n`, 'utf-8')
    console.log(`Created: ${newFilePath}`)

    // Add to exports object
    exportsObject['./' + componentName] = {
      types: `./dist/types/exports/${componentName}.d.ts`,
      import: `./dist/esm/exports/${componentName}.js`,
      default: `./dist/esm/exports/${componentName}.js`
    }
  }
})

// Write the exports object as JSON
fs.writeFileSync(outputFilePath, JSON.stringify(exportsObject, null, 2), 'utf-8')
console.log(`Export configurations written to: ${outputFilePath}`)

// Create `packages/scaffold-ui/script.js` file
// run node script.ts
