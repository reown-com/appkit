export const ONRAMP_TRANSACTIONS_RESPONSES_JAN = {
  SUCCESS: {
    id: '1eeccf2f-ef04-6d48-a2dd-0e1dca1d3cfb',
    metadata: {
      operationType: 'buy',
      hash: '0xbf5f116e0e77b304404ff873b527578d8c0a247732a50b0da174a533b669ab5b',
      minedAt: '2024-01-15T16:59:37.345Z',
      sentFrom: 'Coinbase',
      sentTo: '0xf3ea39310011333095CFCcCc7c4Ad74034CABA64',
      status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
      nonce: 1,
      chain: 'eip155:137'
    },
    transfers: [
      {
        fungible_info: {
          name: 'USDC',
          symbol: 'USDC'
        },
        direction: 'in',
        quantity: {
          numeric: '3.003898'
        }
      }
    ]
  },
  FAILED: {
    id: '1eeccf2f-ef04-6d48-a2dd-0e1dca1d3cfb',
    metadata: {
      operationType: 'buy',
      hash: '',
      minedAt: '2024-01-15T16:59:37.345Z',
      sentFrom: 'Coinbase',
      sentTo: '0xf3ea39310011333095CFCcCc7c4Ad74034CABA64',
      status: 'ONRAMP_TRANSACTION_STATUS_FAILED',
      nonce: 1
    },
    transfers: [
      {
        fungible_info: {
          name: 'USDC',
          symbol: 'USDC'
        },
        direction: 'in',
        quantity: {
          numeric: '4.995375'
        }
      }
    ]
  },
  IN_PROGRESS: {
    id: '1eeccf2f-ef04-6d48-a2dd-0e1dca1d3cfb',
    metadata: {
      operationType: 'buy',
      hash: '',
      minedAt: '2024-01-15T16:59:37.345Z',
      sentFrom: 'Coinbase',
      sentTo: '0xf3ea39310011333095CFCcCc7c4Ad74034CABA64',
      status: 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS',
      nonce: 1
    },
    transfers: [
      {
        fungible_info: {
          name: 'USDC',
          symbol: 'USDC'
        },
        direction: 'in',
        quantity: {
          numeric: '4.995375'
        }
      }
    ]
  }
}

export const ONRAMP_TRANSACTIONS_RESPONSES_FEB = {
  SUCCESS: {
    id: '1eecc239-9ed5-696e-afeb-129d128962f1',
    metadata: {
      operationType: 'buy',
      hash: '0xbf5f116e0e77b304404ff873b527578d8c0a247732a50b0da174a533b669ab5b',
      minedAt: '2024-02-15T16:59:37.345Z',
      sentFrom: 'Coinbase',
      sentTo: '0xf3ea39310011333095CFCcCc7c4Ad74034CABA64',
      status: 'ONRAMP_TRANSACTION_STATUS_SUCCESS',
      nonce: 1,
      chain: 'eip155:137'
    },
    transfers: [
      {
        fungible_info: {
          name: 'USDC',
          symbol: 'USDC'
        },
        direction: 'in',
        quantity: {
          numeric: '3.003898'
        }
      }
    ]
  },
  FAILED: {
    id: '1eecc239-9ed5-696e-afeb-129d128962f1',
    metadata: {
      operationType: 'buy',
      hash: '',
      minedAt: '2024-02-15T16:59:37.345Z',
      sentFrom: 'Coinbase',
      sentTo: '0xf3ea39310011333095CFCcCc7c4Ad74034CABA64',
      status: 'ONRAMP_TRANSACTION_STATUS_FAILED',
      nonce: 1
    },
    transfers: [
      {
        fungible_info: {
          name: 'USDC',
          symbol: 'USDC'
        },
        direction: 'in',
        quantity: {
          numeric: '4.995375'
        }
      }
    ]
  },
  IN_PROGRESS: {
    id: '1eecc239-9ed5-696e-afeb-129d128962f1',
    metadata: {
      operationType: 'buy',
      hash: '',
      minedAt: '2024-02-15T16:59:37.345Z',
      sentFrom: 'Coinbase',
      sentTo: '0xf3ea39310011333095CFCcCc7c4Ad74034CABA64',
      status: 'ONRAMP_TRANSACTION_STATUS_IN_PROGRESS',
      nonce: 1
    },
    transfers: [
      {
        fungible_info: {
          name: 'USDC',
          symbol: 'USDC'
        },
        direction: 'in',
        quantity: {
          numeric: '4.995375'
        }
      }
    ]
  }
}
