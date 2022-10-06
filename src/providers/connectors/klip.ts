export interface IKlipWalletOptions{
    bappName: string;
    rpcUrl: string;
}

const ConnectToKlipWallet = (KlipWalletProvider: any, opts: IKlipWalletOptions) => {
    return new Promise(async (resolve, reject) => {
        let bappName = ""
        let rpcUrl = ""
        if (opts) {
            bappName = opts.bappName
            rpcUrl= opts.rpcUrl
        }

        const provider = new KlipWalletProvider({
            bappName,
            rpcUrl
        });

        try {
            await provider.enable();
            resolve(provider);
        } catch (e) {
            reject(e);
        }
    })
}

export default ConnectToKlipWallet;
