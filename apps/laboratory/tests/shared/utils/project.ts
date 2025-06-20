import { devices } from '@playwright/test'

import { DESKTOP_DEVICES, MOBILE_DEVICES } from '@reown/appkit-testing'

import type { CreateProjectParameters, CustomProjectProperties } from '../types'

const ADAPTERS = ['core'] as const

const ADAPTER_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  ADAPTERS.map(adapter => ({ device, library: adapter }))
)

const ADAPTER_MOBILE_PERMUTATIONS = MOBILE_DEVICES.flatMap(device =>
  ADAPTERS.map(adapter => ({ device, library: adapter }))
)

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
  'multi-wallet.spec.ts'
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
  'basic-tests.spec.ts'
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
  'siwx-extension',
  'email-default-account-types',
  'multichain-all',
  'multichain-ethers-solana',
  'multichain-ethers5-solana',
  'multichain-wagmi-solana',
  'multichain-no-adapters',
  'multichain-extension.spec.ts',
  'multichain-siwe-extension.spec.ts',
  'multi-wallet-multichain',
  'cloud-auth'
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

const singleAdapterTestProperties = {
  // ----- Single Adapter tests ------------------------------
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
        testMatch: new RegExp(`^.*\\/${test}\\.spec\\.ts$`, 'u')
      }
    }))
  )
)

const mobileTestProperties = {
  // ----- Mobile core tests ------------------------------
  'iPhone 12/core': {
    testMatch: /^.*?\/core.*\.spec\.ts$/u
  },
  'Galaxy S5/core': {
    testMatch: /^.*?\/core.*\.spec\.ts$/u
  },

  // ----- Mobile single adapter tests ------------------------------
  'iPhone 12/ethers': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'Galaxy S5/ethers': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'iPhone 12/bitcoin': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'Galaxy S5/bitcoin': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'iPhone 12/ethers5': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'Galaxy S5/ethers5': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'iPhone 12/wagmi': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'Galaxy S5/wagmi': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'iPhone 12/solana': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  },
  'Galaxy S5/solana': {
    testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  }
}

const projectProperties: CustomProjectProperties = {
  ...singleAdapterTestProperties,
  ...coreTestProperties,
  ...customTestProperties,
  ...mobileTestProperties
}

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

export function getProjects() {
  const adapterPermutationTests = ADAPTER_PERMUTATIONS.map(createProject)
  const adapterMobileProjects = ADAPTER_MOBILE_PERMUTATIONS.map(createProject)
  const customProjects = CUSTOM_PROJECT_PERMUTATIONS.map(createProject)

  const projects = [...adapterPermutationTests, ...adapterMobileProjects, ...customProjects]

  return projects
}
