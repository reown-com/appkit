import { ConstantsUtil } from '@web3modal/scaffold-utils'
import { Web3ModalScaffold } from '@web3modal/scaffold'

import type { LibraryOptions, Token, ScaffoldOptions } from '@web3modal/scaffold'
import type { Web3ModalSIWEClient } from '@web3modal/siwe'

export interface Web3ModalClientOptions extends Omit<LibraryOptions, 'defaultChain' | 'tokens'> {
    solanaConfig?: never
    siweConfig?: Web3ModalSIWEClient
    chains?: never[]
    defaultChain?: never
    chainImages?: Record<number, string>
    connectorImages?: Record<string, string>
    tokens?: Record<number, Token>
}

export type Web3ModalOptions = Omit<Web3ModalClientOptions, '_sdkVersion'>

// -- Client --------------------------------------------------------------------
export class Web3Modal extends Web3ModalScaffold {

    public constructor(options: Web3ModalClientOptions) {
        const { solanaConfig, _sdkVersion, ...w3mOptions } = options

        if (!solanaConfig) {
            throw new Error('web3modal:constructor - solanaConfig is undefined')
        }

        if (!w3mOptions.projectId) {
            throw new Error('web3modal:constructor - projectId is undefined')
        }

        super({
            defaultChain: {},
            tokens: [],
            _sdkVersion: _sdkVersion ?? `html-wagmi-${ConstantsUtil.VERSION}`,
            ...w3mOptions
        } as ScaffoldOptions)
    }
}