import { solana, solanaDevnet, solanaTestnet, solanaLocalNet } from './ChainsUtil'

export const COUNTER_ACCOUNT_SIZE = 8

export const SolanaConstantsUtil = {
  // You can add local net in chains if you're using local validator
  chains: [solana, solanaTestnet, solanaDevnet],
  programIds: [
    {
      chainId: solanaDevnet.chainId,
      programId: 'Cb5aXEgXptKqHHWLifvXu5BeAuVLjojQ5ypq6CfQj1hy'
    },
    {
      chainId: solanaTestnet.chainId,
      programId: 'FZn4xQoKKvcxDADDRdqNAAPnVv9qYCbUTbP3y4Rn1BBr'
    },
    {
      chainId: solanaLocalNet.chainId,
      programId: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
    }
  ]
}
