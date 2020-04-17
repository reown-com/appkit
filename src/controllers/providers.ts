import { connectors } from "../providers";
import {
  CONNECT_EVENT,
  ERROR_EVENT,
  INJECTED_PROVIDER_ID,
  CACHED_PROVIDER_KEY
} from "../constants";
import {
  isMobile,
  getInjectedProviderName,
  IProviderControllerOptions,
  IProviderOptions,
  IProviderInfoWithConnector,
  getLocal,
  setLocal,
  removeLocal,
  getProviderInfoById,
  getProviderDescription
} from "../helpers";
import { EventController } from "./events";

export class ProviderController {
  public cachedProvider: string = "";
  public shouldCacheProvider: boolean = false;

  private eventController: EventController = new EventController();
  private injectedProvider: string | null = null;
  private providers: IProviderInfoWithConnector[] = [];
  private providerOptions: IProviderOptions;
  private network: string = "";

  constructor(opts: IProviderControllerOptions) {
    this.cachedProvider = getLocal(CACHED_PROVIDER_KEY) || "";

    this.shouldCacheProvider = opts.cacheProvider;
    this.providerOptions = opts.providerOptions;
    this.network = opts.network;

    this.injectedProvider = getInjectedProviderName();

    this.providers = Object.keys(connectors).map((id: string) => {
      const providerInfo = getProviderInfoById(id);
      const name =
        id !== INJECTED_PROVIDER_ID
          ? providerInfo.name
          : this.injectedProvider || "";
      return {
        ...providerInfo,
        id,
        name,
        connector: connectors[id],
        package: providerInfo.package
      };
    });
  }

  public shouldDisplayProvider(id: string) {
    const provider = this.getProvider(id);
    if (provider) {
      const providerPackageOptions = this.providerOptions[id];
      if (providerPackageOptions) {
        const isProvided = !!providerPackageOptions.package;
        if (isProvided) {
          const required = provider.package
            ? provider.package.required
            : undefined;
          if (required && required.length) {
            const providedOptions = providerPackageOptions.options;
            if (providedOptions && Object.keys(providedOptions).length) {
              const matches = required.filter(
                (key: string) => key in providedOptions
              );
              if (required.length === matches.length) {
                return true;
              }
            }
          } else {
            return true;
          }
        }
      }
    }
    return false;
  }

  public getUserOptions = () => {
    const mobile = isMobile();

    const defaultProviderList = this.providers.map(({ id }) => id);

    const displayInjected =
      this.injectedProvider && !this.providerOptions.disableInjectedProvider;

    const onlyInjected = displayInjected && mobile;

    const providerList = [];

    if (onlyInjected) {
      providerList.push(INJECTED_PROVIDER_ID);
    } else {
      if (displayInjected) {
        providerList.push(INJECTED_PROVIDER_ID);
      }

      defaultProviderList.forEach((id: string) => {
        if (id !== INJECTED_PROVIDER_ID) {
          const result = this.shouldDisplayProvider(id);
          if (result) {
            providerList.push(id);
          }
        }
      });
    }

    const userOptions = providerList.map((id: string) => {
      let provider = this.getProvider(id);
      if (typeof provider !== "undefined") {
        const { id, name, logo, connector } = provider;
        return {
          name,
          logo,
          description: getProviderDescription(provider),
          onClick: () => this.connectTo(id, connector)
        };
      }
      return {
        name: "",
        logo: "",
        description: "",
        onClick: async () => {
          // empty
        }
      };
    });

    return userOptions;
  };

  public getProvider(id: string) {
    const matches = this.providers
      .filter(entry =>
        entry.id.toLowerCase() === id.toLowerCase() ? entry : undefined
      )
      .filter(x => !!x);
    if (matches && matches.length) {
      return matches[0];
    }
    return undefined;
  }

  public getProviderOption(id: string, field: string) {
    return this.providerOptions &&
      this.providerOptions[id] &&
      this.providerOptions[id][field]
      ? this.providerOptions[id][field]
      : {};
  }

  public clearCachedProvider() {
    this.cachedProvider = "";
    removeLocal(CACHED_PROVIDER_KEY);
  }

  public setCachedProvider(id: string) {
    this.cachedProvider = id;
    setLocal(CACHED_PROVIDER_KEY, id);
  }

  public connectTo = async (
    id: string,
    connector: (providerPackage: any, opts: any) => Promise<any>
  ) => {
    try {
      const providerPackage = this.getProviderOption(id, "package");
      const providerOptions = this.getProviderOption(id, "options");
      const opts = { network: this.network || undefined, ...providerOptions };
      const provider = await connector(providerPackage, opts);
      this.eventController.trigger(CONNECT_EVENT, provider);
      if (this.shouldCacheProvider && this.cachedProvider !== id) {
        this.setCachedProvider(id);
      }
    } catch (error) {
      this.eventController.trigger(ERROR_EVENT);
    }
  };

  public async connectToCachedProvider() {
    const provider = this.getProvider(this.cachedProvider);
    if (provider) {
      await this.connectTo(provider.id, provider.connector);
    }
  }

  public on(event: string, callback: (result: any) => void): () => void {
    this.eventController.on({
      event,
      callback
    });

    return () =>
      this.eventController.off({
        event,
        callback
      });
  }

  public off(event: string, callback?: (result: any) => void): void {
    this.eventController.off({
      event,
      callback
    });
  }
}
