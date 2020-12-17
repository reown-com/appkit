import { IProviderInfo } from '../../helpers';

// @ts-ignore
import Web3DefaultLogo from '../logos/web3-default.svg';
// @ts-ignore
import MetaMaskLogo from '../logos/metamask.svg';
// @ts-ignore
import SafeLogo from '../logos/safe.svg';
// @ts-ignore
import NiftyWalletLogo from '../logos/niftyWallet.png';
// @ts-ignore
import TrustLogo from '../logos/trust.svg';
// @ts-ignore
import DapperLogo from '../logos/dapper.png';
// @ts-ignore
import CoinbaseLogo from '../logos/coinbase.svg';
// @ts-ignore
import CipherLogo from '../logos/cipher.svg';
// @ts-ignore
import imTokenLogo from '../logos/imtoken.svg';
// @ts-ignore
import StatusLogo from '../logos/status.svg';
// @ts-ignore
import TokenaryLogo from '../logos/tokenary.png';
// @ts-ignore
import OperaLogo from '../logos/opera.svg';

export const FALLBACK: IProviderInfo = {
  id: 'injected',
  name: 'Web3',
  logo: Web3DefaultLogo,
  type: 'injected',
  check: 'isWeb3',
};

export const METAMASK: IProviderInfo = {
  id: 'injected',
  name: 'MetaMask',
  logo: MetaMaskLogo,
  type: 'injected',
  check: 'isMetaMask',
};

export const SAFE: IProviderInfo = {
  id: 'injected',
  name: 'Safe',
  logo: SafeLogo,
  type: 'injected',
  check: 'isSafe',
};

export const NIFTY: IProviderInfo = {
  id: 'injected',
  name: 'Nifty',
  logo: NiftyWalletLogo,
  type: 'injected',
  check: 'isNiftyWallet',
};

export const DAPPER: IProviderInfo = {
  id: 'injected',
  name: 'Dapper',
  logo: DapperLogo,
  type: 'injected',
  check: 'isDapper',
};

export const OPERA: IProviderInfo = {
  id: 'injected',
  name: 'Opera',
  logo: OperaLogo,
  type: 'injected',
  check: 'isOpera',
};

export const TRUST: IProviderInfo = {
  id: 'injected',
  name: 'Trust',
  logo: TrustLogo,
  type: 'injected',
  check: 'isTrust',
};

export const COINBASE: IProviderInfo = {
  id: 'injected',
  name: 'Coinbase',
  logo: CoinbaseLogo,
  type: 'injected',
  check: 'isToshi',
};

export const CIPHER: IProviderInfo = {
  id: 'injected',
  name: 'Cipher',
  logo: CipherLogo,
  type: 'injected',
  check: 'isCipher',
};

export const IMTOKEN: IProviderInfo = {
  id: 'injected',
  name: 'imToken',
  logo: imTokenLogo,
  type: 'injected',
  check: 'isImToken',
};

export const STATUS: IProviderInfo = {
  id: 'injected',
  name: 'Status',
  logo: StatusLogo,
  type: 'injected',
  check: 'isStatus',
};

export const TOKENARY: IProviderInfo = {
  id: 'injected',
  name: 'Tokenary',
  logo: TokenaryLogo,
  type: 'injected',
  check: 'isTokenary',
};
