import {
  IProviderControllerOptions,
  IProviderUserOptions,
  ProviderController,
} from "..";

export class Web3WalletConnector {
  public providers: IProviderUserOptions[] = [];
  public providerController: ProviderController;

  constructor(configOptions?: IProviderControllerOptions) {
    if (!configOptions) {
      this.providerController = new ProviderController({
        disableInjectedProvider: false,
        cacheProvider: false,
        providerOptions: {},
        network: "",
      });
    } else {
      this.providerController = new ProviderController(configOptions);
    }

    this.providers = this.providerController.getUserOptions()
  }

  get cachedProvider(): string {
    return this.providerController.cachedProvider;
  }

  setConfiguration = (options: IProviderControllerOptions): void => {
    this.providerController = new ProviderController(options);
    this.clearCachedProvider();

    this.providers = this.providerController.getUserOptions();
  };

  async checkIfCachedProviderOrSingleOption(): Promise<void> {
    if (this.cachedProvider) {
      await this.providerController.connectToCachedProvider();
      return;
    }
    if (
      this.providers &&
      this.providers.length === 1 &&
      this.providers[0].name
    ) {
      await this.providers[0].onClick();
      return;
    }
  }

  clearCachedProvider(): void {
    this.providerController.clearCachedProvider();
  }

  setCachedProvider(id: string): void {
    this.providerController.setCachedProvider(id);
  }
}
