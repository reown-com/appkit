import { IAbstractConnectorOptions } from "../../helpers";
export interface IDcentConnectorOptions extends IAbstractConnectorOptions {
    rpcUrl: string;
    chainId: number;
}
declare const ConnectToDcentWallet: (DcentProvider: any, opts: IDcentConnectorOptions) => Promise<any>;
export default ConnectToDcentWallet;
//# sourceMappingURL=dcentwallet.d.ts.map