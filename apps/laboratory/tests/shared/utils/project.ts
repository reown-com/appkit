import { devices } from '@playwright/test'

import type { CreateProjectParameters, CustomProjectProperties } from '../types'

// import { DESKTOP_DEVICES, MOBILE_DEVICES } from '@reown/appkit-testing'

export const DESKTOP_DEVICES = ['Desktop Chrome']
export const MOBILE_DEVICES = ['iPhone 12']

const CORE_PAGES = ['core']
const SINGLE_CHAIN_PAGES = ['ethers', 'ethers5', 'wagmi', 'bitcoin', 'solana'] as const
const MULTICHAIN_PAGES = [
  'multichain-all',
  'multichain-ethers-solana',
  'multichain-ethers5-solana',
  'multichain-wagmi-solana',
  'multichain-no-adapters'
] as const

/**
 * Tests that will be run for each EVM adapter pages on laboratory.
 * @example
 * - Test: wallet.spec.ts
 * - Runs on pages: /library/ethers, /library/ethers5, /library/wagmi
 * and so on.
 */
const EVM_ADAPTER_TESTS = [
  'extension.spec.ts',
  'basic-tests.spec.ts',
  'canary.spec.ts',
  'config.spec.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'siwe-extension.spec.ts',
  'siwe-email.spec.ts',
  'siwe-sa.spec.ts',
  'siwe.spec.ts',
  'smart-account.spec.ts',
  'wallet-features.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec.ts',
  'verify.spec.ts',
  'email-after-farcaster.spec.ts',
  'multi-wallet.spec.ts',
  'multi-wallet-siwx.spec.ts',
  'multichain-extension.spec.ts',
  'multichain-siwe-extension.spec.ts'
]

/**
 * Tests that will be run for only Solana adapter pages on laboratory.
 * @example
 * - Test: wallet.spec.ts
 * - Runs on pages: /library/solana
 * and so on.
 */
const SOLANA_ADAPTER_TESTS = [
  'extension.spec.ts',
  'basic-tests.spec.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec.ts',
  'email-after-farcaster.spec.ts',
  'multi-wallet.spec.ts'
]

/**
 * Tests that will be run for only Bitcoin adapter pages on laboratory.
 * @example
 * - Test: wallet.spec.ts
 * - Runs on pages: /library/bitcoin
 * and so on.
 */
const BITCOIN_ADAPTER_TESTS = [
  'extension.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec.ts',
  'basic-tests.spec.ts',
  'multi-wallet.spec.ts'
]

/**
 * Tests that are not related to single adapters pages. These will be running on their own pages and will not be included in the single adapter test permutations.
 * Add your tests specific for some features, or multichain tests here.
 * @example
 * - Test: multichain-all.spec.ts
 * - Runs on pages: /library/multichain-all
 * @example
 * - Test: multichain-ethers-solana.spec.ts
 * - Runs on pages: /library/multichain-ethers-solana
 */
const CUSTOM_TESTS = [
  'siwx-extension.spec.ts',
  'email-default-account-types.spec.ts',
  'multi-wallet-multichain.spec.ts',
  'cloud-auth.spec.ts'
]

function createRegex(tests: string[]) {
  return new RegExp(`^.*?/(${tests.join('|')})$`, 'u')
}

const EVM_ADAPTER_TESTS_REGEX = createRegex(EVM_ADAPTER_TESTS)
const SOLANA_ADAPTER_TESTS_REGEX = createRegex(SOLANA_ADAPTER_TESTS)
const BITCOIN_ADAPTER_TESTS_REGEX = createRegex(BITCOIN_ADAPTER_TESTS)

const CUSTOM_PROJECT_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  CUSTOM_TESTS.map(library => ({ device, library }))
)

