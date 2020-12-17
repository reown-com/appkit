import { IAbstractConnectorOptions } from '../../helpers';

export interface IUniloginConnectorOptions extends IAbstractConnectorOptions {}

const ConnectToUniLogin = async (
  UniLogin: any,
  options: IUniloginConnectorOptions
) => {
  try {
    const uniloginProvider = new UniLogin.create(options.network || 'mainnet');
    await uniloginProvider.enable();
    uniloginProvider.on = () => {};
    return uniloginProvider;
  } catch (error) {
    return error;
  }
};

export default ConnectToUniLogin;
