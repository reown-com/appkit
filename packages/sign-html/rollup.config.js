import createConfig from '../../rollup.config.js'
import packageJson from './package.json' assert { type: 'json' }

export default createConfig(packageJson, true)
