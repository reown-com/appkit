import { IAbstractConnectorOptions } from "../../helpers";
export interface IAuthereumConnectorOptions extends IAbstractConnectorOptions {
    networkName: string;
    apiKey: string;
    rpcUri: string;
    webUri: string;
    xsUri: string;
    blockedPopupRedirect: boolean;
    forceRedirect: boolean;
    disableNotifications: boolean;
    disableGoogleAnalytics: boolean;
}
declare const ConnectToAuthereum: (Authereum: any, opts?: Partial<IAuthereumConnectorOptions>) => Promise<unknown>;
export default ConnectToAuthereum;
//# sourceMappingURL=authereum.d.ts.map