import { IAbstractConnectorOptions } from "../../helpers";
export interface IOptions {
    scope?: string[];
}
export interface ISquarelinkConnectorOptions extends IAbstractConnectorOptions {
    id: string;
    config?: IOptions;
}
declare const ConnectToSquarelink: (Squarelink: any, opts: ISquarelinkConnectorOptions) => Promise<unknown>;
export default ConnectToSquarelink;
//# sourceMappingURL=squarelink.d.ts.map