

export interface INetwork {
  nodeUrl: string;
  chainId?: string;
  networkName?: string;
}

interface NetworkInterface {
  host: 'mainnet' | 'rinkeby' | 'ropsten' | 'kovan' | 'goerli' | 'localhost' | 'matic' | string,
  chainId?: number; 
  networkName?: string;
}

interface VerifierStatus {
  google?: boolean;
  facebook?: boolean;
  reddit?: boolean;
  twitch?: boolean;
  discord?: boolean;
}


export interface IOptions {
  enableLogging?: boolean;
  buttonPosition?: string;
  buildEnv?: string;
  showTorusButton?: boolean;
  enabledVerifiers?: VerifierStatus
}

export interface ITorusConnectorOptions {
  network?: string | INetwork;
  config?: IOptions;
}

// Supports Torus package versions 0.1.*
const ConnectToTorus = async (Torus: any, opts: ITorusConnectorOptions) => {
    return new Promise(async (resolve, reject) => {
      try {

        // defaults
        let buttonPosition = 'bottom-left'
        let buildEnv = 'production'
        let enableLogging = true
        let showTorusButton = false
        let enabledVerifiers = {}
        let  network : NetworkInterface = {host: 'mainnet'}

        // parsing to Torus interfaces
        if (opts.network) {
          if (typeof(opts.network) == 'string') {
              network.host = opts.network
          } else {
            network.host = opts.network.nodeUrl
            let chainId: string = opts.network.chainId || ''
            network.chainId = parseInt(chainId, 10)
            network.networkName = opts.network.networkName
          }
        }
        if (opts.config) {
          buttonPosition = opts.config.buttonPosition || buttonPosition
           buildEnv = opts.config.buildEnv || buildEnv
           enableLogging = opts.config.enableLogging || enableLogging
           showTorusButton = opts.config.showTorusButton || showTorusButton
           enabledVerifiers = opts.config.enabledVerifiers || enabledVerifiers
        }

        const torus = new Torus({
          buttonPosition: buttonPosition
        });
        await torus.init({
          buildEnv: buildEnv,
          enableLogging: enableLogging,
          // network: {
          //   host: 'kovan', // mandatory
          //   // chainId: 1, // optional
          //   networkName: 'kovan' // optional
          // },
          network: network,
          showTorusButton: showTorusButton,
          enabledVerifiers: enabledVerifiers
        });
        await torus.login(); // await torus.ethereum.enable()
        const provider = torus.provider;
        provider.torus = torus
        resolve(provider);
      } catch (err) {
        reject(err)
      }
    });
};
  
export default ConnectToTorus;