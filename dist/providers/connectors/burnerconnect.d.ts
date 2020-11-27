import { IAbstractConnectorOptions } from "../../helpers";
interface Wallet {
    origin: string;
    name: string;
}
export interface IBurnerConnectorOptions extends IAbstractConnectorOptions {
    hubUrl?: string;
    defaultNetwork?: string;
    defaultWallets?: Wallet[];
}
declare const ConnectToBurnerConnect: (BurnerConnectProvider: any, opts: IBurnerConnectorOptions) => Promise<any>;
export default ConnectToBurnerConnect;
//# sourceMappingURL=burnerconnect.d.ts.map