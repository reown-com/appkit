import { devices } from '@playwright/test'
import { getAvailableDevices } from './device'

const availableDevices = getAvailableDevices()

const LIBRARIES = ['ethers', 'ethers5'] as const
const MULTICHAIN_LIBRARIES = ['multichain-ethers-solana', 'multichain-ethers5-solana'] as const

const LIBRARY_PERMUTATIONS = availableDevices.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

const MULTICHAIN_PERMUTATIONS = availableDevices.flatMap(device =>
  MULTICHAIN_LIBRARIES.map(library => ({ device, library }))
)

interface UseOptions {
  launchOptions: {
    executablePath: string
  }
}

interface CustomProperties {
  testIgnore?: RegExp | string
  testMatch?: string
  useOptions?: UseOptions
  grep?: RegExp
}

export type CustomProjectProperties = {
  [T in string]: CustomProperties
}

const multiChainTests = [
  'multichain-ethers-solana.spec.ts',
  'multichain-ethers-solana-email.spec.ts',
  'multichain-ethers5-solana.spec.ts',
  'multichain-ethers5-solana-email.spec.ts'
]

const SOLANA_DISABLED_TESTS = [
  'canary.spec.ts',
  'siwe.spec.ts',
  'siwe-email.spec.ts',
  'siwe-sa.spec.ts',
  'smart-account.spec.ts',
  'wallet-features.spec.ts',
  'metamask.spec.ts',
  'email.spec.ts',
  ...multiChainTests
]
const WAGMI_DISABLED_TESTS = [
  'metamask.spec.ts',
  'verify.spec.ts',
  'multichain.spec.ts',
  'siwe-email.spec.ts',
  'siwe-sa.spec.ts',
  'smart-account.spec.ts',
  ...multiChainTests
]
const ETHERS_DISABLED_TESTS = ['metamask.spec.ts', 'verify.spec.ts', ...multiChainTests]
const ETHERS5_DISABLED_TESTS = ['metamask.spec.ts', 'verify.spec.ts', ...multiChainTests]

const ETHERS_EMAIL_BASED_REGEX = new RegExp(ETHERS_DISABLED_TESTS.join('|'), 'u')
const ETHERS5_EMAIL_BASED_REGEX = new RegExp(ETHERS5_DISABLED_TESTS.join('|'), 'u')
const WAGMI_DISABLED_TESTS_REGEX = new RegExp(WAGMI_DISABLED_TESTS.join('|'), 'u')
const SOLANA_DISABLED_TESTS_REGEX = new RegExp(SOLANA_DISABLED_TESTS.join('|'), 'u')

const customProjectProperties: CustomProjectProperties = {
  'Desktop Chrome/ethers': {
    testIgnore: ETHERS_EMAIL_BASED_REGEX
  },
  'Desktop Firefox/ethers': {
    testIgnore: ETHERS_EMAIL_BASED_REGEX
  },
  'Desktop Chrome/ethers5': {
    testIgnore: ETHERS5_EMAIL_BASED_REGEX
  },
  'Desktop Firefox/ethers5': {
    testIgnore: ETHERS5_EMAIL_BASED_REGEX
  },
  'Desktop Chrome/wagmi': {
    testIgnore: WAGMI_DISABLED_TESTS_REGEX
  },
  'Desktop Firefox/wagmi': {
    testIgnore: WAGMI_DISABLED_TESTS_REGEX
  },
  'Desktop Chrome/solana': {
    testIgnore: SOLANA_DISABLED_TESTS_REGEX
  },
  'Desktop Firefox/solana': {
    testIgnore: SOLANA_DISABLED_TESTS_REGEX
  },
  'Desktop Chrome/multichain-ethers-solana': {},
  'Desktop Firefox/multichain-ethers-solana': {},
  'Desktop Chrome/multichain-ethers5-solana': {},
  'Desktop Firefox/multichain-ethers5-solana': {}
}

export interface Permutation {
  device: string
  library: string
}

export function getProjects() {
  const libraryProjects = LIBRARY_PERMUTATIONS.map(({ device, library }) => {
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
  })

  const multichainProjects = MULTICHAIN_PERMUTATIONS.map(({ device, library }) => {
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
  })

  const projects = [...libraryProjects, ...multichainProjects]

  return projects
}
