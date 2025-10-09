/**
 * TON Provider Test Script
 *
 * This script tests the TonProvider implementation locally
 * Run with: node test-ton-provider.js
 */

async function testTonProvider() {
  console.log('\n🧪 Testing TON Provider Implementation...\n')

  try {
    // Import dependencies
    const { TonProvider } = require('./dist/core/TonProvider')

    console.log('✅ TonProvider imported successfully')

    // Initialize provider
    const provider = await TonProvider.init()
    console.log('✅ TonProvider initialized')

    // Get address
    const address = await provider.getAddress()
    console.log('✅ Address:', address)

    // Get secret key (for verification only - never expose in production)
    const secretKey = provider.getSecretKey()
    console.log('✅ Secret key length:', secretKey.length, 'chars')

    // Test signMessage
    const signMessageResult = await provider.signMessage({
      message: 'Hello TON!'
    })
    console.log('✅ Sign message result:')
    console.log('   - Signature:', signMessageResult.signature.substring(0, 20) + '...')
    console.log('   - Public key:', signMessageResult.publicKey.substring(0, 20) + '...')

    // Test signData (text)
    const signDataTextResult = await provider.signData({
      type: 'text',
      text: 'Test message',
      from: address
    })
    console.log('✅ Sign data (text) result:')
    console.log('   - Signature:', signDataTextResult.signature.substring(0, 20) + '...')
    console.log('   - Address:', signDataTextResult.address)
    console.log('   - Timestamp:', signDataTextResult.timestamp)

    // Test signData (binary)
    const binaryData = Buffer.from('Test binary data').toString('base64')
    const signDataBinaryResult = await provider.signData({
      type: 'binary',
      bytes: binaryData,
      from: address
    })
    console.log('✅ Sign data (binary) result:')
    console.log('   - Signature:', signDataBinaryResult.signature.substring(0, 20) + '...')

    console.log('\n✨ All tests passed!\n')
    console.log('Next steps:')
    console.log('1. Build the extension: pnpm build')
    console.log('2. Load it in Chrome')
    console.log('3. Test with AppKit laboratory app')
    console.log()
  } catch (error) {
    console.error('\n❌ Test failed:', error.message)
    console.error('\nMake sure to:')
    console.error('1. Run "pnpm install" first')
    console.error('2. Build the extension: "pnpm build"')
    console.error('3. Set TON_PRIVATE_KEY in .env.local\n')
    process.exit(1)
  }
}

// Run tests
testTonProvider()
