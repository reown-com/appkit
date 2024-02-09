import type { Schema } from 'borsh';
import { serialize } from 'borsh';
import { Box, Button, Heading, useToast } from '@chakra-ui/react'

import { useWeb3ModalAccount, useWeb3ModalProvider } from '@web3modal/solana/react'

const PHANTOM_DEVNET_ADDRESS = 'EmT8r4E8ZjoQgt8sXGbaWBRMKfUXsVT1wonoSnJZ4nBn'

class Person {
  name: string;
  wallet: string;

  constructor({ name, wallet }: { name: string, wallet: string }) {
    this.name = name;
    this.wallet = wallet;
  }
}

class Mail {
  from: Person;
  to: Person;
  contents: string;

  constructor({ from, to, contents }: { from: Person, to: Person, contents: string }) {
    this.from = from;
    this.to = to;
    this.contents = contents;
  }
}

// Define the schema for Borsh serialization
const schema: Schema = new Map<any, any>([
  [Person, { kind: 'struct', fields: [['name', 'string'], ['wallet', 'string']] }],
  [Mail, { kind: 'struct', fields: [['from', Person], ['to', Person], ['contents', 'string']] }]
]);

const message = new Mail({
  from: new Person({
    name: 'Cow',
    wallet: PHANTOM_DEVNET_ADDRESS
  }),
  to: new Person({
    name: 'Bob',
    wallet: PHANTOM_DEVNET_ADDRESS
  }),
  contents: 'Hello, Bob!'
});

export function SolanaSignTypedDataTest() {
  const toast = useToast()
  const { address } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  async function onSignTypedData() {
    try {
      if (!walletProvider || !address) {
        throw Error('user is disconnected')
      }
      // Serialize the data
      const serializedData = serialize(schema, message);

      let signature
      // Phantom exception because it treats serialized object as a transaction
      if (walletProvider.name === 'Phantom') {
        signature = await walletProvider.signMessage(new TextEncoder().encode(JSON.stringify(message)));
      }
      signature = await walletProvider.signMessage(serializedData);

      toast({ title: 'Succcess', description: signature, status: 'success', isClosable: true })
    } catch (err) {
      console.log(`err`, err);
      toast({
        title: 'Error',
        description: 'Failed to sign message',
        status: 'error',
        isClosable: true
      })
    }
  }

  return (
    <Box>
      <Heading size="xs" textTransform="uppercase" pb="2">
        Sign Typed Data
      </Heading>
      <Button data-testid="sign-typed-data-button" onClick={onSignTypedData}>
        Sign Typed Data
      </Button>
    </Box>

  )
}
