import { arbitrum, mainnet, polygon } from "@wagmi/chains";
import { configureChains, createClient } from "@wagmi/core";
import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider
} from "@web3modal/ethereum";
import { Web3Modal } from "@web3modal/html";
import React from "react";

// eslint-disable-next-line func-style
export const ReactModalComponent: React.FC = () => {

  const chains = [arbitrum, mainnet, polygon];

  // Wagmi Core Client
  const { provider } = configureChains(chains, [
    walletConnectProvider({ projectId: "5eec3e3ff91ddea25b76615da1e8b668" }),
  ]);
  const wagmiClient = createClient({
    autoConnect: true,
    connectors: modalConnectors({
      projectId: "5eec3e3ff91ddea25b76615da1e8b668",
      version: "2", // or "2"
      appName: "web3Modal",
      chains,
    }),
    provider,
  });

  // Web3Modal and Ethereum Client
  const ethereumClient = new EthereumClient(wagmiClient, chains);
  const web3modal = new Web3Modal(
    { projectId: "5eec3e3ff91ddea25b76615da1e8b668" },
    ethereumClient
  );

  const open = () => {
    web3modal.openModal(undefined)
  }

  return (
    <div>
      <div>
        <button onClick={open}>connect</button>
      </div>
    </div>
  )

}
