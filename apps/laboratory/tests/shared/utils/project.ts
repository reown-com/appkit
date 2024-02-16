import { devices } from "@playwright/test"
import { getAvailableDevices } from "./device";

const availableDevices = getAvailableDevices()

const LIBRARIES = ['wagmi', 'ethers'] as const

const PERMUTATIONS = availableDevices.flatMap(device =>
  LIBRARIES.map(library => ({ device, library }))
)

interface CustomProperties {
  testIgnore?: string,
  testMatch?: string
}

export interface CustomProjectProperties {
  [key: string] : CustomProperties
}

const customProjectProperties: CustomProjectProperties = {
  'Desktop Chrome/wagmi' : {
    testIgnore: 'email.spec.ts'
  },
  'Desktop Firefox/wagmi' : {
    testIgnore: 'email.spec.ts'
  },
  'Desktop Safari/wagmi' : {
    testIgnore: 'email.spec.ts'
  },
}

export interface Permutation {
  device: string,
  library: string
}

export function getProjects(){
  return PERMUTATIONS.map(({ device, library }) => {
    let project = {
      name: `${device}/${library}`,
      use: { ...devices[device], library },
    }
    const props = customProjectProperties[project.name]
    if(props){
      project = {...project,...props}
    }
    return project
  })
}