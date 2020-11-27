import { IAbstractConnectorOptions } from "../../helpers";
export interface IUniloginConnectorOptions extends IAbstractConnectorOptions {
}
declare const ConnectToUniLogin: (UniLogin: any, options: IUniloginConnectorOptions) => Promise<any>;
export default ConnectToUniLogin;
//# sourceMappingURL=unilogin.d.ts.map