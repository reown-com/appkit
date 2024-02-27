import { PresetsUtil } from './PresetsUtil.js'

import type { CaipNetwork } from "@web3modal/core"
import type { Chain, Provider } from './SolanaTypesUtil.js'

export const SolHelpersUtil = {
    getChain(chains: Chain[], chainId: string | null) {
        const chain = chains.find(lChain => lChain.chainId === chainId)
        if (chain) {
            return chain
        }

        return chains[0]
    },
    getChainFromCaip(chains: Chain[], chainCaipId: string | undefined | null = ":") {
        const chainName: string = chainCaipId?.split(':')[0] ?? ""
        const chainId: string = (chainCaipId?.split(':')[1] ?? "").replace(/\s/ug, '')

        const selectedChain = chains.find((chain) => chain.chainId === chainId && chain.name === chainName)

        if (selectedChain) {
            return selectedChain
        }

        return chains[0]
    },
    getCaipDefaultChain(chain?: Chain) {
        if (!chain) {
            return undefined
        }

        return {
            id: `${chain.name}:${chain.chainId}`,
            name: chain.name,
            imageId: PresetsUtil.EIP155NetworkImageIds[chain.chainId]
        } as CaipNetwork
    },
    hexStringToNumber(value: string) {
        const string = value.startsWith('0x') ? value.slice(2) : value
        const number = parseInt(string, 16)

        return number
    },
    numberToHexString(value: number | string) {
        return `0x${value.toString(16)}`
    },
    async getAddress(provider: Provider) {
        const [address] = await provider.request<string[]>({ method: 'getAccountInfo' })

        return address
    },
    async addSolanaChain(provider: Provider, chain: Chain) {
        await provider.request({
            method: 'wallet_addSolanaChain',
            params: [
                {
                    chainId: chain.chainId,
                    rpcUrls: [chain.rpcUrl],
                    chainName: chain.name,
                    nativeCurrency: {
                        name: chain.currency,
                        decimals: 18,
                        symbol: chain.currency
                    },
                    blockExplorerUrls: [chain.explorerUrl],
                    iconUrls: [PresetsUtil.EIP155NetworkImageIds[chain.chainId]]
                }
            ]
        })
    }
}