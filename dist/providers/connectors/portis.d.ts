import { IAbstractConnectorOptions } from "../../helpers";
export interface INetwork {
    nodeUrl: string;
    chainId?: string;
    gasRelayHubAddress?: string;
}
export declare type Scope = "email";
export interface IOptions {
    scope?: Scope[];
    gasRelay?: boolean;
    registerPageByDefault?: boolean;
    pocketDevId?: string;
}
export interface IPortisConnectorOptions extends IAbstractConnectorOptions {
    id: string;
    config?: IOptions;
}
declare const ConnectToPortis: (Portis: any, opts: IPortisConnectorOptions) => Promise<unknown>;
export default ConnectToPortis;
//# sourceMappingURL=portis.d.ts.map