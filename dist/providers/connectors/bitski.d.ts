import { IAbstractConnectorOptions } from "../../helpers";
interface IBitskiOptions extends IAbstractConnectorOptions {
    clientId: string;
    callbackUrl: string;
    extraBitskiOptions?: any;
    extraProviderOptions?: any;
}
declare const ConnectToBitski: (Bitski: any, opts: IBitskiOptions) => Promise<any>;
export default ConnectToBitski;
//# sourceMappingURL=bitski.d.ts.map