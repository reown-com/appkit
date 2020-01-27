import { IProviderOptions, IProviderMappingEntry } from "../../helpers/types";
import { isMobile, getInjectedProviderName } from "../../helpers/utils";
import { providerMapping } from "../../providers";
import EventController from "./events";
import {
  CONNECT_EVENT,
  ERROR_EVENT,
  INJECTED_PROVIDER_ID
} from "../../helpers/constants";

interface IProviderControllerOptions {
  providerOptions: IProviderOptions;
  network: string;
}

class ProviderController {
  private eventController: EventController = new EventController();
  private injectedProvider: string | null = null;
  private providerMapping: IProviderMappingEntry[] = [];
  private providerOptions: IProviderOptions;
  private network: string = "";

  constructor(opts: IProviderControllerOptions) {
    this.providerOptions = opts.providerOptions;
    this.network = opts.network;

    this.generateProviderMapping();
  }

  public generateProviderMapping() {
    this.injectedProvider = getInjectedProviderName();
    this.providerMapping = providerMapping.map(entry => {
      if (entry.id === INJECTED_PROVIDER_ID) {
        entry.name = this.injectedProvider || "";
      }
      return entry;
    });
  }

  public shouldDisplayProvider(id: string) {
    const provider = this.getProviderMappingEntry(id);
    if (provider) {
      const providerPackageOptions = this.providerOptions[id];
      if (providerPackageOptions) {
        const isProvided = !!providerPackageOptions.package;
        if (isProvided) {
          const required = provider.package.required;
          if (required.length) {
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

  public getProviders = () => {
    const mobile = isMobile();

    const defaultProviderList = this.providerMapping.map(({ id }) => id);

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

    const providersMap = providerList.map((id: string) => {
      let provider = this.getProviderMappingEntry(id);
      if (typeof provider !== "undefined") {
        const { id, name, connector } = provider;
        return {
          name: name,
          onClick: () => this.connectTo(id, connector)
        };
      }
      return {
        name: "",
        onClick: async () => {
          // empty
        }
      };
    });

    return providersMap;
  };

  public getProviderMappingEntry(id: string) {
    const matches = this.providerMapping
      .filter(entry => (entry.id === id ? entry : undefined))
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
    } catch (error) {
      this.eventController.trigger(ERROR_EVENT);
    }
  };

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

export default ProviderController;
