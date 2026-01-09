// .size-limit.js
// Bundle size tracking for AppKit packages
// Measures gzipped file sizes of built artifacts (minified + gzipped)
//
// How it works:
// - Runs after `pnpm build` to measure package sizes
// - Tracks main entry points for each published package
// - Fails CI if sizes exceed limits (helping catch bloat early)
//
// Note: Only tracks file sizes, not full webpack bundles, since webpack
// can't resolve monorepo workspace dependencies properly.

export default [
  // ===== Core AppKit Package =====
  {
    name: '@reown/appkit - Main Entry',
    path: 'packages/appkit/dist/esm/exports/index.js',
    limit: '80 KB', // Current: ~74 KB (10% buffer)
    gzip: true
  },
  {
    name: '@reown/appkit/react',
    path: 'packages/appkit/dist/esm/exports/react.js',
    limit: '235 KB', // Current: ~222 KB (5% buffer)
    gzip: true
  },
  {
    name: '@reown/appkit/vue',
    path: 'packages/appkit/dist/esm/exports/vue.js',
    limit: '80 KB', // Current: ~74 KB (10% buffer)
    gzip: true
  },

  // ===== High-Level UI Packages =====
  {
    name: '@reown/appkit-scaffold-ui',
    path: 'packages/scaffold-ui/dist/esm/exports/index.js',
    limit: '220 KB', // Current: ~201 KB (10% buffer)
    gzip: true
  },
  {
    name: '@reown/appkit-ui',
    path: 'packages/ui/dist/esm/exports/index.js',
    limit: '500 KB', // Baseline - adjust after first run
    gzip: true
  }

  // Note: Adapters and smaller packages excluded since they're just re-exports (<5KB each)
  // Add them back if they start bundling significant code

  // Note: CDN bundle excluded since it's not built by default (`pnpm build` skips it)
  // To measure CDN bundle: run `pnpm build:all` first, then uncomment:
  // {
  //   name: '@reown/appkit-cdn - Wagmi Bundle',
  //   path: 'packages/cdn/dist/appkit.js',
  //   limit: '1 MB',
  //   gzip: true
  // }
]
