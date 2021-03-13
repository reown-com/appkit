import { IProviderInfo, IProviders } from "@web3modal/types";

export const FALLBACK: IProviderInfo = {
  id: "injected",
  name: "Web3",
  type: "injected",
  check: "isWeb3"
};

export const METAMASK: IProviderInfo = {
  id: "injected",
  name: "MetaMask",
  type: "injected",
  check: "isMetaMask"
};

export const SAFE: IProviderInfo = {
  id: "injected",
  name: "Safe",
  type: "injected",
  check: "isSafe"
};

export const NIFTY: IProviderInfo = {
  id: "injected",
  name: "Nifty",
  type: "injected",
  check: "isNiftyWallet"
};

export const DAPPER: IProviderInfo = {
  id: "injected",
  name: "Dapper",
  type: "injected",
  check: "isDapper"
};

export const OPERA: IProviderInfo = {
  id: "injected",
  name: "Opera",
  type: "injected",
  check: "isOpera"
};

export const TRUST: IProviderInfo = {
  id: "injected",
  name: "Trust",
  type: "injected",
  check: "isTrust"
};

export const COINBASE: IProviderInfo = {
  id: "injected",
  name: "Coinbase",
  type: "injected",
  check: "isToshi"
};

export const CIPHER: IProviderInfo = {
  id: "injected",
  name: "Cipher",
  type: "injected",
  check: "isCipher"
};

export const IMTOKEN: IProviderInfo = {
  id: "injected",
  name: "imToken",
  type: "injected",
  check: "isImToken"
};

export const STATUS: IProviderInfo = {
  id: "injected",
  name: "Status",
  type: "injected",
  check: "isStatus"
};

export const TOKENARY: IProviderInfo = {
  id: "injected",
  name: "Tokenary",
  type: "injected",
  check: "isTokenary"
};

export const FRAMEINJECTED: IProviderInfo = {
  id: "injected",
  name: "Frame",
  type: "injected",
  check: "isFrame"
};

export const LIQUALITY: IProviderInfo = {
  id: "injected",
  name: "Liquality",
  type: "injected",
  check: "isLiquality"
};

export const injected: IProviders = {
  FALLBACK,
  METAMASK,
  SAFE,
  NIFTY,
  DAPPER,
  OPERA,
  TRUST,
  COINBASE,
  CIPHER,
  IMTOKEN,
  STATUS,
  TOKENARY,
  FRAMEINJECTED,
  LIQUALITY
};
