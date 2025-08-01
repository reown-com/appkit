import { devices } from '@playwright/test'

import { DESKTOP_DEVICES, MOBILE_DEVICES } from '@reown/appkit-testing'

const LIBRARIES = ['ethers', 'ethers5', 'wagmi', 'solana', 'bitcoin'] as const
const MULTICHAIN_LIBRARIES = [
  'multichain-no-adapters',
  'multichain-all',
  'multi-wallet-multichain',
  'multichain-ethers-solana',
  'multichain-ethers5-solana',
  'multichain-wagmi-solana'
] as const
const FLAGS = ['default-account-types'] as const

const CORE_LIRARIES = ['core'] as const

const REOWN_AUTHENTICATION_LIBRARIES = ['reown-authentication'] as const

const LIBRARY_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const LIBRARY_MOBILE_PERMUTATIONS = MOBILE_DEVICES.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const MULTICHAIN_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  MULTICHAIN_LIBRARIES.map(library => ({ device, library }))
)

const CORE_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  CORE_LIRARIES.map(library => ({ device, library }))
)

const REOWN_AUTHENTICATION_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  REOWN_AUTHENTICATION_LIBRARIES.map(library => ({ device, library }))
)

const FLAG_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  FLAGS.map(library => ({ device, library }))
)

interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

interface CustomProperties {
  testIgnore?: RegExp | string
  testMatch?: RegExp | string
  useOptions?: UseOptions
  grep?: RegExp
}

export type CustomProjectProperties = {
  [T in string]: CustomProperties
}

const SINGLE_ADAPTER_EVM_TESTS = [
  'extension.spec.ts',
  'multichain-extension.spec.ts',
  'multichain-siwe-extension.spec.ts',
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
  'email-after-farcaster.spec.ts',
  'multi-wallet.spec.ts',
  'multi-wallet-siwx.spec.ts',
  'flag-enable-reconnect.spec.ts'
]

const CORE_TESTS = ['sign-client.spec.ts', 'universal-provider.spec.ts', 'core.spec.ts']

const SINGLE_ADAPTER_MOBILE_TESTS = ['mobile-wallet-features.spec.ts']

const SINGLE_ADAPTER_SOLANA_TESTS = [
  'extension.spec.ts',
  'basic-tests.spec.ts',
  'siwx-extension.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec',
  'multi-wallet.spec.ts'
]

const REOWN_AUTHENTICATION_TESTS = [
  'reown-authentication.spec.ts',
  'reown-authentication-email.spec.ts'
]

const SINGLE_ADAPTER_BITCOIN_TESTS = [
  'wallet.spec.ts',
  'wallet-button.spec',
  'basic-tests.spec.ts',
  'siwx-extension.spec.ts'
]

function createRegex(tests: string[], isDesktop = true) {
  const desktopCheck = isDesktop ? '(?!.*/mobile-)' : ''

  return new RegExp(`^(?!.*/multichain/)${desktopCheck}.*(?:${tests.join('|')})`, 'u')
}

const SINGLE_ADAPTER_EVM_TESTS_REGEX = createRegex(SINGLE_ADAPTER_EVM_TESTS)
const SINGLE_ADAPTER_SOLANA_TESTS_REGEX = createRegex(SINGLE_ADAPTER_SOLANA_TESTS)
const SINGLE_ADAPTER_BITCOIN_TESTS_REGEX = createRegex(SINGLE_ADAPTER_BITCOIN_TESTS)
const SINGLE_ADAPTER_MOBILE_REGEX = createRegex(SINGLE_ADAPTER_MOBILE_TESTS, false)

const CORE_TESTS_REGEX = createRegex(CORE_TESTS)
const CORE_TESTS_MOBILE_REGEX = createRegex(CORE_TESTS, false)
const REOWN_AUTHENTICATION_TESTS_REGEX = createRegex(REOWN_AUTHENTICATION_TESTS)

