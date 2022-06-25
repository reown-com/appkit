import { IAbstractConnectorOptions } from "../../helpers";
// import { CHAIN_DATA_LIST } from "src/constants";


export interface IWeb3AuthConnectorOptions extends IAbstractConnectorOptions {
    chainId?: number
    clientId?: string
    infuraId?: string
}

const connectToweb3auth = async(Web3Auth: any, opts: IWeb3AuthConnectorOptions) => {

    return new Promise(async (resolve, reject) => {
        try {

            const options = opts || {};
            const chainID = options.chainId || "0x1"
            const clientID = options.clientId || "localhostid"
            const infuraID = options.infuraId
            
            const web3auth = new Web3Auth({
                chainConfig: {
                    chainNamespace: "eip155",
                    chainId : chainID,
                    rpcTarget: `https://mainnet.infura.io/v3/${infuraID}`,

                },
                clientId: clientID
            });

            console.log(web3auth)

            await web3auth.initModal()
            

            await web3auth.connect();
            const provider = web3auth.provider
            provider.web3auth = web3auth;
            resolve(provider);
        } catch (e) {
            console.log(e)
            reject(e);
        }

    })

}



export default connectToweb3auth;