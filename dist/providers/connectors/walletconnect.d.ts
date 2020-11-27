import { IAbstractConnectorOptions } from "../../helpers";
export interface IWalletConnectConnectorOptions extends IAbstractConnectorOptions {
    infuraId?: string;
    rpc?: {
        [chainId: number]: string;
    };
    bridge?: string;
    qrcode?: boolean;
    qrcodeModalOptions?: {
        mobileLinks?: string[];
    };
}
declare const ConnectToWalletConnect: (WalletConnectProvider: any, opts: IWalletConnectConnectorOptions) => Promise<unknown>;
export default ConnectToWalletConnect;
//# sourceMappingURL=walletconnect.d.ts.map