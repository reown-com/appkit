import * as list from "../providers";
import {
  CONNECT_EVENT,
  ERROR_EVENT,
  SELECT_EVENT,
  INJECTED_PROVIDER_ID,
  CACHED_PROVIDER_KEY
} from "../constants";
import {
  isMobile,
  IProviderControllerOptions,
  IProviderOptions,
  IProviderDisplayWithConnector,
  getLocal,
  setLocal,
  removeLocal,
  getProviderInfoById,
  getProviderDescription,
  IProviderInfo,
  filterMatches,
  IProviderUserOptions,
  getInjectedProvider,
  findMatchingRequiredOptions,
  fromCheckToId
} from "../helpers";
import { EventController } from "./events";

export class ProviderController {
  public cachedProvider: string = "";
  public shouldCacheProvider: boolean = false;
  public disableInjectedProvider: boolean = false;

  private eventController: EventController = new EventController();
  private injectedProvider: IProviderInfo | null = null;
  private providers: IProviderDisplayWithConnector[] = [];
  private providerOptions: IProviderOptions;
  private network: string = "";

  constructor(opts: IProviderControllerOptions) {
    this.cachedProvider = getLocal(CACHED_PROVIDER_KEY) || "";

    this.disableInjectedProvider = opts.disableInjectedProvider;
    this.shouldCacheProvider = opts.cacheProvider;
    this.providerOptions = opts.providerOptions;
    this.network = opts.network;

    this.injectedProvider = getInjectedProvider();
    console.log("this.injectedProvider", this.injectedProvider);

    const providers: IProviderDisplayWithConnector[] = [];

    Object.keys(list.connectors).forEach((id: string) => {
      let providerInfo: IProviderInfo;
      if (id === INJECTED_PROVIDER_ID) {
        providerInfo = this.injectedProvider || list.providers.FALLBACK;
        console.log("providerInfo", providerInfo);
        const injectedProviderId = fromCheckToId(providerInfo.check);
        console.log(
          "Object.keys(this.providerOptions)",
          Object.keys(this.providerOptions)
        );
        console.log("injectedProviderId", injectedProviderId);
        console.log(
          "should ignore if injected exists",
          Object.keys(this.providerOptions).includes(injectedProviderId)
        );
      } else {
        providerInfo = getProviderInfoById(id);
      }
      // parse custom display options
      if (this.providerOptions[id]) {
        const options = this.providerOptions[id];
        if (typeof options.display !== "undefined") {
          providerInfo = {
            ...providerInfo,
            ...this.providerOptions[id].display
          };
        }
      }
      console.log("id ========================>", id);
      // console.log("Object.keys(list.connectors)", Object.keys(list.connectors));
      providers.push({
        ...providerInfo,
        connector: list.connectors[id],
        package: providerInfo.package
      });
    });
    this.providers = providers;
    // parse custom providers
    Object.keys(this.providerOptions)
      .filter(key => key.startsWith("custom-"))
      .map(id => {
        if (id && this.providerOptions[id]) {
          const options = this.providerOptions[id];
          if (
            typeof options.display !== "undefined" &&
            typeof options.connector !== "undefined"
          ) {
            this.providers.push({
              ...list.providers.FALLBACK,
              id,
              ...options.display,
              connector: options.connector
            });
          }
        }
      });
  }

  public shouldDisplayProvider(id: string) {
    const provider = this.getProvider(id);
    if (typeof provider !== "undefined") {
      const providerPackageOptions = this.providerOptions[id];
      if (providerPackageOptions) {
        const isProvided = !!providerPackageOptions.package;
        if (isProvided) {
          const requiredOptions = provider.package
            ? provider.package.required
            : undefined;
          if (requiredOptions && requiredOptions.length) {
            const providedOptions = providerPackageOptions.options;
            if (providedOptions && Object.keys(providedOptions).length) {
              const matches = findMatchingRequiredOptions(
                requiredOptions,
                providedOptions
              );
              if (requiredOptions.length === matches.length) {
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
    const injectedProviderId = this.injectedProvider
      ? fromCheckToId(this.injectedProvider.check)
      : "";
    const defaultProviderList = this.providers.map(({ id }) => id);
    const displayInjected =
      !!this.injectedProvider && !this.disableInjectedProvider;
    const onlyInjected = displayInjected && mobile;

    let providerList: string[] = [];
    console.log("providerList", providerList);
    console.log("onlyInjected", onlyInjected);
    console.log("displayInjected", displayInjected);
    if (onlyInjected) {
      providerList.push(INJECTED_PROVIDER_ID);
    } else {
      if (displayInjected) {
        providerList.push(INJECTED_PROVIDER_ID);
      }

      defaultProviderList.forEach((id: string) => {
        if (id !== INJECTED_PROVIDER_ID) {
          const result = this.shouldDisplayProvider(id);
          // only push if it hasn't already been added
          // which may happen if an entry is in both 'provider' and 'injected' lists
          if (result && !providerList.includes(id)) {
            if (this.injectedProvider?.check) providerList.push(id);
          }
        }
      });
      if (this.injectedProvider && displayInjected) {
        console.log("injectedProviderId", injectedProviderId);
        if (providerList.includes(injectedProviderId)) {
          providerList = providerList.filter(id => id !== injectedProviderId);
        }
      }
    }

    const userOptions: IProviderUserOptions[] = [];

    providerList.forEach((id: string) => {
      let provider = this.getProvider(id);
      if (typeof provider !== "undefined") {
        if (
          provider.id === INJECTED_PROVIDER_ID &&
          providerList.includes(injectedProviderId)
        ) {
          // given that a provider option id matches the same injected provider
          // we will not include the detected injected provider to prevent duplicates
          return;
        }
        // otherwise then continue parsing the filtered provider list
        const { id, name, logo, connector } = provider;
        userOptions.push({
          id,
          name,
          logo,
          description: getProviderDescription(provider),
          onClick: () => this.connectTo(id, connector)
        });
      }
    });

    return userOptions;
  };

  public getProvider(id: string) {
    return filterMatches<IProviderDisplayWithConnector>(
      this.providers,
      x => x.id === id,
      undefined
    );
  }

  public getProviderOption(id: string, key: string) {
    return this.providerOptions &&
      this.providerOptions[id] &&
      this.providerOptions[id][key]
      ? this.providerOptions[id][key]
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
      this.eventController.trigger(SELECT_EVENT, id);
      const providerPackage = this.getProviderOption(id, "package");
      const providerOptions = this.getProviderOption(id, "options");
      const opts = { network: this.network || undefined, ...providerOptions };
      const provider = await connector(providerPackage, opts);
      this.eventController.trigger(CONNECT_EVENT, provider);
      if (this.shouldCacheProvider && this.cachedProvider !== id) {
        this.setCachedProvider(id);
      }
    } catch (error) {
      this.eventController.trigger(ERROR_EVENT, error);
    }
  };

  public async connectToCachedProvider() {
    const provider = this.getProvider(this.cachedProvider);
    if (typeof provider !== "undefined") {
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
