export const ConstantsUtil = {
  SECURE_SITE_ORIGIN:
    process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN'] || 'https://secure.walletconnect.org',

  Socials: ['google', 'github', 'apple', 'facebook', 'x', 'discord', 'farcaster'] as const,

  WalletButtonsIds: {
    coinbase: 'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa',
    metamask: 'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    trust: '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0',
    okx: '971e689d0a5be527bac79629b4ee9b925e82208e5168b733496a09c0faed0709',
    bitget: '38f5d18bd8522c244bdd70cb4a68e0e718865155811c043f052fb9f1c51de662',
    binance: '8a0ee50d1f22f6651afcae7eb4253e52a3310b90af5daef78a8c4929a9bb99d4',
    uniswap: 'c03dfee351b6fcc421b4494ea33b9d4b92a984f87aa76d1663bb28705e95034a',
    safepal: '0b415a746fb9ee99cce155c2ceca0c6f6061b1dbca2d722b3ba16381d0562150',
    rainbow: '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369',
    bybit: '15c8b91ade1a4e58f3ce4e7a0dd7f42b47db0c8df7e0d84f63eb39bcb96c4e0f',
    tokenpocket: '20459438007b75f4f4acb98bf29aa3b800550309646d375da5fd4aac6c2a2c66',
    ledger: '19177a98252e07ddfc9af2083ba8e07ef627cb6103467ffebb3f8f4205fd7927',
    'timeless-x': '344d0e58b139eb1b6da0c29ea71d52a8eace8b57897c6098cb9b46012665c193',
    safe: '225affb176778569276e484e1b92637ad061b01e13a048b35a9d280c3b58970f',
    zerion: 'ecc4036f814562b41a5268adc86270fba1365471402006302e70169465b7ac18',
    oneinch: 'c286eebc742a537cd1d6818363e9dc53b21759a1e8e5d9b263d0c03ec7703576',
    'crypto-com': 'f2436c67184f158d1beda5df53298ee84abfc367581e4505134b5bcf5f46697d',
    imtoken: 'ef333840daf915aafdc4a004525502d6d49d77bd9c65e0642dbaefb3c2893bef',
    kraken: '18450873727504ae9315a084fa7624b5297d2fe5880f0982979c17345a138277',
    ronin: '541d5dcd4ede02f3afaf75bf8e3e4c4f1fb09edb5fa6c4377ebf31c2785d9adf',
    robinhood: '8837dd9413b1d9b585ee937d27a816590248386d9dbf59f5cd3422dbbb65683e',
    exodus: 'e9ff15be73584489ca4a66f64d32c4537711797e30b6660dbcb71ea72a42b1f4',
    argent: 'bc949c5d968ae81310268bf9193f9c9fb7bb4e1283e1284af8f2bd4992535fd6',
    jupiter: '0ef262ca2a56b88d179c93a21383fee4e135bd7bc6680e5c2356ff8e38301037'
  } as const
}