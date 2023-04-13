import fs from 'node:fs'
import createConfig from '../../rollup.config.js'

const packageJson = JSON.parse(fs.readFileSync('./package.json'))

export default createConfig(packageJson)
