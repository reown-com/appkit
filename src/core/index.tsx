import * as React from "react";
import * as ReactDOM from "react-dom";
import Modal from "../components/Modal";
import { IProviderOptions, IProviderCallback } from "../helpers/types";
import { isMobile, getInjectedProviderName } from "../helpers/utils";
import connectors from "./connectors";
import EventManager from "./events";
import { providerPackages } from "../providers";
import { setLocal, removeLocal, getLocal } from "../helpers/local";
import {
  WEB3_CONNECT_MODAL_ID,
  PREFERRED_PROVIDER_KEY,
  CONNECT_EVENT,
  DISCONNECT_EVENT,
  CLOSE_EVENT
} from "../helpers/constants";

interface ICoreOptions {
  disablePreferredProvider?: boolean;
  network?: string;
  lightboxOpacity?: number;
  providerOptions?: IProviderOptions;
}

const INITIAL_STATE = { show: false };

class Core {
  private show: boolean = INITIAL_STATE.show;
  private eventManager: EventManager = new EventManager();
  private injectedProvider: string | null = null;
  private disablePreferredProvider: boolean = false;
  private network: string = "";
  private lightboxOpacity: number = 0.4;
  private providerOptions: IProviderOptions = {};
  private providers: IProviderCallback[];
  private preferredProvider: string | undefined;

  constructor(opts?: ICoreOptions) {
    this.injectedProvider = getInjectedProviderName();

    if (opts) {
      this.disablePreferredProvider = opts.disablePreferredProvider || false;
      this.network = opts.network || "";
      this.lightboxOpacity = opts.lightboxOpacity || 0.4;
      this.providerOptions = opts.providerOptions || {};
    }

    this.preferredProvider = getLocal(PREFERRED_PROVIDER_KEY) || undefined;
    this.providers = this.getProviders();

    this.renderModal();
  }

  // --------------- PUBLIC METHODS --------------- //

  public on(event: string, callback: (result: any) => void): () => void {
    this.eventManager.on({
      event,
      callback
    });

    return () =>
      this.eventManager.off({
        event,
        callback
      });
  }

  public off(event: string, callback?: (result: any) => void): void {
    this.eventManager.off({
      event,
      callback
    });
  }

  public setPreferredProvider(name: string) {
    this.preferredProvider = name;
    setLocal(PREFERRED_PROVIDER_KEY, name);
  }

  public clearPreferredProvider() {
    this.preferredProvider = undefined;
    removeLocal(PREFERRED_PROVIDER_KEY);
  }

  public connectToInjected = async () => {
    try {
      const provider = await connectors.ConnectToInjected();
      await this.onConnect(provider, "injected");
    } catch (error) {
      await this.onError(error);
    }
  };

  public connectTo = async (
    name: string,
    connector: (providerPackage: any, opts: any) => Promise<any>
  ) => {
    try {
      const providerPackage =
        this.providerOptions &&
        this.providerOptions[name] &&
        this.providerOptions[name].package
          ? this.providerOptions[name].package
          : {};
      const providerOptions =
        this.providerOptions &&
        this.providerOptions[name] &&
        this.providerOptions[name].options
          ? this.providerOptions[name].options
          : {};
      const opts = this.network
        ? { network: this.network, ...providerOptions }
        : providerOptions;
      const provider = await connector(providerPackage, opts);
      if (provider.isWalletConnect) {
        // Listen for Disconnect event
        provider.wc.on(DISCONNECT_EVENT, async () => {
          return this.onDisconnect();
        });
      }
      await this.onConnect(provider, name);
    } catch (error) {
      await this.onError(error);
    }
  };

