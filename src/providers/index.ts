import { IProviderInfo } from "../helpers/types";
// @ts-ignore
import Web3DefaultLogo from "../assets/web3-default.svg";
// @ts-ignore
import WalletConnectLogo from "../assets/walletconnect-circle.svg";
// @ts-ignore
import MetaMaskLogo from "../assets/metamask.svg";
// @ts-ignore
import SafeLogo from "../assets/safe.svg";
// @ts-ignore
import NiftyWalletLogo from "../assets/niftyWallet.png";
// @ts-ignore
import PortisLogo from "../assets/portis.svg";
// @ts-ignore
import SquarelinkLogo from "../assets/squarelink.svg";
// @ts-ignore
import FortmaticLogo from "../assets/fortmatic.svg";
// @ts-ignore
import TrustLogo from "../assets/trust.svg";
// @ts-ignore
import DapperLogo from "../assets/dapper.png";
// @ts-ignore
import CoinbaseLogo from "../assets/coinbase.svg";
// @ts-ignore
import CipherLogo from "../assets/cipher.svg";
// @ts-ignore
import imTokenLogo from "../assets/imtoken.svg";
// @ts-ignore
import StatusLogo from "../assets/status.svg";
// @ts-ignore
import TokenaryLogo from "../assets/tokenary.png";
// @ts-ignore
import OperaLogo from "../assets/opera.svg";
// @ts-ignore
import TorusLogo from "../assets/torus.png";

export const providerPackages = {
  walletconnect: {
    name: "@walletconnect/web3-provider",
    option: "walletconnect",
    required: ["infuraId"]
  },
  portis: {
    name: "@portis/web3",
    option: "portis",
    required: ["id"]
  },
  fortmatic: {
    name: "fortmatic",
    option: "fortmatic",
    required: ["key"]
  },
  squarelink: {
    name: "squarelink",
    option: "squarelink",
    required: ["id"]
  },
  torus: {
    name: "@toruslabs/torus-embed",
    option: "torus",
    required: []
  }
};

export const fallbackProvider: IProviderInfo = {
  name: "Web3",
  logo: Web3DefaultLogo,
  type: "injected",
  check: "isWeb3",
  styled: {
    noShadow: false
  }
};

const providers: IProviderInfo[] = [
  fallbackProvider,
  {
    name: "WalletConnect",
    logo: WalletConnectLogo,
    type: "qrcode",
    check: "isWalletConnect",
    styled: {
      noShadow: false
    }
  },
  {
    name: "MetaMask",
    logo: MetaMaskLogo,
    type: "injected",
    check: "isMetaMask",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Safe",
    logo: SafeLogo,
    type: "injected",
    check: "isSafe",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Nifty",
    logo: NiftyWalletLogo,
    type: "injected",
    check: "isNiftyWallet",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Squarelink",
    logo: SquarelinkLogo,
    type: "web",
    check: "isSquarelink",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Portis",
    logo: PortisLogo,
    type: "web",
    check: "isPortis",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Fortmatic",
    logo: FortmaticLogo,
    type: "web",
    check: "isFortmatic",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Dapper",
    logo: DapperLogo,
    type: "injected",
    check: "isDapper",
    styled: {
      noShadow: true
    }
  },
  {
    name: "Opera",
    logo: OperaLogo,
    type: "injected",
    check: "isOpera",
    styled: {
      noShadow: false
    }
  },
  {
    name: "Trust",
    logo: TrustLogo,
    type: "injected",
    check: "isTrust",
    styled: {
      noShadow: false
    }
  },
  {
    name: "Coinbase",
    logo: CoinbaseLogo,
    type: "injected",
    check: "isToshi",
    styled: {
      noShadow: false
    }
  },
  {
    name: "Cipher",
    logo: CipherLogo,
    type: "injected",
    check: "isCipher",
    styled: {
      noShadow: false
    }
  },
  {
    name: "imToken",
    logo: imTokenLogo,
    type: "injected",
    check: "isImToken",
    styled: {
      noShadow: false
    }
  },
  {
    name: "Status",
    logo: StatusLogo,
    type: "injected",
    check: "isStatus",
    styled: {
      noShadow: false
    }
  },
  {
    name: "Tokenary",
    logo: TokenaryLogo,
    type: "injected",
    check: "isTokenary",
    styled: {
      noShadow: false
    }
  },
  {
    name: "Google",
    logo: TorusLogo,
    type: "web",
    check: "isTorus",
    styled: {
      noShadow: true
    }
  }
];

export default providers;
