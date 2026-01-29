import { useAppKitNetwork, useAppKitAccount } from '@reown/appkit/react'
import { useWriteContract, useEstimateGas } from 'wagmi'
import { useEffect } from 'react'
import { parseEther } from 'viem'
import { datahavenTestnet } from '@reown/appkit/networks'
const createBucketABI = [
	{
		inputs: [
			{ name: 'mspId', type: 'bytes32' },
			{ name: 'name', type: 'bytes' },
			{ name: '_private', type: 'bool' },
			{ name: 'valuePropId', type: 'bytes32' }
		],
		name: 'createBucket',
		outputs: [],
		stateMutability: 'nonpayable',
		type: 'function'
	}
]

const contractAddress = '0x0000000000000000000000000000000000000404'
const DATAHAVEN_TESTNET_CHAIN_ID = 55931

export const SmartContractActionButtonList = () => {
	const { isConnected } = useAppKitAccount()
	const { chainId } = useAppKitNetwork()
	const { writeContract, isSuccess, isPending, error } = useWriteContract()
	const result = useEstimateGas({
		chainId: datahavenTestnet.id,
		to: '0xE62a3eD41B21447b67a63880607CD2E746A0E35A',
		value: parseEther('0.01')
	})
	console.log('result', result.data)

	useEffect(() => {
		if (isSuccess) {
			console.log('createBucket contract write success')
		}
	}, [isSuccess])

	useEffect(() => {
		if (error) {
			console.error('createBucket error:', error)
		}
	}, [error])

	const handleCreateBucket = async () => {
		console.log('Calling createBucket on DataHaven Testnet')
		try {
			const result = await writeContract({
				address: contractAddress,
				abi: createBucketABI,
				functionName: 'createBucket',
				args: [
					'0x0000000000000000000000000000000000000000000000000000000000000001', // mspId
					'0x746573742d736f6369616c2d776974682d72656f776e2d636861696e32', // name ("test-social-with-reown-chain" in hex)
					false, // _private
					'0x628a23c7aa64902e13f63ffdd0725e07723745f84cabda048d901020d200da1e' // valuePropId
				]
			})
			console.log('result', result)
		} catch (error) {
			console.error('createBucket error:', error)
		}
	}




	return (
		isConnected &&
		chainId === DATAHAVEN_TESTNET_CHAIN_ID && (
			<div>
				<button onClick={handleCreateBucket} disabled={isPending}>
					{isPending ? 'Creating Bucket...' : 'Create Bucket (DataHaven)'}
				</button>
			</div>
		)
	)
}