  public toggleModal = async () => {
    if (this.preferredProvider) {
      const provider = this.getProvider(this.preferredProvider);
      await provider.onClick();
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

    const d = typeof window !== "undefined" ? document : "";
    const body = d ? d.body || d.getElementsByTagName("body")[0] : "";
    if (body) {
      if (this.show) {
        body.style.overflow = "";
      } else {
        body.style.overflow = "hidden";
      }
    }
    await this.updateState({ show: !this.show });
  };

  public renderModal() {
    const el = document.createElement("div");
    el.id = WEB3_CONNECT_MODAL_ID;
    document.body.appendChild(el);

    ReactDOM.render(
      <Modal
        providers={this.providers}
        onClose={this.onClose}
        resetState={this.resetState}
        lightboxOpacity={this.lightboxOpacity}
      />,
      document.getElementById(WEB3_CONNECT_MODAL_ID)
    );
  }

  // --------------- PRIVATE METHODS --------------- //

  private shouldDisplayProvider(name: string) {
    const { providerOptions } = this;
    const providerPackage = providerPackages[name];

    if (providerOptions) {
      const providerPackageOptions = providerOptions[providerPackage.option];

      if (providerPackageOptions) {
        const isProvided = providerPackageOptions.package;
        if (isProvided) {
          const required = providerPackage.required;
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

  private getProviders = () => {
    const mobile = isMobile();

    let providers = [
      "injected",
      "walletconnect",
      "portis",
      "fortmatic",
      "squarelink",
      "torus",
      "arkane",
      "authereum"
    ];

    const { injectedProvider, providerOptions } = this;

    const displayInjected =
      injectedProvider && !providerOptions.disableInjectedProvider;

    const onlyInjected = displayInjected && mobile;

    if (onlyInjected) {
      providers = ["injected"];
    } else {
      if (!displayInjected) {
        providers = providers.filter(provider => provider !== "injected");
      }

      if (!this.shouldDisplayProvider("walletconnect")) {
        providers = providers.filter(provider => provider !== "walletconnect");
      }

      if (!this.shouldDisplayProvider("portis")) {
        providers = providers.filter(provider => provider !== "portis");
      }

      if (!this.shouldDisplayProvider("fortmatic")) {
        providers = providers.filter(provider => provider !== "fortmatic");
      }

      if (!this.shouldDisplayProvider("squarelink")) {
        providers = providers.filter(provider => provider !== "squarelink");
      }

      if (!this.shouldDisplayProvider("torus")) {
        providers = providers.filter(provider => provider !== "torus");
      }

      if (!this.shouldDisplayProvider("arkane")) {
        providers = providers.filter(provider => provider !== "arkane");
      }

      if (!this.shouldDisplayProvider("authereum")) {
        providers = providers.filter(provider => provider !== "authereum");
      }
    }

    const providersMap = providers.map(provider => {
      switch (provider) {
        case "injected":
          return {
            name: injectedProvider,
            onClick: this.connectToInjected
          };
        case "walletconnect":
          return {
            name: "WalletConnect",
            onClick: () =>
              this.connectTo("walletconnect", connectors.ConnectToWalletConnect)
          };
        case "portis":
          return {
            name: "Portis",
            onClick: () => this.connectTo("portis", connectors.ConnectToPortis)
          };
        case "fortmatic":
          return {
            name: "Fortmatic",
            onClick: () =>
              this.connectTo("fortmatic", connectors.ConnectToFortmatic)
          };
        case "squarelink":
          return {
            name: "Squarelink",
            onClick: () =>
              this.connectTo("squarelink", connectors.ConnectToSquarelink)
          };
        case "arkane":
          return {
            name: "Arkane",
            onClick: () => this.connectTo("arkane", connectors.ConnectToArkane)
          };
        case "torus":
          return {
            name: "Google",
            onClick: () => this.connectTo("torus", connectors.ConnectToTorus)
          };
        case "authereum":
          return {
            name: "Authereum",
            onClick: () =>
              this.connectTo("authereum", connectors.ConnectToAuthereum)
          };

        default:
          return {
            name: "",
            onClick: async () => {
              // empty
            }
          };
      }
    });

    return providersMap;
  };

  private getProvider = (name: string) => {
    const providers = this.getProviders();
    const provider = providers.filter(x => x.name === name)[0];
    return provider;
  };

  private onError = async (error: any) => {
    if (this.show) {
      await this.toggleModal();
    }
    this.eventManager.trigger("error", error);
  };

  private onConnect = async (provider: any, name: string) => {
    if (this.show) {
      await this.toggleModal();
    }
    if (this.disablePreferredProvider) {
      this.setPreferredProvider(name);
    }
    this.eventManager.trigger(CONNECT_EVENT, provider);
  };

  private onDisconnect = async () => {
    this.eventManager.trigger(DISCONNECT_EVENT);
  };

  private onClose = async () => {
    if (this.show) {
      await this.toggleModal();
    }
    this.eventManager.trigger(CLOSE_EVENT);
  };

  private updateState = async (state: any) => {
    Object.keys(state).forEach(key => {
      this[key] = state[key];
    });
    await window.updateWeb3ConnectModal(state);
  };

  private resetState = () => this.updateState({ ...INITIAL_STATE });
}

export default Core;
