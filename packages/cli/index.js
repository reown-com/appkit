#!/usr/bin/env node
import inquirer from 'inquirer'

import {
  banner,
  checkDirectoryExists,
  cloneRepository,
  generateRepoUrl,
  runReactNativeCLI
} from './utils.js'

// Display CLI Banner
console.log(banner)

async function questionDirectory() {
  const answer = await inquirer.prompt({ message: 'Enter your project name: ', name: 'directory' })

  return answer.directory
}

async function questionFramework() {
  const framework = [
    {
      type: 'list',
      name: 'framework',
      message: 'Select the framework for your project:',
      choices: [
        { name: 'Next.js', value: 'nextjs' },
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
        { name: 'Javascript', value: 'javascript' },
        { name: 'React Native', value: 'react-native' }
      ]
    }
  ]

  return await inquirer.prompt(framework)
}

async function questionLibrary() {
  const library = [
    {
      type: 'list',
      name: 'library',
      message: 'Wagmi, Ethers, Solana, Bitcoin or EVM+Solana ?',
      choices: [
        { name: 'Wagmi', value: 'wagmi' },
        { name: 'Ethers', value: 'ethers' },
        { name: 'Solana', value: 'solana' },
        { name: 'Bitcoin', value: 'bitcoin' },
        { name: 'Multichain', value: 'multichain' }
      ]
    }
  ]

  return await inquirer.prompt(library)
}

export async function main() {
  let directoryName = process.argv[2] || ''

  const answerFramework = await questionFramework()

  if (answerFramework.framework === 'react-native') {
    await runReactNativeCLI(directoryName)

    return
  }

  let directoryExists = false
  do {
    if (!directoryName) {
      directoryName = await questionDirectory()
    }
    directoryExists = await checkDirectoryExists(directoryName)
    if (directoryExists) {
      console.log(`The directory already exists, please choose another name`)
      directoryName = ''
    }
  } while (directoryExists)

  const answerLibrary = await questionLibrary()
  const repoUrl = generateRepoUrl(answerFramework, answerLibrary)

  await cloneRepository(repoUrl, directoryName)

  const url = 'https://dashboard.reown.com'
  console.log(`Your 'Project Id' will work only on the localhost environment`)
  console.log(`
Go to: ${url}
To create a personal ProjectId
`)
}

main()
