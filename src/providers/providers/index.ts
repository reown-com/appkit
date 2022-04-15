// @ts-ignore
import WalletConnectLogo from "../logos/walletconnect-circle.svg";
// @ts-ignore
import PortisLogo from "../logos/portis.svg";
// @ts-ignore
import FortmaticLogo from "../logos/fortmatic.svg";
// @ts-ignore
import VenlyLogo from "../logos/venly.svg";
// @ts-ignore
import TorusLogo from "../logos/torus.svg";
// @ts-ignore
import AuthereumLogo from "../logos/authereum.svg";
// @ts-ignore
import BurnerWalletLogo from "../logos/burnerwallet.png";
// @ts-ignore
import MEWwallet from "../logos/mewwallet.png";
// @ts-ignore
import DcentWalletLogo from "../logos/dcentwallet.png";
// @ts-ignore
import BitskiLogo from "../logos/bitski.svg";
// @ts-ignore
import FrameLogo from "../logos/frame.svg";
// @ts-ignore
import BinanceChainWalletLogo from "../logos/binancechainwallet.svg";
// @ts-ignore
import CoinbaseWalletLogo from "../logos/coinbasewallet.svg";
// @ts-ignore
import WalletLinkLogo from "../logos/walletlink.svg";
// @ts-ignore
import SequenceLogo from "../logos/sequence.svg";

import { IProviderInfo } from "../../helpers";

export * from "../injected";

export const WALLETCONNECT: IProviderInfo = {
  id: "walletconnect",
  name: "WalletConnect",
  logo: WalletConnectLogo,
  type: "qrcode",
  check: "isWalletConnect",
  package: {
    required: [["infuraId", "rpc"]]
  }
};

export const PORTIS: IProviderInfo = {
  id: "portis",
  name: "Portis",
  logo: PortisLogo,
  type: "web",
  check: "isPortis",
  package: {
    required: ["id"]
  }
};

export const FORTMATIC: IProviderInfo = {
  id: "fortmatic",
  name: "Fortmatic",
  logo: FortmaticLogo,
  type: "web",
  check: "isFortmatic",
  package: {
    required: ["key"]
  }
};

export const TORUS: IProviderInfo = {
  id: "torus",
  name: "Torus",
  logo: TorusLogo,
  type: "web",
  check: "isTorus"
};

export const VENLY: IProviderInfo = {
  id: "venly",
  name: "Venly",
  logo: VenlyLogo,
  type: "web",
  check: "isVenly",
  package: {
    required: ["clientId"]
  }
};

export const AUTHEREUM: IProviderInfo = {
  id: "authereum",
  name: "Authereum",
  logo: AuthereumLogo,
  type: "web",
  check: "isAuthereum"
};

export const BURNERCONNECT: IProviderInfo = {
  id: "burnerconnect",
  name: "Burner Connect",
  logo: BurnerWalletLogo,
  type: "web",
  check: "isBurnerProvider"
};

export const MEWCONNECT: IProviderInfo = {
  id: "mewconnect",
  name: "MEW wallet",
  logo: MEWwallet,
  type: "qrcode",
  check: "isMEWconnect",
  package: {
    required: [["infuraId", "rpc"]]
  }
};

export const DCENT: IProviderInfo = {
  id: "dcentwallet",
  name: "D'CENT",
  logo: DcentWalletLogo,
  type: "hardware",
  check: "isDcentWallet",
  package: {
    required: ["rpcUrl"]
  }
};

export const BITSKI: IProviderInfo = {
  id: "bitski",
  name: "Bitski",
  logo: BitskiLogo,
  type: "web",
  check: "isBitski",
  package: {
    required: ["clientId", "callbackUrl"]
  }
};

export const FRAME: IProviderInfo = {
  id: "frame",
  name: "Frame",
  logo: FrameLogo,
  type: "web",
  check: "isFrameNative"
};

export const BINANCECHAINWALLET: IProviderInfo = {
  id: "binancechainwallet",
  name: "Binance Chain",
  logo: BinanceChainWalletLogo,
  type: "injected",
  check: "isBinanceChainWallet"
};

/**
 * @deprecated Use CoinbaseWalletSdk
 */
export const WALLETLINK: IProviderInfo = {
  id: "walletlink",
  name: "Coinbase Wallet",
  logo: CoinbaseWalletLogo,
  type: "qrcode",
  check: "isWalletLink",
  package: {
    required: [["appName", "infuraId", "rpc"]]
  }
};

export const COINBASEWALLET: IProviderInfo = {
  id: "coinbasewallet",
  name: "Coinbase",
  logo: CoinbaseWalletLogo,
  type: "injected",
  check: "isWalletLink",
  package: {
    required: [["appName", "infuraId", "rpc"]]
  }
};

export const SEQUENCE: IProviderInfo = {
  id: "sequence",
  name: "Sequence",
  logo: SequenceLogo,
  type: "web",
  check: "isSequenceWeb"
};
