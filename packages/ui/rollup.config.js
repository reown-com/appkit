import fs from 'node:fs'
import createConfig from '../../rollup.config.js'

const packageJsonString = fs.readFileSync('./package.json')
const packageJson = JSON.parse(packageJsonString)

export default createConfig(packageJson)
