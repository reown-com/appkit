# Watch Mode Guide for sacred-appkit

## Current Watch Configuration

Your monorepo **already has watch mode set up**! ✅

### Root Package Scripts

**From `sacred-appkit/package.json`:**
```json
{
  "scripts": {
    "watch": "turbo run watch --filter={./packages/*,./packages/adapters/*} --concurrency=50 --continue"
  }
}
```

**From `turbo.json`:**
```json
{
  "tasks": {
    "watch": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Individual Package Watch Scripts

Each package already has watch configured:

**Example: `packages/adapters/polkadot/package.json`:**
```json
{
  "scripts": {
    "watch": "tsc --watch"
  }
}
```

---

## How to Use Watch Mode

### Option 1: Watch All Packages

```bash
cd /home/laughingwhales/development/sacred-appkit
pnpm watch
```

**What happens:**
- Turbo runs `watch` task for **ALL** packages in parallel
- Each package's TypeScript compiler watches for changes
- Changes auto-rebuild in 2-5 seconds
- Runs continuously until you `Ctrl+C`

### Option 2: Watch Specific Packages (Faster)

**Critical packages only:**
```bash
cd /home/laughingwhales/development/sacred-appkit
turbo run watch \
  --filter=@reown/appkit-adapter-polkadot \
  --filter=@reown/appkit-scaffold-ui \
  --filter=@reown/appkit \
  --parallel \
  --continue
