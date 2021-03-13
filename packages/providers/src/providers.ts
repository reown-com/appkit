import { IProviderInfo, IProviders } from "@web3modal/types";

export const WALLETCONNECT: IProviderInfo = {
  id: "walletconnect",
  name: "WalletConnect",
  type: "qrcode",
  check: "isWalletConnect",
  package: {
    required: [["infuraId", "rpc"]]
  }
};

export const PORTIS: IProviderInfo = {
  id: "portis",
  name: "Portis",
  type: "web",
  check: "isPortis",
  package: {
    required: ["id"]
  }
};

export const FORTMATIC: IProviderInfo = {
  id: "fortmatic",
  name: "Fortmatic",
  type: "web",
  check: "isFortmatic",
  package: {
    required: ["key"]
  }
};

export const TORUS: IProviderInfo = {
  id: "torus",
  name: "Torus",
  type: "web",
  check: "isTorus"
};

export const ARKANE: IProviderInfo = {
  id: "arkane",
  name: "Arkane",
  type: "web",
  check: "isArkane",
  package: {
    required: ["clientId"]
  }
};

export const AUTHEREUM: IProviderInfo = {
  id: "authereum",
  name: "Authereum",
  type: "web",
  check: "isAuthereum"
};

export const BURNERCONNECT: IProviderInfo = {
  id: "burnerconnect",
  name: "Burner Connect",
  type: "web",
  check: "isBurnerProvider"
};

export const MEWCONNECT: IProviderInfo = {
  id: "mewconnect",
  name: "MEW wallet",
  type: "qrcode",
  check: "isMEWconnect",
  package: {
    required: [["infuraId", "rpc"]]
  }
};

export const DCENT: IProviderInfo = {
  id: "dcentwallet",
  name: "D'CENT",
  type: "hardware",
  check: "isDcentWallet",
  package: {
    required: ["rpcUrl"]
  }
};

export const BITSKI: IProviderInfo = {
  id: "bitski",
  name: "Bitski",
  type: "web",
  check: "isBitski",
  package: {
    required: ["clientId", "callbackUrl"]
  }
};

export const FRAME: IProviderInfo = {
  id: "frame",
  name: "Frame",
  type: "web",
  check: "isFrameNative"
};

export const providers: IProviders = {
  WALLETCONNECT,
  PORTIS,
  FORTMATIC,
  TORUS,
  ARKANE,
  AUTHEREUM,
  BURNERCONNECT,
  MEWCONNECT,
  DCENT,
  BITSKI,
  FRAME
};
