import { promises } from 'fs'
import tiged from 'tiged'

export async function checkDirectoryExists(directory) {
  try {
    await promises.access(directory)

    return true
  } catch (error) {
    return false
  }
}

export function generateRepoUrl(answerFramework, answerLibrary) {
  // Library = wagmi // framework = nextjs
  switch (answerFramework.framework) {
    case 'nextjs':
      return `reown-com/appkit-web-examples/nextjs/next-${answerLibrary.library}-app-router`
    case 'react':
      return `reown-com/appkit-web-examples/react/react-${answerLibrary.library}`
    case 'vue':
      return `reown-com/appkit-web-examples/vue/vue-${answerLibrary.library}`
    case 'javascript':
      return `reown-com/appkit-web-examples/javascript/javascript-${answerLibrary.library}`
    default:
      return 'reown-com/appkit-web-examples/react/react-wagmi'
  }
}

export async function cloneRepository(repoUrl, directoryName) {
  try {
    console.log(`
        Downloading the repository ...
`)

    const emitter = tiged(repoUrl, {
      disableCache: true,
      force: true,
      verbose: false
    })

    await emitter.clone(directoryName)

    console.log(`
        - cd ${directoryName}
        - npm install
        - npm run dev
        `)
  } catch (error) {
    console.error('Failed to clone the repository:', error)
  }
}

export async function runReactNativeCLI(directoryName) {
  const { execSync } = await import('child_process')
  try {
    const nameCommand = directoryName ? `--name ${directoryName}` : ''
    execSync(`npx @reown/appkit-react-native-cli --no-banner ${nameCommand}`, {
      stdio: 'inherit'
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error running AppKit React Native CLI:', error.message)
  }
}

export const banner = `
     @@@@@@@           @@@@@@@@@@@@@@@@@@      
   @@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@   
  @@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@  
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@  
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@   @@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@   @@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@  @@@@@@@@@@@@@             Reown AppKit CLI 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@   @@@@@@@@@@@@@             The easiest way to build dApps!
 @@@@@@   @@@@@@  @@@@@@@@@@@   @@@@@@@@@@@@@@ 
 @@@@@@   @@@@@@  @@@@@@@@@@@  @@@@@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@   @@@@@@@@@@@@@@@ 
 @@@@@@@@@@@@@@@  @@@@@@@@@@@@@@@@@@@@@@@@@@@  
  @@@@@@@@@@@@@    @@@@@@@@@@@@@@@@@@@@@@@@@@  
   @@@@@@@@@@@      @@@@@@@@@@@@@@@@@@@@@@@@   
      @@@@@            @@@@@@@@@@@@@@@@@@      
`