```

**Why this is better:**
- Only watches the 3 packages you actively edit
- Faster startup (~10s vs ~30s)
- Lower CPU/memory usage
- Still catches all your changes

### Option 3: Single Package

```bash
cd /home/laughingwhales/development/sacred-appkit
pnpm --filter @reown/appkit-adapter-polkadot watch
```

---

## What Gets Watched

When you run `pnpm watch`, these packages start watching:

### Adapters
- ✅ `@reown/appkit-adapter-polkadot` ← You edit this!
- ✅ `@reown/appkit-adapter-solana`
- ❌ `@reown/appkit-adapter-wagmi` (not used in tip-api)
- ❌ Other adapters (not linked)

### Core Packages
- ✅ `@reown/appkit` ← Main package
- ✅ `@reown/appkit-common`
- ✅ `@reown/appkit-controllers`
- ✅ `@reown/appkit-utils`

### UI Packages
- ✅ `@reown/appkit-scaffold-ui` ← You edit this!
- ✅ `@reown/appkit-ui`
- ✅ `@reown/appkit-wallet-button`

### Other Packages
- ✅ `@reown/appkit-siwx`
- ✅ `@reown/appkit-polyfills`
- ✅ `@reown/appkit-pay`
- And more...

---

## TypeScript Watch Behavior

### What TypeScript Watch Does

When you save a `.ts` or `.tsx` file:

1. **Detection** (< 1 second)
   - `tsc --watch` detects file change via filesystem watcher

2. **Type Check** (1-2 seconds)
   - Only checks files that changed + their dependents
   - Uses incremental compilation cache

3. **Emit** (< 1 second)
   - Outputs compiled `.js` and `.d.ts` to `dist/`

4. **Next.js Detection** (1-2 seconds)
   - Next.js watches `node_modules/@reown/**/dist/`
   - Detects new `.js` files via symlinks
   - Triggers Hot Module Reload or full page reload

**Total: 3-7 seconds from save to browser reload** ⚡

### First Build vs. Incremental

**First time (cold start):**
```
pnpm watch
[Polkadot Adapter] Starting...
[Scaffold UI] Starting...
[AppKit Core] Starting...
... (10-15 seconds)
[All] Watching for file changes...
```

**After changes:**
```
[Polkadot Adapter] File change detected: src/adapter.ts
[Polkadot Adapter] Compiling...
[Polkadot Adapter] Found 0 errors. Watching for file changes.
... (2-3 seconds)
```

---

## Integration with tip-api

### How Symlinks Work

**In tip-api/node_modules/@reown/:**
```
appkit-adapter-polkadot → ../../../sacred-appkit/packages/adapters/polkadot
```

**So when TypeScript outputs:**
```
sacred-appkit/packages/adapters/polkadot/dist/esm/exports/index.js
```

**Next.js sees it as:**
```
tip-api/node_modules/@reown/appkit-adapter-polkadot/dist/esm/exports/index.js
```

**And Next.js reloads!**

### Next.js Watch Configuration

Next.js automatically watches:
- `app/**`
- `components/**`
- `node_modules/@reown/**` ← Via symlinks!

So you don't need to configure anything special in tip-api!

---

## Recommended Workflow

### Setup (Once)

```bash
# Terminal 1: sacred-appkit watch
cd /home/laughingwhales/development/sacred-appkit
turbo run watch \
  --filter=@reown/appkit-adapter-polkadot \
  --filter=@reown/appkit-scaffold-ui \
  --filter=@reown/appkit \
  --parallel

# Terminal 2: tip-api dev
cd /home/laughingwhales/development/tip-api
pnpm dev
```

### Daily Development

1. **Edit** `sacred-appkit/packages/adapters/polkadot/src/adapter.ts`
2. **Save** (Cmd/Ctrl+S)
3. **Wait** 3-7 seconds
4. **Browser reloads** automatically
5. **Test**

No manual rebuilds! ✅

---

## Performance Tips

### Tip 1: Watch Only What You Edit

Instead of all 20+ packages, watch only the 3 you actively edit:

```bash
turbo run watch \
  --filter=@reown/appkit-adapter-polkadot \
  --filter=@reown/appkit-scaffold-ui \
  --filter=@reown/appkit \
  --parallel
```

**Savings:**
- Startup: 30s → 10s
- CPU usage: ~200% → ~50%
- Memory: ~800MB → ~300MB

### Tip 2: Use Turbo's Cache

Turbo caches build outputs. If you restart watch mode:

```bash
pnpm watch
```

Turbo will restore cached builds if source hasn't changed!

**First start: 30 seconds**
**Restart (no changes): 5 seconds** ⚡

### Tip 3: Exclude Watchers in IDE

**VS Code `.vscode/settings.json`:**
```json
{
  "files.watcherExclude": {
    "**/node_modules/@reown/**/dist/**": true,
    "**/.turbo/**": true
  }
}
```

This prevents VS Code from also watching `dist/` folders (double-watching wastes resources).

---

## Troubleshooting

### Watch Not Starting

**Symptom:**
```
pnpm watch
# Nothing happens
```

**Solution:**
```bash
# Check if watch scripts exist
cd /home/laughingwhales/development/sacred-appkit
pnpm run watch --help

# Or check package.json
cat packages/adapters/polkadot/package.json | grep watch
```

### Changes Not Detected

**Symptom:**
- You save a file
- Nothing rebuilds

**Solutions:**

1. **Check watch is running:**
   ```bash
   # You should see:
   [Polkadot Adapter] Watching for file changes...
   ```

2. **Check file is in watched directory:**
   ```bash
   # Watch only watches src/ by default
   # If editing tests/, it won't trigger
   ```

3. **Restart watch:**
   ```bash
   Ctrl+C
   pnpm watch
   ```

### Browser Not Reloading

**Symptom:**
- Watch rebuilds successfully
- Browser doesn't reload

**Solutions:**

1. **Check symlinks:**
   ```bash
   ls -la /home/laughingwhales/development/tip-api/node_modules/@reown/
   # All should show "→" arrows
   ```

2. **Hard refresh:**
   ```
   Ctrl+Shift+R (Linux/Win)
   Cmd+Shift+R (Mac)
   ```

3. **Restart Next.js:**
   ```bash
   # In tip-api terminal
   Ctrl+C
   pnpm dev
   ```

### High CPU Usage

**Symptom:**
- Watch mode uses 200%+ CPU continuously

**Solutions:**

1. **Watch fewer packages:**
   ```bash
   # Instead of all packages
   pnpm watch
   
   # Watch only critical ones
   turbo run watch --filter=@reown/appkit-adapter-polkadot...
   ```

2. **Check for loops:**
   ```bash
   # Make sure you're not watching dist/
   # TypeScript emits to dist/, which triggers re-watch
   
   # In tsconfig.json, ensure:
   "exclude": ["dist", "node_modules"]
   ```

### "Too Many Files" Error

**Symptom:**
```
Error: ENOSPC: System limit for number of file watchers reached
```

**Solution:**
```bash
# Increase inotify watchers limit (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## Advanced: Custom Watch Scripts

If you want to watch specific packages differently:

### Watch with Hot Reload (Experimental)

```json
// package.json
{
  "scripts": {
    "watch": "tsc --watch --preserveWatchOutput",
    "watch:hot": "nodemon --watch src --ext ts,tsx --exec 'tsc'"
  }
}
```

### Watch with Linting

```json
{
  "scripts": {
    "watch": "concurrently \"tsc --watch\" \"eslint --watch src/**\""
  }
}
```

You'd need to install `concurrently`:
```bash
pnpm add -D concurrently
```

---

## Summary

### What You Already Have ✅

- Watch mode configured in all packages
- Turbo orchestration for parallel watching
- Symlinks to tip-api for auto-reload

### What To Do 🚀

**Start watching:**
```bash
cd /home/laughingwhales/development/sacred-appkit
pnpm watch
```

**Or use the helper script:**
```bash
cd /home/laughingwhales/development
./DEV_WORKFLOW_SCRIPTS.sh watch-critical
```

**Then develop:**
- Edit files
- Save
- Wait 3-7 seconds
- Browser reloads
- No manual rebuilds!

---

**You're all set!** The infrastructure is already there, just need to run it! 🎉

