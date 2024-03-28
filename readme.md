> [!NOTE]
> Looking for v2? [switch the branch](https://github.com/WalletConnect/web3modal/tree/V2).

#### 📚 [Documentation](https://docs.walletconnect.com/web3modal/about)

#### 🧪 [Laboratory](https://lab.web3modal.com)

#### 🔗 [Website](https://web3modal.com)

# Web3Modal

Your on-ramp to web3 multichain. Web3Modal is a versatile library that makes it super easy to connect users with your Dapp and start interacting with the blockchain.

<p align="center">
  <img src="./.github/assets/header.png" alt="" border="0">
</p>

# Dev setup

1. Create `apps/laboratory/.env.local` file using the template from `apps/laboratory/.env.example`

2. In each of the `examples` create `.env.local` file with following contents

```zsh
VITE_PROJECT_ID="your_project_id"
```

3. Run `npm run watch` to build and watch for file changes in a separate tab
4. Run gallery, laboratory or examples in a separate tab i.e. `npm run laboratory`

# Releasing new versions

## General Steps

1. Run `npm outdated` and update dependencies
2. Run `npm install` and verify if everything still works correctly
3. Merge your feature branch into `V4`
4. Create a new branch from `V4` and name it with the version tag
5. Generate a changeset (see below) and set new custom version, enter prelease mode first if you want to add a tag to the version.
6. Update version in `ConstantsUtil` in `@web3modal/scaffold-utils` to the correct version
7. Create a new `PR` with Release Notes and merge into `V4`
8. Checkout `V4` and run `npm run publish:latest`
9. Draft a new release in GitHub and create new tag
10. Click on `Generate Change` and only leave the link with difference. Paste in your changelog from PR.
11. Check `Set as the last release` and publish release.
12. Update Web3Modal for https://web3modal.com/ (https://github.com/WalletConnect/www-web3modal) and create a PR
13. Update Web3Modal for https://app.web3inbox.com (https://github.com/WalletConnect/web3inbox) and create a PR

## Preparing changesets

### 0. If you need to do a pre-release, enter pre mode

We generally use the short-hash for last commit of the release as tag

```sh
npm run changeset pre enter [tag]
```

This will generate `.changeset/pre.json` persisting original package information

### 1. Choose the packages you want to update and add a summary

Select the packages you need and the type of version update (major, minor, patch) you want to apply

```sh
npm run changeset
```

This will generate `.changeset/<random name>.json` persisting changeset information

## 2. Apply the changes

```sh
npm run changeset version
```

This will apply changes based off `pre.json` (if available) and the previously created changeset file.

## 3. Exit pre release mode

```sh
npm run changeset pre exit
```

## 4. Remove changeset files

`rm .changeset/pre.json && rm .changeset/<random name>.json`

This files are not to be preserved.

### Running tests

See <app/laboratory/tests/README.md>
