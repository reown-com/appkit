import { devices } from '@playwright/test'

import { DESKTOP_DEVICES } from '../constants/devices'

const LIBRARIES = ['ethers', 'ethers5', 'wagmi', 'solana', 'bitcoin'] as const

const LIBRARY_PERMUTATIONS = DESKTOP_DEVICES.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
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

const SINGLE_ADAPTER_EVM_TESTS = ['siwe-sa.spec.ts', 'smart-account.spec.ts']

const SINGLE_ADAPTER_SOLANA_TESTS = [
  'extension.spec.ts',
  'basic-tests.spec.ts',
  'siwx-extension.ts',
  'email.spec.ts',
  'no-email.spec.ts',
  'no-socials.spec.ts',
  'wallet.spec.ts',
  'wallet-button.spec'
]

function createRegex(tests: string[], isDesktop = true) {
  const desktopCheck = isDesktop ? '(?!.*/mobile-)' : ''

  return new RegExp(`^(?!.*/multichain/)${desktopCheck}.*(?:${tests.join('|')})`, 'u')
}

const SINGLE_ADAPTER_EVM_TESTS_REGEX = createRegex(SINGLE_ADAPTER_EVM_TESTS)
const SINGLE_ADAPTER_SOLANA_TESTS_REGEX = createRegex(SINGLE_ADAPTER_SOLANA_TESTS)

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
  'Desktop Chrome/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: /siwe-email\.spec\.ts|siwe-extension\.spec\.ts|multichain-.*\.spec\.ts/u
  },
  'Desktop Firefox/solana': {
    testMatch: SINGLE_ADAPTER_SOLANA_TESTS_REGEX,
    testIgnore: /siwe-email\.spec\.ts|siwe-extension\.spec\.ts|multichain-.*\.spec\.ts/u
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

  const projects = [...libraryDesktopProjects]

  return projects
}
