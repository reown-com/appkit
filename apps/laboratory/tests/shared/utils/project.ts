import { devices } from '@playwright/test'

import { DESKTOP_DEVICES } from '@reown/appkit-testing'

interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

export interface CustomProperties {
  testIgnore?: RegExp | string
  testMatch?: RegExp | string
  useOptions?: UseOptions
  grep?: RegExp
}

export type CustomProjectProperties = {
  [T in string]: CustomProperties
}

const LIBRARIES = ['ethers', 'ethers5', 'wagmi', 'solana', 'bitcoin'] as const
const CORE_LIRARIES = ['core'] as const

const LIBRARY_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const CORE_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  CORE_LIRARIES.map(library => ({ device, library }))
)

const SINGLE_ADAPTER_EVM_TESTS = [
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
  'wallet-button.spec',
  'verify.spec.ts',
  'email-after-farcaster.spec.ts'
]

const ADAPTER_INDEPENDENT_TESTS = [
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

const SINGLE_ADAPTER_SOLANA_TESTS = [
  'extension.spec.ts',
  'basic-tests.spec.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec',
  'multi-wallet.spec.ts',
  'email-after-farcaster.spec.ts'
]

const SINGLE_ADAPTER_BITCOIN_TESTS = [
  'extension.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec',
  'basic-tests.spec.ts'
]

function createRegex(tests: string[], isDesktop = true) {
  const desktopCheck = isDesktop ? '(?!.*/mobile-)' : ''

  return new RegExp(`^(?!.*/multichain/)${desktopCheck}.*?/${tests.join('|')}$`, 'u')
}

const SINGLE_ADAPTER_EVM_TESTS_REGEX = createRegex(SINGLE_ADAPTER_EVM_TESTS)
const SINGLE_ADAPTER_SOLANA_TESTS_REGEX = createRegex(SINGLE_ADAPTER_SOLANA_TESTS)
const SINGLE_ADAPTER_BITCOIN_TESTS_REGEX = createRegex(SINGLE_ADAPTER_BITCOIN_TESTS)

const customAdapterIndependentTests = Object.assign(
  {},
  ...ADAPTER_INDEPENDENT_TESTS.flatMap(test =>
    DESKTOP_DEVICES.map(device => ({
      [`${device}/${test}`]: {
        testMatch: new RegExp(`^.*\\/${test}\\.spec\\.ts$`, 'u')
      }
    }))
  )
) satisfies CustomProjectProperties

const CUSTOM_PROJECT_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  ADAPTER_INDEPENDENT_TESTS.map(library => ({ device, library }))
)

const customProjectProperties: CustomProjectProperties = {
  // Single Adapter tests
  'Desktop Chrome/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /^.*\/multichain-.*\.spec\.ts$/u
  },
  'Desktop Firefox/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /^.*\/multichain-.*\.spec\.ts$/u
  },
  'Desktop Chrome/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /^.*\/multichain-.*\.spec\.ts$/u
  },
  'Desktop Firefox/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /^.*\/multichain-.*\.spec\.ts$/u
  },
  'Desktop Chrome/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /^.*\/multichain-.*\.spec\.ts$/u
  },
  'Desktop Firefox/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /^.*\/multichain-.*\.spec\.ts$/u
  },
  'Desktop Chrome/bitcoin': {
    testMatch: SINGLE_ADAPTER_BITCOIN_TESTS_REGEX,
    testIgnore: /siwe-|multichain-|smart-account|wallet-features|email-.*\.spec\.ts/u
  },
  'Desktop Firefox/bitcoin': {
    testMatch: SINGLE_ADAPTER_BITCOIN_TESTS_REGEX,
    testIgnore: /siwe-|multichain-|smart-account|wallet-features|email-.*\.spec\.ts/u
  },
  'Desktop Chrome/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: /siwe-|multichain-|smart-account|wallet-features|email-.*\.spec\.ts/u
  },
  'Desktop Firefox/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: /siwe-|multichain-|smart-account|wallet-features|email-.*\.spec\.ts/u
  },

  // Core tests
  'Desktop Chrome/core': {
    testMatch: /^.*?\/core.*?\.spec\.ts$/u
  },
  'Desktop Firefox/core': {
    testMatch: /^.*?\/core.*?\.spec\.ts$/u
  },

  // // Mobile core tests
  // 'iPhone 12/core': {
  //   testMatch: /^.*?\/core.*\.spec\.ts$/u
  // },
  // 'Galaxy S5/core': {
  //   testMatch: /^.*?\/core.*\.spec\.ts$/u
  // },

  // // Mobile single adapter tests
  // 'iPhone 12/ethers': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'Galaxy S5/ethers': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'iPhone 12/bitcoin': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'Galaxy S5/bitcoin': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'iPhone 12/ethers5': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'Galaxy S5/ethers5': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'iPhone 12/wagmi': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'Galaxy S5/wagmi': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'iPhone 12/solana': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },
  // 'Galaxy S5/solana': {
  //   testMatch: /^.*?\/mobile-.*\.spec\.ts$/u
  // },

  // Tests that independent to adapter permutations
  ...customAdapterIndependentTests
}

export interface Permutation {
  device: string
  library: string
}

interface CreateProjectParameters {
  device: string
  library: string
}

function createProject({ device, library }: CreateProjectParameters) {
  let project = {
    name: `${device}/${library}`,
    use: { ...devices[device], library },
    storageState: 'playwright/.auth/user.json'
  }
  const props = customProjectProperties[project.name]
  if (props) {
    project = { ...project, ...props }
    if (props.useOptions) {
      project.use = { ...project.use, ...props.useOptions }
    }
  }

  return project
}

export function getProjects() {
  const libraryDesktopProjects = LIBRARY_PERMUTATIONS.map(createProject)
  // const libraryMobileProjects = LIBRARY_MOBILE_PERMUTATIONS.map(createProject)
  const customProjects = CUSTOM_PROJECT_PERMUTATIONS.map(createProject)
  const coreProjects = CORE_PERMUTATIONS.map(createProject)

  const projects = [
    ...libraryDesktopProjects,
    // ...libraryMobileProjects,
    ...customProjects,
    ...coreProjects
  ]

  console.log(
    projects.map(p => {
      return {
        [p.name]: {
          testMatch: p?.testMatch
        }
      }
    })
  )

  return projects
}
