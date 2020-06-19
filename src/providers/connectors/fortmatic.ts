import { IAbstractConnectorOptions } from "../../helpers";

export interface IFortmaticConnectorOptions extends IAbstractConnectorOptions {
  key: string;
}

export const getProvider = async (
  Fortmatic: any,
  opts: IFortmaticConnectorOptions
) => {
  if (opts && opts.key) {
    const key = opts.key;
    const fm = new Fortmatic(key, opts.network);
    const provider = await fm.getProvider();
    provider.fm = fm;
    return provider;
  } else {
    throw new Error("Missing Fortmatic key");
  }
};

export const enableProvider = async (
  Fortmatic: any,
  opts: IFortmaticConnectorOptions
) => {
  try {
    const provider = await getProvider(Fortmatic, opts);
    await provider.fm.user.login();
    const isLoggedIn = await provider.fm.user.isLoggedIn();
    if (isLoggedIn) {
      return provider;
    } else {
      throw new Error("Failed to login to Fortmatic");
    }
  } catch (error) {
    throw error;
  }
};
