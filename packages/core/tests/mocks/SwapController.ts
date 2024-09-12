import type { CaipAddress } from '@reown/appkit-common'

export const tokensResponse = {
  tokens: [
    {
      name: 'MATIC',
      symbol: 'MATIC',
      address: 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as CaipAddress,
      decimals: 18,
      logoUri: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
      eip2612: false
    },
    {
      name: 'Avalanche Token',
      symbol: 'AVAX',
      address: 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b' as CaipAddress,
      decimals: 18,
      logoUri: 'https://tokens.1inch.io/0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b.png',
      eip2612: false
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      address: 'eip155:137:0x3c499c542cef5e3811e1192ce70d8cc03d5c3359' as CaipAddress,
      decimals: 6,
      logoUri: 'https://tokens.1inch.io/0x3c499c542cef5e3811e1192ce70d8cc03d5c3359.png',
      eip2612: false
    }
  ]
}

export const networkTokenPriceResponse = {
  fungibles: [
    {
      name: 'MATIC',
      symbol: 'MATIC',
      iconUrl: 'https://tokens.1inch.io/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png',
      price: 0.7207
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      iconUrl:
        'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
      price: 1.0000718186
    }
  ]
}

export const balanceResponse = {
  balances: [
    {
      name: 'Matic Token',
      symbol: 'MATIC',
      chainId: 'eip155:137',
      value: 7.1523453459986115,
      price: 0.7206444126000001,
      quantity: {
        decimals: '18',
        numeric: '9.924929994522253814'
      },
      iconUrl: 'https://token-icons.s3.amazonaws.com/0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0.png'
    },
    {
      name: 'Wrapped AVAX',
      symbol: 'AVAX',
      chainId: 'eip155:137',
      address: 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b',
      value: 0.692163347318501,
      price: 40.101925674,
      quantity: {
        decimals: '18',
        numeric: '0.017260102493463641'
      },
      iconUrl: 'https://token-icons.s3.amazonaws.com/0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7.png'
    },
    {
      name: 'USD Coin',
      symbol: 'USDC',
      chainId: 'eip155:137',
      address: 'eip155:137:0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      value: 2.711438769801216,
      price: 0.999957504,
      quantity: {
        decimals: '6',
        numeric: '2.711554'
      },
      iconUrl: 'https://token-icons.s3.amazonaws.com/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png'
    }
  ]
}

export const allowanceResponse = {
  allowance: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
}

export const swapQuoteResponse = {
  quotes: [
    {
      id: null,
      fromAmount: '1000000000000000000',
      fromAccount: 'eip155:137:0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
      toAmount: '17259970548235021',
      toAccount: 'eip155:137:0x2c89bbc92bd86f8075d1decc58c7f4e0107f286b'
    }
  ]
}

export const swapCalldataResponse = {
  tx: {
    from: 'eip155:137:0xe8e0d27a1232ada1d76ac4032a100f8f9f3486b2' as CaipAddress,
    to: 'eip155:137:0x111111125421ca6dc452d289314280a0f8842a65' as CaipAddress,
    data: '0x07ed2379000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd09000000000000000000000000eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee000000000000000000000000d6df932a45c0f255f85145f286ea0b292b21c90b000000000000000000000000e37e799d5077682fa0a244d46e5649f71457bd09000000000000000000000000e8e0d27a1232ada1d76ac4032a100f8f9f3486b20000000000000000000000000000000000000000000000000de0b6b3a7640000000000000000000000000000000000000000000000000000001a5256ff077cbc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000014900000000000000000000000000000000012b0000fd00006e00005400004e802026678dcd00000000000000000000000000000000000000003e26ca57697d2ad49edd5c3787256586d0b50525000000000000000000000000000000000000000000000000001e32b47897400000206b4be0b940410d500b1d8e8ef31e21c99d1db9a6444d3adf1270d0e30db00c200d500b1d8e8ef31e21c99d1db9a6444d3adf12707d88d931504d04bfbee6f9745297a93063cab24c6ae40711b8002dc6c07d88d931504d04bfbee6f9745297a93063cab24c111111125421ca6dc452d289314280a0f8842a65000000000000000000000000000000000000000000000000001a5256ff077cbc0d500b1d8e8ef31e21c99d1db9a6444d3adf12700020d6bdbf78d6df932a45c0f255f85145f286ea0b292b21c90b111111125421ca6dc452d289314280a0f8842a6500000000000000000000000000000000000000000000003bd94e2a' as `0x${string}`,
    amount: '7483720195780716',
    eip155: {
      gas: '253421',
      gasPrice: '151168582876'
    }
  }
}

export const gasPriceResponse = {
  standard: '60000000128',
  fast: '150000000128',
  instant: '195000000166'
}
