import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import bs58 from 'bs58'
import type { FC } from 'react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const SignTransaction: FC = () => {
	const { connection } = useConnection()
	const { publicKey, signTransaction } = useWallet()

	const onClick = useCallback(async () => {
		try {
			if (!publicKey) throw new Error('Wallet not connected!')
			if (!signTransaction) throw new Error('Wallet does not support transaction signing!')

			const { blockhash } = await connection.getLatestBlockhash()

			let transaction = new Transaction({
				feePayer: publicKey,
				recentBlockhash: blockhash,
			}).add(
				new TransactionInstruction({
					data: Buffer.from('Hello, from the Solana Wallet Adapter example app!'),
					keys: [],
					programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
				}),
			)

			transaction = await signTransaction(transaction)
			if (!transaction.signature) throw new Error('Transaction not signed!')
			const signature = bs58.encode(transaction.signature)
			toast(`Transaction signed: ${signature}`)
			if (!transaction.verifySignatures()) throw new Error(`Transaction signature invalid! ${signature}`)
			toast.success(`Transaction signature valid! ${signature}`)
		} catch (error: unknown) {
			toast.error(`Transaction signing failed! ${(error as Error)?.message}`)
		}
	}, [publicKey, signTransaction, connection])

	if (!publicKey) return

	return (
		<button onClick={onClick} disabled={!publicKey || !signTransaction}>
			Sign Transaction
		</button>
	)
}