const customProjectProperties: CustomProjectProperties = {
  'Desktop Chrome/core': {
    testMatch: CORE_TESTS_REGEX
  },
  'Desktop Firefox/core': {
    testMatch: CORE_TESTS_REGEX
  },
  'Desktop Chrome/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Firefox/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Chrome/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Firefox/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Chrome/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Firefox/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Chrome/bitcoin': {
    testMatch: SINGLE_ADAPTER_BITCOIN_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Firefox/bitcoin': {
    testMatch: SINGLE_ADAPTER_BITCOIN_TESTS_REGEX,
    testIgnore: /reown-authentication.*\.spec\.ts/u
  },
  'Desktop Chrome/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore:
      /siwe-email\.spec\.ts|siwe-extension\.spec\.ts|multichain-.*\.spec\.ts|reown-authentication.*\.spec\.ts/u
  },
  'Desktop Firefox/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore:
      /siwe-email\.spec\.ts|siwe-extension\.spec\.ts|multichain-.*\.spec\.ts|reown-authentication.*\.spec\.ts/u
  },
  'Desktop Firefox/multichain-all': {
    testMatch: /^.*\/multichain-all\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-all': {
    testMatch: /^.*\/multichain-all\.spec\.ts$/u
  },
  'Desktop Firefox/multi-wallet-multichain': {
    testMatch: /^.*\/multi-wallet-multichain\.spec\.ts$/u
  },
  'Desktop Chrome/multi-wallet-multichain': {
    testMatch: /^.*\/multi-wallet-multichain\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-ethers-solana': {
    testMatch: /^.*\/multichain-ethers-.*\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-wagmi-solana': {
    testMatch: /^.*\/multichain-wagmi-.*\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-ethers5-solana': {
    testMatch: /^.*\/multichain-ethers5-.*\.spec\.ts$/u
  },
  'Desktop Firefox/multichain-no-adapters': {
    testMatch: /^.*\/multichain-no-adapters\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-ethers-solana': {
    testMatch: /^.*\/multichain-ethers-.*\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-wagmi-solana': {
    testMatch: /^.*\/multichain-wagmi-.*\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-ethers5-solana': {
    testMatch: /^.*\/multichain-ethers5-.*\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-no-adapters': {
    testMatch: /^.*\/multichain-no-adapters\.spec\.ts$/u
  },
  'Desktop Chrome/default-account-types': {
    testMatch: /^.*\/email-default-account-types\.spec\.ts$/u
  },
  'Desktop Firefox/default-account-types': {
    testMatch: /^.*\/email-default-account-types\.spec\.ts$/u
  },
  'iPhone 12/core': {
    testMatch: CORE_TESTS_MOBILE_REGEX
  },
  'Galaxy S5/core': {
    testMatch: CORE_TESTS_MOBILE_REGEX
  },
  'iPhone 12/ethers': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'Galaxy S5/ethers': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'iPhone 12/bitcoin': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'Galaxy S5/bitcoin': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'iPhone 12/ethers5': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'Galaxy S5/ethers5': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'iPhone 12/wagmi': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'Galaxy S5/wagmi': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'iPhone 12/solana': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'Galaxy S5/solana': {
    testMatch: SINGLE_ADAPTER_MOBILE_REGEX
  },
  'Desktop Chrome/reown-authentication': {
    testMatch: REOWN_AUTHENTICATION_TESTS_REGEX
  },
  'Desktop Firefox/reown-authentication': {
    testMatch: REOWN_AUTHENTICATION_TESTS_REGEX
  }
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
  const libraryMobileProjects = LIBRARY_MOBILE_PERMUTATIONS.map(createProject)
  const multichainProjects = MULTICHAIN_PERMUTATIONS.map(createProject)
  const coreProjects = CORE_PERMUTATIONS.map(createProject)
  const reownAuthenticationProjects = REOWN_AUTHENTICATION_PERMUTATIONS.map(createProject)
  const flagProjects = FLAG_PERMUTATIONS.map(createProject)

  const projects = [
    ...libraryDesktopProjects,
    ...libraryMobileProjects,
    ...multichainProjects,
    ...coreProjects,
    ...reownAuthenticationProjects,
    ...flagProjects
  ]

  return projects
}
