/**
 * Direct TRON fullnode REST calls, used as a fallback for chains the Blockchain API RPC proxy
 * (rpc.walletconnect.org) doesn't support (e.g. the Shasta testnet). This is the same request
 * shape TRON's `/wallet/createtransaction` and `/wallet/broadcasttransaction` endpoints expect
 * directly, independent of any WalletConnect-specific JSON-RPC wrapping.
 */
export const TronFullnodeUtil = {
  async createTransaction(
    fullNodeUrl: string,
    params: { from: string; to: string; value: string }
  ): Promise<Record<string, unknown> & { txID: string }> {
    const response = await fetch(`${fullNodeUrl}/wallet/createtransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: params.from,
        to_address: params.to,
        amount: parseInt(params.value, 10),
        visible: true
      })
    })

    const unsignedTx = await response.json()

    if (!unsignedTx?.txID) {
      throw new Error(unsignedTx?.Error || 'Failed to create transaction')
    }

    return unsignedTx
  },

  async broadcastTransaction(
    fullNodeUrl: string,
    signedTx: Record<string, unknown>
  ): Promise<{ result: boolean; txid?: string; message?: string }> {
    const response = await fetch(`${fullNodeUrl}/wallet/broadcasttransaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(signedTx)
    })

    const result = await response.json()

    if (!result?.result) {
      throw new Error(result?.message || 'Failed to broadcast transaction')
    }

    return result
  }
}
