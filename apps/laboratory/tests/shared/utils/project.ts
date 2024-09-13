import { devices } from '@playwright/test'
import { getAvailableDevices } from './device'

const availableDevices = getAvailableDevices()

const LIBRARIES = ['ethers', 'ethers5', 'wagmi', 'solana'] as const
const MULTICHAIN_LIBRARIES = [
  'multichain-ethers-solana',
  'multichain-wagmi-solana',
  'multichain-ethers5-solana'
] as const

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

const SINGLE_ADAPTER_EVM_TESTS = [
  'basic-tests.spec.ts',
  'canary.spec.ts',
  'email.spec.ts',
  'metamask.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'siwe-email.spec.ts',
  'siwe-sa.spec.ts',
  'siwe.spec.ts',
  'smart-account.spec.ts',
  'verify.spec.ts',
  'wallet-features.spec.ts',
  'wallet.spec.ts'
]

const SINGLE_ADAPTER_SOLANA_TESTS = [
  'basic-tests.spec.ts',
  'canary.spec.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'wallet.spec.ts'
]

const SINGLE_ADAPTER_EVM_TESTS_REGEX = new RegExp(SINGLE_ADAPTER_EVM_TESTS.join('|'), 'u')
const SINGLE_ADAPTER_SOLANA_TESTS_REGEX = new RegExp(SINGLE_ADAPTER_SOLANA_TESTS.join('|'), 'u')

const customProjectProperties: CustomProjectProperties = {
  'Desktop Chrome/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX.source
  },
  'Desktop Firefox/ethers': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX.source
  },
  'Desktop Chrome/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX.source
  },
  'Desktop Firefox/ethers5': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX.source
  },
  'Desktop Chrome/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX.source
  },
  'Desktop Firefox/wagmi': {
    testMatch: SINGLE_ADAPTER_EVM_TESTS_REGEX.source
  },
  'Desktop Chrome/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX.source
  },
  'Desktop Firefox/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX.source
  },
  'Desktop Firefox/multichain-ethers-solana': {
    testMatch: 'multichain-ethers-solana.spec.ts'
  },
  'Desktop Firefox/multichain-wagmi-solana': {
    testMatch: 'multichain-wagmi-solana.spec.ts'
  },
  'Desktop Firefox/multichain-ethers5-solana': {
    testMatch: 'multichain-ethers5-solana.spec.ts'
  },
  'Desktop Chrome/multichain-ethers-solana': {
    testMatch: 'multichain-ethers-solana.spec.ts'
  },
  'Desktop Chrome/multichain-wagmi-solana': {
    testMatch: 'multichain-wagmi-solana.spec.ts'
  },
  'Desktop Chrome/multichain-ethers5-solana': {
    testMatch: 'multichain-ethers5-solana.spec.ts'
  }
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
