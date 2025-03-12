import { ConstantsUtil as CommonConstantsUtil } from '@reown/appkit-common'
import type { ConnectorType } from '@reown/appkit-core'

import { ConstantsUtil } from './ConstantsUtil.js'

export const PresetsUtil = {
  ConnectorExplorerIds: {
    [CommonConstantsUtil.CONNECTOR_ID.COINBASE]:
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    [CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK]:
      'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    [CommonConstantsUtil.CONNECTOR_ID.SAFE]:
      '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
    [CommonConstantsUtil.CONNECTOR_ID.LEDGER]:
      '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
    [CommonConstantsUtil.CONNECTOR_ID.OKX]:
      '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709',

    /* Connector names */
    [ConstantsUtil.METMASK_CONNECTOR_NAME]:
      'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    [ConstantsUtil.TRUST_CONNECTOR_NAME]:
      '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    [ConstantsUtil.SOLFLARE_CONNECTOR_NAME]:
      '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79',
    [ConstantsUtil.PHANTOM_CONNECTOR_NAME]:
      'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
    [ConstantsUtil.COIN98_CONNECTOR_NAME]:
      '2a3c89040ac3b723a1972a33a125b1db11e258a6975d3a61252cd64e6ea5ea01',
    [ConstantsUtil.MAGIC_EDEN_CONNECTOR_NAME]:
      '8b830a2b724a9c3fbab63af6f55ed29c9dfa8a55e732dc88c80a196a2ba136c6',
    [ConstantsUtil.BACKPACK_CONNECTOR_NAME]:
      '2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0',
    [ConstantsUtil.BITGET_CONNECTOR_NAME]:
      '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
    [ConstantsUtil.FRONTIER_CONNECTOR_NAME]:
      '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041',
    [ConstantsUtil.XVERSE_CONNECTOR_NAME]:
      '2a87d74ae02e10bdd1f51f7ce6c4e1cc53cd5f2c0b6b5ad0d7b3007d2b13de7b',
    [ConstantsUtil.LEATHER_CONNECTOR_NAME]:
      '483afe1df1df63daf313109971ff3ef8356ddf1cc4e45877d205eee0b7893a13'
  } as Record<string, string>,
  NetworkImageIds: {
    // Ethereum
    1: 'ba0ba0cd-17c6-4806-ad93-f9d174f17900',
    // Arbitrum
    42161: '3bff954d-5cb0-47a0-9a23-d20192e74600',
    // Avalanche
    43114: '30c46e53-e989-45fb-4549-be3bd4eb3b00',
    // Binance Smart Chain
    56: '93564157-2e8e-4ce7-81df-b264dbee9b00',
    // Fantom
    250: '06b26297-fe0c-4733-5d6b-ffa5498aac00',
    // Optimism
    10: 'ab9c186a-c52f-464b-2906-ca59d760a400',
    // Polygon
    137: '41d04d42-da3b-4453-8506-668cc0727900',
    // Mantle
    5000: 'e86fae9b-b770-4eea-e520-150e12c81100',
    // Hedera Mainnet
    295: '6a97d510-cac8-4e58-c7ce-e8681b044c00',
    // Sepolia
    11_155_111: 'e909ea0a-f92a-4512-c8fc-748044ea6800',
    // Base Sepolia
    84532: 'a18a7ecd-e307-4360-4746-283182228e00',
    // Unichain Sepolia
    1301: '4eeea7ef-0014-4649-5d1d-07271a80f600',
    // Unichain Mainnet
    130: '2257980a-3463-48c6-cbac-a42d2a956e00',
    // Monad Testnet
    10_143: '0a728e83-bacb-46db-7844-948f05434900',
    // Gnosis
    100: '02b53f6a-e3d4-479e-1cb4-21178987d100',
    // EVMos
    9001: 'f926ff41-260d-4028-635e-91913fc28e00',
    // ZkSync
    324: 'b310f07f-4ef7-49f3-7073-2a0a39685800',
    // Filecoin
    314: '5a73b3dd-af74-424e-cae0-0de859ee9400',
    // Iotx
    4689: '34e68754-e536-40da-c153-6ef2e7188a00',
    // Metis,
    1088: '3897a66d-40b9-4833-162f-a2c90531c900',
    // Moonbeam
    1284: '161038da-44ae-4ec7-1208-0ea569454b00',
    // Moonriver
    1285: 'f1d73bb6-5450-4e18-38f7-fb6484264a00',
    // Zora
    7777777: '845c60df-d429-4991-e687-91ae45791600',
    // Celo
    42220: 'ab781bbc-ccc6-418d-d32d-789b15da1f00',
    // Base
    8453: '7289c336-3981-4081-c5f4-efc26ac64a00',
    // Aurora
    1313161554: '3ff73439-a619-4894-9262-4470c773a100',
    // Ronin Mainnet
    2020: 'b8101fc0-9c19-4b6f-ec65-f6dfff106e00',
    // Saigon Testnet (a.k.a. Ronin)
    2021: 'b8101fc0-9c19-4b6f-ec65-f6dfff106e00',
    // Solana networks
    '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp': 'a1b58899-f671-4276-6a5e-56ca5bd59700',
    '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z': 'a1b58899-f671-4276-6a5e-56ca5bd59700',
    EtWTRABZaYq6iMfeYKouRu166VU2xqa1: 'a1b58899-f671-4276-6a5e-56ca5bd59700',
    // Bitcoin
    '000000000019d6689c085ae165831e93': '21c895fa-e105-4829-9434-378bb54fa600',
    // Bitcoin Testnet
    '000000000933ea01ad0ee984209779ba': '220bcb01-ba47-41d3-fe5b-e29bbc4a4b00'
  } as Record<string, string>,

  ConnectorImageIds: {
    [CommonConstantsUtil.CONNECTOR_ID.COINBASE]: '0c2840c3-5b04-4c44-9661-fbd4b49e1800',
    [CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK]: '0c2840c3-5b04-4c44-9661-fbd4b49e1800',
    [CommonConstantsUtil.CONNECTOR_ID.SAFE]: '461db637-8616-43ce-035a-d89b8a1d5800',
    [CommonConstantsUtil.CONNECTOR_ID.LEDGER]: '54a1aa77-d202-4f8d-0fb2-5d2bb6db0300',
    [CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT]: 'ef1a1fcf-7fe8-4d69-bd6d-fda1345b4400',
    [CommonConstantsUtil.CONNECTOR_ID.INJECTED]: '07ba87ed-43aa-4adf-4540-9e6a2b9cae00'
  } as Record<string, string>,

  ConnectorNamesMap: {
    [CommonConstantsUtil.CONNECTOR_ID.INJECTED]: 'Browser Wallet',
    [CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT]: 'WalletConnect',
    [CommonConstantsUtil.CONNECTOR_ID.COINBASE]: 'Coinbase',
    [CommonConstantsUtil.CONNECTOR_ID.COINBASE_SDK]: 'Coinbase',
    [CommonConstantsUtil.CONNECTOR_ID.LEDGER]: 'Ledger',
    [CommonConstantsUtil.CONNECTOR_ID.SAFE]: 'Safe'
  } as Record<string, string>,

  ConnectorTypesMap: {
    [CommonConstantsUtil.CONNECTOR_ID.INJECTED]: 'INJECTED',
    [CommonConstantsUtil.CONNECTOR_ID.WALLET_CONNECT]: 'WALLET_CONNECT',
    [CommonConstantsUtil.CONNECTOR_ID.EIP6963]: 'ANNOUNCED',
    [CommonConstantsUtil.CONNECTOR_ID.AUTH]: 'AUTH'
  } as Record<string, ConnectorType>,

  WalletConnectRpcChainIds: [
    // Ethereum
    1,
    // Ethereum Goerli
    5,
    // Ethereum Sepolia
    11155111,
    // Optimism
    10,
    // Optimism Goerli
    420,
    // Arbitrum
    42161,
    // Arbitrum Goerli
    421613,
    // Polygon
    137,
    // Polygon Mumbai
    80001,
    // Celo Mainnet
    42220,
    // Aurora
    1313161554,
    // Aurora Testnet
    1313161555,
    // Binance Smart Chain
    56,
    // Binance Smart Chain Testnet
    97,
    // Avalanche C-Chain
    43114,
    // Avalanche Fuji Testnet
    43113,
    // Gnosis Chain
    100,
    // Base
    8453,
    // Base Goerli
    84531,
    // Zora
    7777777,
    // Zora Goerli
    999,
    // ZkSync Era Mainnet
    324,
    // ZkSync Era Testnet
    280
  ]
}
