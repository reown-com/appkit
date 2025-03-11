import { devices } from '@playwright/test'

import { DESKTOP_DEVICES, MOBILE_DEVICES } from '../constants/devices'

const LIBRARIES = ['ethers', 'ethers5', 'wagmi', 'solana'] as const
const MULTICHAIN_LIBRARIES = [
  'multichain-all',
  'multichain-basic',
  'multichain-ethers-solana',
  'multichain-ethers5-solana',
  'multichain-wagmi-solana'
] as const

const LIBRARY_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const LIBRARY_MOBILE_PERMUTATIONS = MOBILE_DEVICES.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const MULTICHAIN_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  MULTICHAIN_LIBRARIES.map(library => ({ device, library }))
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
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'debug-mode.spec.ts',
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

const BITCOIN_IGNORE_TESTS = SINGLE_ADAPTER_EVM_TESTS.filter(
  test => !test.includes('wallet.spec.ts')
)

const SINGLE_ADAPTER_MOBILE_TESTS = ['mobile-wallet-features.spec.ts']

const SINGLE_ADAPTER_SOLANA_TESTS = [
  'extension.spec.ts',
  'basic-tests.spec.ts',
  'siwx-extension.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'debug-mode.spec.ts',
  'wallet.spec.ts'
]

function createRegex(tests: string[], isDesktop = true) {
  const desktopCheck = isDesktop ? '(?!.*/mobile-)' : ''

  return new RegExp(`^(?!.*/multichain/)${desktopCheck}.*(?:${tests.join('|')})`, 'u')
}

// Desktop
const SINGLE_ADAPTER_EVM_TESTS_REGEX = createRegex(SINGLE_ADAPTER_EVM_TESTS)
const SINGLE_ADAPTER_SOLANA_TESTS_REGEX = createRegex(SINGLE_ADAPTER_SOLANA_TESTS)
const BITCOIN_IGNORE_TESTS_REGEX = createRegex(BITCOIN_IGNORE_TESTS)
// Mobile
const SINGLE_ADAPTER_MOBILE_REGEX = createRegex(SINGLE_ADAPTER_MOBILE_TESTS, false)

const customProjectProperties: CustomProjectProperties = {
  'Desktop Chrome/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Firefox/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Chrome/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Firefox/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Chrome/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Firefox/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX
  },
  'Desktop Chrome/bitcoin': {
    testIgnore: BITCOIN_IGNORE_TESTS_REGEX
  },
  'Desktop Firefox/bitcoin': {
    testIgnore: BITCOIN_IGNORE_TESTS_REGEX
  },
  'Desktop Chrome/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: /siwe-email\.spec\.ts|siwe-extension\.spec\.ts|multichain-.*\.spec\.ts/u
  },
  'Desktop Firefox/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: /siwe-email\.spec\.ts|siwe-extension\.spec\.ts|multichain-.*\.spec\.ts/u
  },
  'Desktop Firefox/multichain-all': {
    testMatch: /^.*\/multichain-all\.spec\.ts$/u
  },
  'Desktop Chrome/multichain-all': {
    testMatch: /^.*\/multichain-all\.spec\.ts$/u
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
  'Desktop Firefox/multichain-basic': {
    testMatch: /^.*\/multichain-basic\.spec\.ts$/u
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
  'Desktop Chrome/multichain-basic': {
    testMatch: /^.*\/multichain-basic\.spec\.ts$/u
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

  const projects = [...libraryDesktopProjects, ...libraryMobileProjects, ...multichainProjects]

  return projects
}