const singleChainTestProperties = {
  // ----- Single Chain tests ------------------------------
  'Desktop Chrome/ethers': {
    testMatch: EVM_ADAPTER_TESTS_REGEX
  },
  'Desktop Firefox/ethers': {
    testMatch: EVM_ADAPTER_TESTS_REGEX
  },
  'Desktop Chrome/ethers5': {
    testMatch: EVM_ADAPTER_TESTS_REGEX
  },
  'Desktop Firefox/ethers5': {
    testMatch: EVM_ADAPTER_TESTS_REGEX
  },
  'Desktop Chrome/wagmi': {
    testMatch: EVM_ADAPTER_TESTS_REGEX
  },
  'Desktop Firefox/wagmi': {
    testMatch: EVM_ADAPTER_TESTS_REGEX
  },
  'Desktop Chrome/bitcoin': {
    testMatch: BITCOIN_ADAPTER_TESTS_REGEX
  },
  'Desktop Firefox/bitcoin': {
    testMatch: BITCOIN_ADAPTER_TESTS_REGEX
  },
  'Desktop Chrome/solana': {
    testMatch: SOLANA_ADAPTER_TESTS_REGEX
  },
  'Desktop Firefox/solana': {
    testMatch: SOLANA_ADAPTER_TESTS_REGEX
  }
}

const coreTestProperties = {
  // ----- Core tests ------------------------------
  'Desktop Chrome/core': {
    testMatch: /^.*?\/core.*?\.spec\.ts$/u
  },
  'Desktop Firefox/core': {
    testMatch: /^.*?\/core.*?\.spec\.ts$/u
  }
}

const customTestProperties = Object.assign(
  {},
  ...CUSTOM_TESTS.flatMap(test =>
    DESKTOP_DEVICES.map(device => ({
      [`${device}/${test}`]: {
        testMatch: new RegExp(`^.*?\\/${test}$`, 'u')
      }
    }))
  )
)

const mobileTestProperties = Object.assign(
  {},
  ...SINGLE_CHAIN_PAGES.flatMap(test =>
    MOBILE_DEVICES.map(device => ({
      [`${device}/${test}`]: {
        testMatch: /^.*?\/mobile-wallet-features\.spec\.ts$/u
      }
    }))
  )
)

const multichainTestProperties = Object.assign(
  {},
  ...MULTICHAIN_PAGES.flatMap(page =>
    DESKTOP_DEVICES.map(device => ({
      [`${device}/${page}`]: {
        testMatch: new RegExp(`^.*?\\/${page}.*?\\.spec\\.ts$`, 'u')
      }
    }))
  )
)

const projectProperties: CustomProjectProperties = {
  ...coreTestProperties,
  ...singleChainTestProperties,
  ...multichainTestProperties,
  ...customTestProperties,
  ...mobileTestProperties
}

// --- Projects ----------------------------------------------------------------
function createProject({ device, library }: CreateProjectParameters) {
  let project = {
    name: `${device}/${library}`,
    use: { ...devices[device], library },
    storageState: 'playwright/.auth/user.json'
  }

  const props = projectProperties[project.name]
  if (props) {
    project = { ...project, ...props }
    if (props.useOptions) {
      project.use = { ...project.use, ...props.useOptions }
    }
  }

  return project
}

const CORE_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  CORE_PAGES.map(page => ({ device, library: page }))
)

const SINGLE_CHAIN_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  SINGLE_CHAIN_PAGES.map(adapter => ({ device, library: adapter }))
)

const SINGLE_CHAIN_MOBILE_PERMUTATIONS = MOBILE_DEVICES.flatMap(device =>
  SINGLE_CHAIN_PAGES.map(adapter => ({ device, library: adapter }))
)

const MULTICHAIN_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  MULTICHAIN_PAGES.map(page => ({ device, library: page }))
)

export function getProjects() {
  const corePermutations = CORE_PERMUTATIONS.map(createProject)
  const singleChainPermutations = SINGLE_CHAIN_PERMUTATIONS.map(createProject)
  const singleChainMobilePermutations = SINGLE_CHAIN_MOBILE_PERMUTATIONS.map(createProject)
  const multichainPermutations = MULTICHAIN_PERMUTATIONS.map(createProject)
  const customProjects = CUSTOM_PROJECT_PERMUTATIONS.map(createProject)

  const projects = [
    ...corePermutations,
    ...singleChainPermutations,
    ...singleChainMobilePermutations,
    ...customProjects,
    ...multichainPermutations
  ]

  return projects
}
