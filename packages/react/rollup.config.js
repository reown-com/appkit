import createConfig from '../../rollup.config'
import { dependencies, name, peerDependencies } from './package.json'

export default createConfig(name, Object.keys(dependencies, peerDependencies))
