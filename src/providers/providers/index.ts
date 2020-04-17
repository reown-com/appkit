// @ts-ignore
import WalletConnectLogo from "../logos/walletconnect-circle.svg";
// @ts-ignore
import PortisLogo from "../logos/portis.svg";
// @ts-ignore
import SquarelinkLogo from "../logos/squarelink.svg";
// @ts-ignore
import FortmaticLogo from "../logos/fortmatic.svg";
// @ts-ignore
import ArkaneLogo from "../logos/arkane.svg";
// @ts-ignore
import TorusLogo from "../logos/torus.svg";
// @ts-ignore
import AuthereumLogo from "../logos/authereum.svg";
// @ts-ignore
import BurnerWalletLogo from "../logos/burnerwallet.png";

import { IProviderInfo } from "../../helpers";

export { FALLBACK } from "../injected";

export const WALLETCONNECT_PROVIDER: IProviderInfo = {
  id: "walletconnect",
  name: "WalletConnect",
  logo: WalletConnectLogo,
  type: "qrcode",
  check: "isWalletConnect",
  package: {
    required: ["infuraId"]
  }
};

export const PORTIS_PROVIDER: IProviderInfo = {
  id: "portis",
  name: "Portis",
  logo: PortisLogo,
  type: "web",
  check: "isPortis",
  package: {
    required: ["id"]
  }
};

export const FORTMATIC_PROVIDER: IProviderInfo = {
  id: "fortmatic",
  name: "Fortmatic",
  logo: FortmaticLogo,
  type: "web",
  check: "isFortmatic",
  package: {
    required: ["key"]
  }
};

export const SQUARELINK_PROVIDER: IProviderInfo = {
  id: "squarelink",
  name: "Squarelink",
  logo: SquarelinkLogo,
  type: "web",
  check: "isSquarelink",
  package: {
    required: ["id"]
  }
};

export const TORUS_PROVIDER: IProviderInfo = {
  id: "torus",
  name: "Torus",
  logo: TorusLogo,
  type: "web",
  check: "isTorus"
};

export const ARKANE_PROVIDER: IProviderInfo = {
  id: "arkane",
  name: "Arkane",
  logo: ArkaneLogo,
  type: "web",
  check: "isArkane",
  package: {
    required: ["clientId"]
  }
};

export const AUTHEREUM_PROVIDER: IProviderInfo = {
  id: "authereum",
  name: "Authereum",
  logo: AuthereumLogo,
  type: "web",
  check: "isAuthereum"
};

export const BURNERCONNECT_PROVIDER: IProviderInfo = {
  id: "burnerconnect",
  name: "Burner Connect",
  logo: BurnerWalletLogo,
  type: "web",
  check: "isBurnerProvider"
};
