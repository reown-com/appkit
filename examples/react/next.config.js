/**
 * @type {import('next').NextConfig}
 */

/**
 * NOTE: This config is only required within this monorepo.
 * Nextjs does not transpile web3modal packages imported from monorepo and throws an error.
 */

const nextTranspileModules = require('next-transpile-modules')

const withTranspileModules = nextTranspileModules(['@web3modal/react', '@web3modal/ethereum'])

const nextConfig = withTranspileModules({})

module.exports = nextConfig
