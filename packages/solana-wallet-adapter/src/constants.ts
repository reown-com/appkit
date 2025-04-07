/* eslint-disable no-shadow */
export enum WalletConnectChainID {
  Mainnet = 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  Devnet = 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  Deprecated_Mainnet = 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
  Deprecated_Devnet = 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
}

export enum WalletConnectRPCMethods {
  signTransaction = 'solana_signTransaction',
  signMessage = 'solana_signMessage',
  signAndSendTransaction = 'solana_signAndSendTransaction',
  signAndSendAllTransactions = 'solana_signAndSendAllTransactions',
  signAllTransactions = 'solana_signAllTransactions'
}

export const SolanaChainIDs = {
  Mainnet: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  Devnet: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  Deprecated_Mainnet: 'solana:4sGjMW1sUnHzSxGspuhpqLDx6wiyjNtZ',
  Deprecated_Devnet: 'solana:8E9rvCKLFQia2Y35HXjjpWzj8weVo44K'
} as const
