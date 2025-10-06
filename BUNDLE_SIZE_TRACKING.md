# Bundle Size Tracking

This repository now has automated bundle size tracking using [size-limit](https://github.com/ai/size-limit).

## What's Tracked

We track the gzipped file sizes of the main entry points for:

- **@reown/appkit** - Main entry (~74 KB), React (~222 KB), and Vue (~74 KB) builds
- **@reown/appkit-scaffold-ui** - High-level UI flows (~201 KB)
- **@reown/appkit-ui** - Base UI components (~13 KB)

## How It Works

### Locally

After building the packages, run:

```bash
# Build packages first
pnpm build

# Check bundle sizes
pnpm size

# See detailed breakdown of what's in a bundle
pnpm size:why
```

### In CI (Pull Requests)

The `bundle_size` job in `.github/workflows/pr_checks.yml` automatically:

1. Builds all packages
2. Runs `size-limit` to measure sizes
3. **Fails the PR** if any package exceeds its size limit
4. Posts a comment on the PR with bundle size results

## Understanding the Output

```
@reown/appkit - Main Entry
Size limit:   80 kB
Size:         73.96 kB with all dependencies, minified and gzipped
Loading time: 1.5 s    on slow 3G
Running time: 1.2 s    on Snapdragon 410
Total time:   2.6 s
```

- **Size** - The gzipped file size (what gets sent over the network)
- **Loading time** - How long to download on slow 3G
- **Running time** - JavaScript parse/execution time on low-end mobile
- **Total time** - Combined loading + running time (UX impact)

## Adjusting Size Limits

Edit `.size-limit.js` to update limits:

```javascript
{
  name: '@reown/appkit - Main Entry',
  path: 'packages/appkit/dist/esm/exports/index.js',
  limit: '80 KB', // <-- Change this
  gzip: true
}
```

**Guidelines:**

- Set limits ~5-10% above current size (small buffer for organic growth)
- If a PR exceeds the limit, investigate what changed
- Only increase limits if the size increase is justified

## Adding More Packages

To track additional packages, add entries to `.size-limit.js`:

```javascript
{
  name: '@reown/your-package',
  path: 'packages/your-package/dist/esm/exports/index.js',
  limit: '50 KB',
  gzip: true
}
```

Then run `pnpm size` to verify it works.

## Debugging

If `pnpm size` fails:

1. **"Can't find files at..."** - The file doesn't exist. Build first with `pnpm build`
2. **"Can't resolve ..."** - Ignore these for monorepo workspace deps (expected)
3. **"exceeded by X KB"** - A package grew too large. Check what changed:
   ```bash
   pnpm size:why
   ```

## Why File Size Only?

We measure file sizes rather than full webpack bundles because:

- **Monorepo workspace dependencies** - Webpack can't resolve `@reown/appkit-*` workspace deps
- **Simpler** - No webpack config needed
- **Still useful** - Catches bloat in individual packages
- **CDN bundle tracked separately** - The full bundle is in `@reown/appkit-cdn`

For tree-shaking analysis, check published packages on [bundlephobia.com](https://bundlephobia.com/).

## What This Prevents

✅ Accidentally adding large dependencies  
✅ Code duplication across packages  
✅ Unused code creeping in  
✅ Bundle bloat over time

## Resources

- [size-limit docs](https://github.com/ai/size-limit)
- [Why bundle size matters](https://web.dev/your-first-performance-budget/)
- [Check published package sizes](https://bundlephobia.com/package/@reown/appkit)
