/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, context) => {
    if (config.plugins) {
      config.plugins.push(
        new context.webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/
        })
      )
    }
    return config
  },
  reactStrictMode: true,
  trailingSlash: true,
  distDir: 'out',
  cleanDistDir: true
}

export default nextConfig
