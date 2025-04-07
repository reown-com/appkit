import { ed25519 } from '@noble/curves/ed25519'
import { useWallet } from '@solana/wallet-adapter-react'
import bs58 from 'bs58'
import type { FC } from 'react'
import { useCallback } from 'react'
import toast from 'react-hot-toast'

export const SignMessage: FC = () => {
	const { publicKey, signMessage } = useWallet()

	const onClick = useCallback(async () => {
		try {
			if (!publicKey) throw new Error('Wallet not connected!')
			if (!signMessage) throw new Error('Wallet does not support message signing!')

			const message = new TextEncoder().encode(
				`${
					window.location.host
				} wants you to sign in with your Solana account:\n${publicKey.toBase58()}\n\nPlease sign in.`,
			)
			const signature = await signMessage(message)

			if (!ed25519.verify(signature, message, publicKey.toBytes())) throw new Error('Message signature invalid!')
			toast.success(`Message signature: ${bs58.encode(signature)}`)
		} catch (error: unknown) {
			toast.error(`Sign Message failed: ${(error as Error)?.message}`)
		}
	}, [publicKey, signMessage])

	if (!publicKey) return null

	return (
		<button onClick={onClick} disabled={!publicKey || !signMessage}>
			Sign Message
		</button>
	)
}
