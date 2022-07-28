import createConfig from '../../rollup.config'
import { dependencies, name } from './package.json'

export default createConfig(name, Object.keys(dependencies))
