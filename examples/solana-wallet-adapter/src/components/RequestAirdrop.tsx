import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import type { TransactionSignature } from '@solana/web3.js'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import type { FC } from 'react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const RequestAirdrop: FC = () => {
	const { connection } = useConnection()
	const { publicKey } = useWallet()

	const onClick = useCallback(async () => {
		let signature: TransactionSignature | undefined = undefined
		try {
			if (!publicKey) throw new Error('Wallet not connected!')

			signature = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL)
			toast('Airdrop requested:' + signature)

			await connection.confirmTransaction(signature, 'processed')
			toast.success('Airdrop successful!' + signature)
		} catch (error: unknown) {
			toast.error(`Airdrop failed! ${(error as Error)?.message}` + signature)
		}
	}, [publicKey, connection])

	if (!publicKey) return null

	return (
		<button onClick={onClick} disabled={!publicKey}>
			Request Airdrop
		</button>
	)
}
