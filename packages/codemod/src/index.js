#!/usr/bin/env node
import { updateDependencies } from './utils.js'

// Get command and package names from command-line arguments
const [command, ...packagesToUpdate] = process.argv.slice(2)

// Check if the command is 'upgrade'
if (command === 'upgrade') {
  // Execute the update function and handle errors
  updateDependencies(packagesToUpdate).catch(err => console.error(err))
} else {
  console.error(`Unknown command: ${command}`)
  process.exit(1)
}
