import { IAbstractConnectorOptions } from "../../helpers";
export interface IFortmaticConnectorOptions extends IAbstractConnectorOptions {
    key: string;
}
declare const ConnectToFortmatic: (Fortmatic: any, opts: IFortmaticConnectorOptions) => Promise<any>;
export default ConnectToFortmatic;
//# sourceMappingURL=fortmatic.d.ts.map