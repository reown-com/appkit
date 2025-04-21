import { useEffect } from 'react'
import {
    useAppKitState,
    useAppKitTheme,
    useAppKitEvents,
    useAppKitAccount,
    useWalletInfo
     } from '@reown/appkit/react'
import { useWaitForTransactionReceipt } from 'wagmi'

interface InfoListProps {
    hash: `0x${string}` | undefined;
    signedMsg: string;
    balance: string;
}

export const InfoList = ({ hash, signedMsg, balance }: InfoListProps) => {
    const kitTheme = useAppKitTheme(); // AppKit hook to get the theme information and theme actions 
    const state = useAppKitState(); // AppKit hook to get the state
    const {address, caipAddress, isConnected, status, embeddedWalletInfo } = useAppKitAccount(); // AppKit hook to get the account information
    const events = useAppKitEvents() // AppKit hook to get the events
    const { walletInfo } = useWalletInfo() // AppKit hook to get the wallet info

    const { data: receipt } = useWaitForTransactionReceipt({ hash, confirmations: 2,  // Wait for at least 2 confirmation
        timeout: 300000,    // Timeout in milliseconds (5 minutes)
        pollingInterval: 1000,  })

    useEffect(() => {
        console.log("Events: ", events);
    }, [events]);

    useEffect(() => {
        console.log("Embedded Wallet Info: ", embeddedWalletInfo);
    }, [embeddedWalletInfo]);

  return (
    <>
        {balance && (
        <section>
            <h2>Balance: {balance}</h2>
        </section>
        )}
        {hash && (
        <section>
            <h2>Sign Tx</h2>
            <pre>
                Hash: {hash}<br />
                Status: {receipt?.status.toString()}<br />
            </pre>
        </section>
        )}
        {signedMsg && (
        <section>
            <h2>Sign msg</h2>
            <pre>
                signedMsg: {signedMsg}<br />
            </pre>
        </section>
        )}
        <section>
            <h2>useAppKit</h2>
            <pre>
                Address: {address}<br />
                caip Address: {caipAddress}<br />
                Connected: {isConnected.toString()}<br />
                Status: {status}<br />
                Account Type: {embeddedWalletInfo?.accountType}<br />
                {embeddedWalletInfo?.user?.email && (`Email: ${embeddedWalletInfo?.user?.email}\n`)}
                {embeddedWalletInfo?.user?.username && (`Username: ${embeddedWalletInfo?.user?.username}\n`)}
                {embeddedWalletInfo?.authProvider && (`Provider: ${embeddedWalletInfo?.authProvider}\n`)}
            </pre>
        </section>

        <section>
            <h2>Theme</h2>
            <pre>
                Theme: {kitTheme.themeMode}<br />
            </pre>
        </section>

        <section>
            <h2>State</h2>
            <pre>
                activeChain: {state.activeChain}<br />
                loading: {state.loading.toString()}<br />
                open: {state.open.toString()}<br />
                selectedNetworkId: {state.selectedNetworkId?.toString()}<br />
            </pre>
        </section>

        <section>
            <h2>WalletInfo</h2>
            <pre>
                Name: {JSON.stringify(walletInfo)}<br />
            </pre>
        </section>
    </>
  )
}
