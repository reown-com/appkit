import chalk from 'chalk'
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
  // library = wagmi // framework = nextjs
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
    const tip = chalk.hex('#FFA500')

    console.log(`
        ${tip('')}
        ${tip('Downloading the repository ...')}
        `)

    const emitter = tiged(repoUrl, {
      disableCache: true,
      force: true,
      verbose: false
    })

    await emitter.clone(directoryName)

    console.log(`
        ${tip('cd ' + directoryName)}
        ${tip('npm install')}
        ${tip('npm run dev')}
        `)
  } catch (error) {
    console.error('Failed to clone the repository:', error)
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
