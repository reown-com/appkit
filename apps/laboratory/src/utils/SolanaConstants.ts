import { solana, solanaDevnet, solanaLocalNet, solanaTestnet } from './ChainsUtil'

export const SolanaConstantsUtil = {
  chains: [solana, solanaTestnet, solanaDevnet, solanaLocalNet],
  programIds: {
    devNet: 'Cb5aXEgXptKqHHWLifvXu5BeAuVLjojQ5ypq6CfQj1hy',
    testNet: 'FZn4xQoKKvcxDADDRdqNAAPnVv9qYCbUTbP3y4Rn1BBr',
    localNet: 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS'
  }
}
