export interface ICoreOptions extends IProviderControllerOptions {
  lightboxOpacity: number;
  theme: string | ThemeColors;
}

export interface IProviderControllerOptions {
  disableInjectedProvider: boolean;
  cacheProvider: boolean;
  providerOptions: IProviderOptions;
  network: string;
}

export interface IAbstractConnectorOptions {
  network: string;
}

export interface IInjectedProvidersMap {
  injectedAvailable: boolean;
  [isProviderName: string]: boolean;
}

export interface IProviderDisplay {
  name: string;
  logo: string;
  description?: string;
}

export interface IProviderInfo extends IProviderDisplay {
  id: string;
  type: string;
  check: string;
  package?: IProviderPackageOptions;
}

export type RequiredOption = string | string[];

export interface IProviderPackageOptions {
  required?: RequiredOption[];
}

export interface IProviderOptions {
  [id: string]: {
    package: any;
    options?: any;
    connector?: Connector;
    display?: Partial<IProviderDisplay>;
  };
}

export interface IProviderDisplayWithConnector extends IProviderDisplay {
  id: string;
  connector: any;
  package?: IProviderPackageOptions;
}

export interface IProviderUserOptions {
  id: string;
  name: string;
  logo: string;
  description: string;
  onClick: () => Promise<void>;
}

export type SimpleFunction = (input?: any) => void;

export interface IEventCallback {
  event: string;
  callback: (result: any) => void;
}

export type ChainData = {
  chainId: number;
  chain: string;
  network: string;
  networkId: number;
};

export type ChainDataList = {
  [chainId: number]: ChainData;
};

export type ThemeColors = {
  background: string;
  main: string;
  secondary: string;
  border: string;
  hover: string;
};

export interface IThemeConfig {
  name: string;
  colors: ThemeColors;
}

export type ThemesList = {
  [name: string]: IThemeConfig;
};

export type Connector = (provider?: any, opts?: any) => Promise<any>;

export interface IConnectorsMap {
  [id: string]: Connector;
}
