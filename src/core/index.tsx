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

const INITIAL_STATE = { uri: "", show: false };

class Core {
  private uri: string = INITIAL_STATE.uri;
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

  public connectToInjected = async () => {
    try {
      const provider = await connectors.ConnectToInjected();
      await this.onConnect(provider);
    } catch (error) {
      await this.onError(error);
    }
  };

  public connectToFortmatic = async () => {
    try {
      const providerOptions =
        this.providerOptions && this.providerOptions.fortmatic
          ? this.providerOptions.fortmatic
          : {};
      const opts = this.network
        ? { network: this.network, ...providerOptions }
        : providerOptions;
      const provider = await connectors.ConnectToFortmatic(opts);
      await this.onConnect(provider);
    } catch (error) {
      await this.onError(error);
    }
  };

  public connectToSquarelink = async () => {
    try {
      const providerOptions =
        this.providerOptions && this.providerOptions.squarelink
          ? this.providerOptions.squarelink
          : {};
      const opts = this.network
        ? { network: this.network, ...providerOptions }
        : providerOptions;
      const provider = await connectors.ConnectToSquarelink(opts);
      await this.onConnect(provider);
    } catch (error) {
      await this.onError(error);
    }
  };

  public connectToPortis = async () => {
    try {
      const providerOptions =
        this.providerOptions && this.providerOptions.walletconnect
          ? this.providerOptions.portis
          : {};
      const opts = this.network
        ? { network: this.network, ...providerOptions }
        : providerOptions;
      const provider = await connectors.ConnectToPortis(opts);
      await this.onConnect(provider);
    } catch (error) {
      await this.onError(error);
    }
  };

  public connectToWalletConnect = async () => {
    if (this.uri) {
      await this.updateState({ uri: "" });
      return;
    }
    try {
      const providerOptions =
        this.providerOptions && this.providerOptions.walletconnect
          ? this.providerOptions.walletconnect
          : {};
      const opts = this.network
        ? { network: this.network, ...providerOptions }
        : providerOptions;
      const provider = await connectors.ConnectToWalletConnect({
        infuraId: opts.infuraId,
        bridge: opts.bridge,
        qrcode: false,
        onUri: (uri: string) => this.updateState({ uri })
      });
      await this.updateState({ uri: "" });
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

    const {
      injectedProvider,
      providerOptions,
      connectToInjected,
      connectToFortmatic,
      connectToPortis,
      connectToSquarelink,
      connectToWalletConnect
    } = this;

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
            onClick: connectToInjected
          };
        case "walletconnect":
          return {
            name: "WalletConnect",
            onClick: connectToWalletConnect
          };
        case "portis":
          return {
            name: "Portis",
            onClick: connectToPortis
          };
        case "squarelink":
          return {
            name: "Squarelink",
            onClick: connectToSquarelink
          };
        case "fortmatic":
          return {
            name: "Fortmatic",
            onClick: connectToFortmatic
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
    await this.toggleModal();
    this.eventManager.trigger("error", error);
  };

  private onConnect = async (provider: any) => {
    await this.toggleModal();
    this.eventManager.trigger("connect", provider);
  };

  private onClose = async () => {
    await this.toggleModal();
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
