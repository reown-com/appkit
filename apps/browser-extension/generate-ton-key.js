/**
 * TON Key Generator
 *
 * This script generates a new TON keypair for use in the browser extension.
 * Run with: node generate-ton-key.js
 */

const crypto = require('crypto')

// Generate using Node.js crypto (same as browser crypto.getRandomValues)
const seed = crypto.randomBytes(32)

console.log('\n=== TON Keypair Generated ===\n')
console.log('Add this to your .env file:')
console.log('\nTON_PRIVATE_KEY=' + seed.toString('hex'))
console.log('\n⚠️  Keep this secret key safe and never commit it to version control!\n')

// If @ton/crypto is available, also show the public key and address
try {
  const { keyPairFromSeed } = require('@ton/crypto')
  const { WalletContractV4 } = require('@ton/ton')

  const keypair = keyPairFromSeed(seed)
  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keypair.publicKey })

  console.log('Additional Info:')
  console.log('Public Key:', keypair.publicKey.toString('hex'))
  console.log('Address:', wallet.address.toString())
  console.log()
} catch (e) {
  console.log('Note: Run "npm install" or "bun install" first to see address and public key\n')
}
