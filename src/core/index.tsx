import * as React from "react";
import * as ReactDOM from "react-dom";
import Modal from "../components/Modal";
import { IProviderOptions, IProviderCallback } from "../helpers/types";
import { isMobile, getInjectedProviderName } from "../helpers/utils";
import connectors from "./connectors";
import EventManager from "./events";

const WEB3_CONNECT_MODAL_ID = "WEB3_CONNECT_MODAL_ID";

interface ICoreOptions {
  modal?: boolean;
  network?: string;
  lightboxOpacity?: number;
  providerOptions?: IProviderOptions;
}

const INITIAL_STATE = { show: false };

class Core {
  private show: boolean = INITIAL_STATE.show;
  private eventManager: EventManager = new EventManager();
  private injectedProvider: string | null = null;
  private network: string = "";
  private lightboxOpacity: number = 0.4;
  private providerOptions: IProviderOptions = {};
  private providers: IProviderCallback[];

  constructor(opts?: ICoreOptions) {
    this.injectedProvider = getInjectedProviderName();

    if (opts) {
      this.network = opts.network || "";
      this.lightboxOpacity = opts.lightboxOpacity || 0.4;
      this.providerOptions = opts.providerOptions || {};
    }

    this.providers = this.getProviders();

    this.renderModal();
  }

  public on(event: string, callback: (result: any) => void): void {
    this.eventManager.on({
      event,
      callback
    });
  }

  public connectTo = async (
    type: string,
    connector: (opts: any) => Promise<any>
  ) => {
    try {
      let opts = undefined;
      if (type !== "injected") {
        const providerOptions =
          this.providerOptions && this.providerOptions[type]
            ? this.providerOptions[type]
            : {};
        opts = this.network
          ? { network: this.network, ...providerOptions }
          : providerOptions;
      }
      const provider = await connector(opts);
      await this.onConnect(provider);
    } catch (error) {
      await this.onError(error);
    }
  };

  public toggleModal = async () => {
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

  public getProviders = () => {
    const mobile = isMobile();

    let providers = [
      "injected",
      "walletconnect",
      "portis",
      "fortmatic",
      "squarelink"
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

      const displayWalletConnect =
        providerOptions &&
        providerOptions.walletconnect &&
        providerOptions.walletconnect.infuraId;
      if (!displayWalletConnect) {
        providers = providers.filter(provider => provider !== "walletconnect");
      }

      const displaySquarelink =
        providerOptions &&
        providerOptions.squarelink &&
        providerOptions.squarelink.id;

      if (!displaySquarelink) {
        providers = providers.filter(provider => provider !== "squarelink");
      }

      const displayPortis =
        providerOptions && providerOptions.portis && providerOptions.portis.id;

      if (!displayPortis) {
        providers = providers.filter(provider => provider !== "portis");
      }
      const displayFortmatic =
        providerOptions &&
        providerOptions.fortmatic &&
        providerOptions.fortmatic.key;

      if (!displayFortmatic) {
        providers = providers.filter(provider => provider !== "fortmatic");
      }
    }

    const providersMap = providers.map(provider => {
      switch (provider) {
        case "injected":
          return {
            name: injectedProvider,
            onClick: () =>
              this.connectTo("injected", connectors.ConnectToInjected)
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
        case "squarelink":
          return {
            name: "Squarelink",
            onClick: () =>
              this.connectTo("squarelink", connectors.ConnectToSquarelink)
          };
        case "fortmatic":
          return {
            name: "Fortmatic",
            onClick: () =>
              this.connectTo("fortmatic", connectors.ConnectToFortmatic)
          };

        default:
          return {
            name: "",
            onClick: async () => {}
          };
      }
    });

    return providersMap;
  };

  private onError = async (error: any) => {
    if (this.show) {
      await this.toggleModal();
    }
    this.eventManager.trigger("error", error);
  };

  private onConnect = async (provider: any) => {
    if (this.show) {
      await this.toggleModal();
    }
    this.eventManager.trigger("connect", provider);
  };

  private onClose = async () => {
    if (this.show) {
      await this.toggleModal();
    }
    this.eventManager.trigger("close");
  };

  private updateState = async (state: any) => {
    Object.keys(state).forEach(key => {
      this[key] = state[key];
    });
    await window.updateWeb3ConnectModal(state);
  };

  private resetState = () => this.updateState({ ...INITIAL_STATE });

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
}

export default Core;
