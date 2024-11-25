import { solana, solanaDevnet, solanaTestnet } from '@reown/appkit-new/networks'

export const COUNTER_ACCOUNT_SIZE = 8

export const SolanaConstantsUtil = {
  // You can add local net in chains if you're using local validator
  chains: [solana, solanaTestnet, solanaDevnet],
  programIds: [
    {
      chainId: solanaDevnet.id,
      programId: 'Cb5aXEgXptKqHHWLifvXu5BeAuVLjojQ5ypq6CfQj1hy'
    },
    {
      chainId: solanaTestnet.id,
      programId: 'FZn4xQoKKvcxDADDRdqNAAPnVv9qYCbUTbP3y4Rn1BBr'
    }
  ]
}
