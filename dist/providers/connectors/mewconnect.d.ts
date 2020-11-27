import { IAbstractConnectorOptions } from "../../helpers";
export interface IMewConnectConnectorOptions extends IAbstractConnectorOptions {
    infuraId?: string;
    rpc?: {
        [chainId: number]: string;
    };
}
declare const ConnectToMewConnect: (MewConnectProvider: any, opts: IMewConnectConnectorOptions) => Promise<unknown>;
export default ConnectToMewConnect;
//# sourceMappingURL=mewconnect.d.ts.map