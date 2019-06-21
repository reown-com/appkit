export interface IProviderInfo {
  name: string;
  type: string;
  logo: string;
  check: string;
  styled: {
    [prop: string]: any;
  };
}

export interface IProviderOptions {
  [providerName: string]: any;
}

export type ConnectCallback = (provider: any) => void;
export type ErrorCallback = (error: any) => void;
export type NoopFunction = (input?: any) => void;
