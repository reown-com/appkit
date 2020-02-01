export interface ICoreOptions extends IProviderControllerOptions {
  lightboxOpacity: number;
}

export interface IProviderControllerOptions {
  cacheProvider: boolean;
  providerOptions: IProviderOptions;
  network: string;
}

export interface IInjectedProvidersMap {
  injectedAvailable: boolean;
  [isProviderName: string]: boolean;
}

export interface IProviderInfo {
  id: string;
  name: string;
  type: string;
  logo: string;
  check: string;
  package: IProviderPackageOptions;
  styled: IProviderStyledOptions;
}

export interface IProviderPackageOptions {
  required: string[];
}

export interface IProviderStyledOptions {
  [prop: string]: any;
}

export interface IProviderOptions {
  [id: string]: {
    package: any;
    options: any;
  };
}

export interface IProviderMappingEntry {
  id: string;
  name: string;
  connector: any;
  package: IProviderPackageOptions;
}

export interface IProviderCallback {
  name: string | null;
  onClick: () => Promise<void>;
}

export type SimpleFunction = (input?: any) => void;

export interface IEventCallback {
  event: string;
  callback: (result: any) => void;
}
