export const ConstantsUtil = {
  SECURE_SITE_ORIGIN:
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    (typeof process !== 'undefined' && typeof process.env !== 'undefined'
      ? process.env['NEXT_PUBLIC_SECURE_SITE_ORIGIN']
      : undefined) || 'https://secure.walletconnect.org',

  Socials: ['google', 'github', 'apple', 'facebook', 'x', 'discord', 'farcaster'] as const,
  Email: 'email' as const,

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
    jupiter: '0ef262ca2a56b88d179c93a21383fee4e135bd7bc6680e5c2356ff8e38301037',
    solflare: '1ca0bdd4747578705b1939af023d120677c64fe6ca76add81fda36e350605e79',
    phantom: 'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
    coin98: '2a3c89040ac3b723a1972a33a125b1db11e258a6975d3a61252cd64e6ea5ea01',
    'magic-eden': '8b830a2b724a9c3fbab63af6f55ed29c9dfa8a55e732dc88c80a196a2ba136c6',
    backpack: '2bd8c14e035c2d48f184aaa168559e86b0e3433228d3c4075900a221785019b0',
    frontier: '85db431492aa2e8672e93f4ea7acf10c88b97b867b0d373107af63dc4880f041',
    xverse: '2a87d74ae02e10bdd1f51f7ce6c4e1cc53cd5f2c0b6b5ad0d7b3007d2b13de7b',
    leather: '483afe1df1df63daf313109971ff3ef8356ddf1cc4e45877d205eee0b7893a13',
    haha: '719bd888109f5e8dd23419b20e749900ce4d2fc6858cf588395f19c82fd036b3',
    'ambire-wallet': '2c81da3add65899baeac53758a07e652eea46dbb5195b8074772c62a77bbf568',
    bitpay: 'b4678fefcc469583ed4ef58a5bd90ce86208b82803f3c45f2de3e0973d268835',
    'blade-wallet': 'a9104b630bac1929ad9ac2a73a17ed4beead1889341f307bff502f89b46c8501',
    brave: '163d2cf19babf05eb8962e9748f9ebe613ed52ebf9c8107c9a0f104bfcf161b3',
    coinstats: 'bcaec16e531fb5f6dc690d7b70d570421e0209af9a0fe77c6419d516fe0098c2',
    'kresus-superapp': '56bec983b47c8b6eb774890c1c8ae9d95334e10bdb126ab6c11dfaf56fb2b31c',
    'plena-app': '9654c004e02e492c30904a820154e239886edbf4d66bc5d372060809ef4c9111',
    status: 'af9a6dfff9e63977bbde28fb23518834f08b696fe8bff6dd6827acad1814c6be',
    'tomo-wallet': '5e4a8cc31d062b78a7ad9e017135574809b01c4dbbf30e4dbb467ddd43025618',
    valora: 'd01c7758d741b363e637a817a09bcf579feae4db9f5bb16f599fdd1f66e2f974',
    'zengo-wallet': '9414d5a85c8f4eabc1b5b15ebe0cd399e1a2a9d35643ab0ad22a6e4a32f596f0'
  } as const
}
