# Dependabot Configuration Improvement

## Problem Statement

The AppKit monorepo currently experiences significant overhead from Dependabot dependency updates, resulting in ~25 PRs at the beginning of each week that are difficult to maintain and merge.

### Current Issues

1. **Fragmentary Updates**: Dependabot creates separate PRs for individual dependencies within the same organization
   - Example: Creates a PR for `@radix-ui/dropdown-menu` in `@apps/demo`, while other `@radix-ui/*` packages remain unupdated
   - Impact: Excessive CI runs, difficult to review and merge related changes

2. **Dependency Misalignment**: Updates occur in isolation per package/app, causing version inconsistencies
   - Example: Upgrades `valtio` in `packages/appkit` but not in `@apps/demo` where it's also used
   - Impact: Dependency version drift across the monorepo, potential runtime issues, increased maintenance burden

3. **Invalid Lock Files**: Dependabot-generated lock files (`pnpm-lock.yaml`) frequently fail validation
   - Impact: All PR checks fail, requiring manual intervention by engineers to checkout, reinstall, and push corrected lock files

## Requirements

- ✅ **Single PR per week**: All dependency updates consolidated into one PR
- ✅ **Monorepo-wide alignment**: When a dependency is updated, update it across all packages/apps simultaneously
- ⚠️ **Automated Changeset generation**: Create Changeset files when AppKit packages are affected by dependency updates
- ⚠️ **Lock file validation**: Ensure `pnpm-lock.yaml` is valid before PR checks run

## Solution

### ✅ Implemented: Dependabot Configuration

**Configuration**: `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: 'npm'
    directory: '/'  # Scans entire monorepo
    schedule:
      interval: 'weekly'
    labels:
      - 'chore: update dependencies'
    groups:
      'all-dependencies':
        patterns:
          - '*'  # Groups all dependencies (production & dev)
    ignore:
      - dependency-name: '*'
        update-types: ['version-update:semver-major']  # Only patch/minor updates
      - dependency-name: '@reown/*'
        update-types: ['version-update:semver-major', 'version-update:semver-minor', 'version-update:semver-patch']
```

**Key Features**:
- Single root-level scan (`directory: '/'`) ensures all `package.json` files are updated together
- One group (`all-dependencies`) with wildcard pattern creates a single PR per week
- Omitting `dependency-type` includes both production and development dependencies
- Major version updates ignored to prevent breaking changes
- Workspace dependencies (`@reown/*`) ignored (handled internally)

**How It Works**:
- Dependabot scans all `package.json` files in the monorepo (apps, packages, examples)
- When a dependency has updates, it updates that dependency in **all** package.json files where it appears
- All updates are consolidated into a single PR, ensuring version alignment across the monorepo

### ⚠️ Pending: Automated Changeset Generation

**Requirement**: When dependency updates affect AppKit packages, automatically create a Changeset file.

**Proposed Solution**: GitHub Action workflow that:
1. Triggers on Dependabot PRs (when PR author is `dependabot[bot]`)
2. Detects if any `packages/*/package.json` files were modified
3. Runs `pnpm changeset` to generate a Changeset file
4. Commits the Changeset file to the PR branch

**Implementation Notes**:
- Changesets are only needed for `@reown/appkit-*` packages, not for apps/examples
- Use `changesets/action` or a custom script to detect affected packages
- Consider using `changeset status` to avoid duplicate Changesets

### ⚠️ Pending: Lock File Validation

**Requirement**: Ensure `pnpm-lock.yaml` is valid before PR checks run.

**Current State**: 
- CI runs `pnpm install --frozen-lockfile` which validates the lock file
- When lock file is invalid, checks fail and require manual intervention

**Proposed Solutions**:

**Option A: GitHub Action Workflow** (Recommended)
- Create a workflow that runs on Dependabot PRs
- Detects when `pnpm-lock.yaml` is modified
- Runs `pnpm install` to regenerate if invalid
- Commits corrected lock file back to PR

**Option B: Dependabot Configuration**
- Use `rebase-strategy: auto` to allow Dependabot to handle rebases
- Note: Dependabot may not reliably fix lock file issues

**Option C: Pre-commit Hook** (Preventive)
- Add `husky` pre-commit hook that validates lock file
- Runs `pnpm install --frozen-lockfile` as a check
- Prevents invalid lock files from being committed

**Recommendation**: Combine Option A (GitHub Action) with Option C (pre-commit hook) for both automated fixing and prevention.

## Implementation Plan

### Phase 1: Dependabot Configuration ✅ (Complete)
- [x] Consolidate to single root-level configuration
- [x] Group all dependencies into single PR
- [x] Ignore major version updates
- [x] Ignore workspace dependencies

### Phase 2: Lock File Validation (Next Priority)
- [ ] Create GitHub Action workflow for Dependabot PRs
- [ ] Detect and fix invalid `pnpm-lock.yaml` files
- [ ] Add pre-commit hook to prevent invalid lock files
- [ ] Test with Dependabot PRs

### Phase 3: Automated Changeset Generation
- [ ] Create GitHub Action workflow
- [ ] Detect affected AppKit packages
- [ ] Generate Changeset files automatically
- [ ] Handle edge cases (conflicts, duplicate Changesets)

## Decision: Separate Production/Dev Dependencies?

**Question**: Should we separate `dependencies` and `devDependencies` into different groups?

**Answer**: **No, keep unified grouping**

**Rationale**:
- Simpler configuration with fewer groups
- Single PR is easier to review and merge
- Both production and dev dependencies need alignment across the monorepo
- No operational benefit to separating them

**Current Configuration**: Single group with `patterns: ['*']` and no `dependency-type` specification, which includes both production and development dependencies.

## Metrics & Success Criteria

- **Target**: 1 PR per week (down from ~25)
- **Validation**: Lock file passes `pnpm install --frozen-lockfile` check
- **Alignment**: Same dependency version across all package.json files
- **Automation**: Changeset files created automatically when AppKit packages affected

## Next Steps

1. **Monitor**: Observe next Dependabot cycle to verify single PR behavior
2. **Implement**: Lock file validation workflow (Phase 2)
3. **Implement**: Automated Changeset generation (Phase 3)
4. **Document**: Update contributing guidelines with new dependency update process

