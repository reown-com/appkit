// @ts-ignore
import WalletConnectLogo from '../logos/walletconnect-circle.svg';
// @ts-ignore
import PortisLogo from '../logos/portis.svg';
// @ts-ignore
import SquarelinkLogo from '../logos/squarelink.svg';
// @ts-ignore
import FortmaticLogo from '../logos/fortmatic.svg';
// @ts-ignore
import ArkaneLogo from '../logos/arkane.svg';
// @ts-ignore
import TorusLogo from '../logos/torus.svg';
// @ts-ignore
import AuthereumLogo from '../logos/authereum.svg';
// @ts-ignore
import BurnerWalletLogo from '../logos/burnerwallet.png';
// @ts-ignore
import UniLoginLogo from '../logos/unilogin.svg';
// @ts-ignore
import MEWwallet from '../logos/mewwallet.png';
// @ts-ignore
import DcentWalletLogo from '../logos/dcentwallet.png';
// @ts-ignore
import BitskiLogo from '../logos/bitski.svg';
// @ts-ignore
import CoinbaseLogo from '../logos/coinbase.svg';

import { IProviderInfo } from '../../helpers';

export * from '../injected';

export const WALLETCONNECT: IProviderInfo = {
  id: 'walletconnect',
  name: 'WalletConnect',
  logo: WalletConnectLogo,
  type: 'qrcode',
  check: 'isWalletConnect',
  package: {
    required: [['infuraId', 'rpc']],
  },
};

export const WALLETLINK: IProviderInfo = {
  id: 'walletlink',
  name: 'Coinbase',
  logo: CoinbaseLogo,
  type: 'qrcode',
  check: 'isWalletLink',
  package: {
    required: ['infuraUrl']
  }
}

export const PORTIS: IProviderInfo = {
  id: 'portis',
  name: 'Portis',
  logo: PortisLogo,
  type: 'web',
  check: 'isPortis',
  package: {
    required: ['id'],
  },
};

export const FORTMATIC: IProviderInfo = {
  id: 'fortmatic',
  name: 'Fortmatic',
  logo: FortmaticLogo,
  type: 'web',
  check: 'isFortmatic',
  package: {
    required: ['key'],
  },
};

export const SQUARELINK: IProviderInfo = {
  id: 'squarelink',
  name: 'Squarelink',
  logo: SquarelinkLogo,
  type: 'web',
  check: 'isSquarelink',
  package: {
    required: ['id'],
  },
};

export const TORUS: IProviderInfo = {
  id: 'torus',
  name: 'Torus',
  logo: TorusLogo,
  type: 'web',
  check: 'isTorus',
};

export const ARKANE: IProviderInfo = {
  id: 'arkane',
  name: 'Arkane',
  logo: ArkaneLogo,
  type: 'web',
  check: 'isArkane',
  package: {
    required: ['clientId'],
  },
};

export const AUTHEREUM: IProviderInfo = {
  id: 'authereum',
  name: 'Authereum',
  logo: AuthereumLogo,
  type: 'web',
  check: 'isAuthereum',
};

export const BURNERCONNECT: IProviderInfo = {
  id: 'burnerconnect',
  name: 'Burner Connect',
  logo: BurnerWalletLogo,
  type: 'web',
  check: 'isBurnerProvider',
};

export const UNILOGIN: IProviderInfo = {
  id: 'unilogin',
  name: 'UniLogin',
  logo: UniLoginLogo,
  check: 'isUniLogin',
  type: 'web',
};

export const MEWCONNECT: IProviderInfo = {
  id: 'mewconnect',
  name: 'MEW wallet',
  logo: MEWwallet,
  type: 'qrcode',
  check: 'isMEWconnect',
  package: {
    required: [['infuraId', 'rpc']],
  },
};

export const DCENT: IProviderInfo = {
  id: 'dcentwallet',
  name: "D'CENT",
  logo: DcentWalletLogo,
  type: 'hardware',
  check: 'isDcentWallet',
  package: {
    required: ['rpcUrl'],
  },
};

export const BITSKI: IProviderInfo = {
  id: 'bitski',
  name: 'Bitski',
  logo: BitskiLogo,
  type: 'web',
  check: 'isBitski',
  package: {
    required: ['clientId', 'callbackUrl'],
  },
};
