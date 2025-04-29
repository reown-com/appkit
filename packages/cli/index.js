#!/usr/bin/env node
import chalk from 'chalk'
import inquirer from 'inquirer'

import { banner, checkDirectoryExists, cloneRepository, generateRepoUrl } from './utils.js'

// Define styles
const redTip = chalk.hex('#C70039') // Red for tips

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
      message: 'Which framework will be used ?',
      choices: [
        { name: 'Next.js', value: 'nextjs' },
        { name: 'React', value: 'react' },
        { name: 'Vue', value: 'vue' },
        { name: 'Javascript', value: 'javascript' }
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
      message: 'AppKit Core, Wagmi, Ethers, Solana, Bitcoin or EVM+Solana ?',
      choices: [
        { name: 'AppKit Core', value: 'core' },
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

  const answerFramework = await questionFramework()
  const answerLibrary = await questionLibrary()
  const repoUrl = generateRepoUrl(answerFramework, answerLibrary)

  await cloneRepository(repoUrl, directoryName)

  const url = 'https://cloud.reown.com'
  console.log(`Your ${redTip('Project Id')} will work only on the localhost enviroment`)
  console.log(`
Go to: ${url}
To create a personal ProjectId
`)
}

main()
