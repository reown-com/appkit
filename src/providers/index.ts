import { IProviderInfo, IProviderMappingEntry } from "../helpers/types";
import connectors from "./connectors";
import { INJECTED_PROVIDER_ID } from "../helpers/constants";
import { FALLBACK_INJECTED, injected } from "./injected";

// @ts-ignore
import WalletConnectLogo from "./logos/walletconnect-circle.svg";
// @ts-ignore
import PortisLogo from "./logos/portis.svg";
// @ts-ignore
import SquarelinkLogo from "./logos/squarelink.svg";
// @ts-ignore
import FortmaticLogo from "./logos/fortmatic.svg";
// @ts-ignore
import ArkaneLogo from "./logos/arkane.svg";
// @ts-ignore
import TorusLogo from "./logos/torus.png";
// @ts-ignore
import AuthereumLogo from "./logos/authereum.svg";
// @ts-ignore
import BurnerWalletLogo from "./logos/burnerwallet.png";

export const FALLBACK = FALLBACK_INJECTED;

export const WALLETCONNECT_PROVIDER: IProviderInfo = {
  id: "walletconnect",
  name: "WalletConnect",
  logo: WalletConnectLogo,
  type: "qrcode",
  check: "isWalletConnect",
  styled: {
    noShadow: false
  },
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
  styled: {
    noShadow: true
  },
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
  styled: {
    noShadow: true
  },
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
  styled: {
    noShadow: true
  },
  package: {
    required: ["id"]
  }
};

export const TORUS_PROVIDER: IProviderInfo = {
  id: "torus",
  name: "Google",
  logo: TorusLogo,
  type: "web",
  check: "isTorus",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const ARKANE_PROVIDER: IProviderInfo = {
  id: "arkane",
  name: "Arkane",
  logo: ArkaneLogo,
  type: "web",
  check: "isArkane",
  styled: {
    noShadow: true
  },
  package: {
    required: ["clientId"]
  }
};

export const AUTHEREUM_PROVIDER: IProviderInfo = {
  id: "authereum",
  name: "Authereum",
  logo: AuthereumLogo,
  type: "web",
  check: "isAuthereum",
  styled: {
    noShadow: true
  },
  package: {
    required: []
  }
};

export const BURNERCONNECT_PROVIDER: IProviderInfo = {
  id: "burnerconnect",
  name: "Burner Connect",
  logo: BurnerWalletLogo,
  type: "web",
  check: "isBurnerProvider",
  styled: {
    noShadow: false
  },
  package: {
    required: []
  }
};

export const providers: IProviderInfo[] = [
  ...injected,
  WALLETCONNECT_PROVIDER,
  SQUARELINK_PROVIDER,
  PORTIS_PROVIDER,
  FORTMATIC_PROVIDER,
  ARKANE_PROVIDER,
  TORUS_PROVIDER,
  AUTHEREUM_PROVIDER,
  BURNERCONNECT_PROVIDER
];

export const providerMapping: IProviderMappingEntry[] = [
  {
    id: INJECTED_PROVIDER_ID,
    name: "",
    connector: connectors.injected,
    package: FALLBACK_INJECTED.package
  },
  {
    id: WALLETCONNECT_PROVIDER.id,
    name: WALLETCONNECT_PROVIDER.name,
    connector: connectors.walletconnect,
    package: WALLETCONNECT_PROVIDER.package
  },
  {
    id: PORTIS_PROVIDER.id,
    name: PORTIS_PROVIDER.name,
    connector: connectors.portis,
    package: PORTIS_PROVIDER.package
  },
  {
    id: FORTMATIC_PROVIDER.id,
    name: FORTMATIC_PROVIDER.name,
    connector: connectors.fortmatic,
    package: FORTMATIC_PROVIDER.package
  },
  {
    id: SQUARELINK_PROVIDER.id,
    name: SQUARELINK_PROVIDER.name,
    connector: connectors.squarelink,
    package: SQUARELINK_PROVIDER.package
  },
  {
    id: TORUS_PROVIDER.id,
    name: TORUS_PROVIDER.name,
    connector: connectors.torus,
    package: TORUS_PROVIDER.package
  },
  {
    id: ARKANE_PROVIDER.id,
    name: ARKANE_PROVIDER.name,
    connector: connectors.arkane,
    package: ARKANE_PROVIDER.package
  },
  {
    id: AUTHEREUM_PROVIDER.id,
    name: AUTHEREUM_PROVIDER.name,
    connector: connectors.authereum,
    package: AUTHEREUM_PROVIDER.package
  },
  {
    id: BURNERCONNECT_PROVIDER.id,
    name: BURNERCONNECT_PROVIDER.name,
    connector: connectors.burnerconnect,
    package: BURNERCONNECT_PROVIDER.package
  }
];
