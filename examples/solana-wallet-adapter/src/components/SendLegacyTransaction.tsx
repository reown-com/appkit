import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import type { TransactionSignature } from '@solana/web3.js'
import { PublicKey, TransactionMessage, VersionedTransaction } from '@solana/web3.js'
import type { FC } from 'react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const SendLegacyTransaction: FC = () => {
	const { connection } = useConnection()
	const { publicKey, sendTransaction, wallet } = useWallet()
	const supportedTransactionVersions = wallet?.adapter.supportedTransactionVersions

	const onClick = useCallback(async () => {
		let signature: TransactionSignature | undefined = undefined
		try {
			if (!publicKey) throw new Error('Wallet not connected!')
			if (!supportedTransactionVersions) throw new Error("Wallet doesn't support versioned transactions!")
			if (!supportedTransactionVersions.has('legacy')) throw new Error("Wallet doesn't support legacy transactions!")

			const {
				context: { slot: minContextSlot },
				value: { blockhash, lastValidBlockHeight },
			} = await connection.getLatestBlockhashAndContext()

			const message = new TransactionMessage({
				payerKey: publicKey,
				recentBlockhash: blockhash,
				instructions: [
					{
						data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
						keys: [],
						programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
					},
				],
			})
			const transaction = new VersionedTransaction(message.compileToLegacyMessage())

			signature = await sendTransaction(transaction, connection, { minContextSlot })
			toast('Transaction sent: ' + signature)

			await connection.confirmTransaction({ blockhash, lastValidBlockHeight, signature })
			toast.success('Transaction successful!' + signature)
		} catch (error: unknown) {
			toast.error(`Transaction failed! ${(error as Error)?.message}` + signature)
		}
	}, [publicKey, supportedTransactionVersions, connection, sendTransaction])

	if (!publicKey) return null

	return (
		<button onClick={onClick} disabled={!publicKey || !supportedTransactionVersions?.has('legacy')}>
			Send Legacy Transaction (devnet)
		</button>
	)
}
