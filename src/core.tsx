import * as React from "react";
import * as ReactDOM from "react-dom";
import Portis from "@portis/web3";
// @ts-ignore
import Fortmatic from "fortmatic";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
import MainModal from "./MainModal";

import {
  IProviderOptions,
  ConnectCallback,
  ErrorCallback,
  NoopFunction
} from "./types";

import { noop, getInjectProvider } from "./utils";

const WEB3_CONNECT_MODAL_ID = "WEB3_CONNECT_MODAL_ID";

interface IWeb3ConnectCoreOptions {
  onConnect: ConnectCallback;
  onClose: NoopFunction;
  onError: ErrorCallback;
  noModal?: boolean;
  lightboxOpacity?: number;
  providerOptions: IProviderOptions;
}

class Web3ConnectCore {
  private uri: string = "";
  private show: boolean = false;
  private connectCb: ConnectCallback;
  private closeCb: NoopFunction;
  private errorCb: ErrorCallback;
  private noModal: boolean;
  private injectedProvider: string | null;
  private lightboxOpacity: number;
  private providerOptions: IProviderOptions;

  constructor(opts: IWeb3ConnectCoreOptions) {
    console.log("[Web3ConnectCore] opts", opts);
    this.connectCb = opts.onConnect || noop;
    this.closeCb = opts.onClose || noop;
    this.errorCb = opts.onError || noop;
    this.noModal = typeof opts.noModal !== "undefined" ? opts.noModal : false;
    this.injectedProvider = getInjectProvider();
    this.lightboxOpacity = opts.lightboxOpacity || 0.4;
    this.providerOptions = opts.providerOptions || {};
    if (!this.noModal) {
      this.renderMainModal();
    }
  }

  public connectToInjected = async () => {
    let provider = null;
    if (window.ethereum) {
      provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        this.onError(new Error("User Rejected"));
        return;
      }
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      this.onError(new Error("No Web3 Provider found"));
      return;
    }
    this.onConnect(provider);
  };

  public connectToFortmatic = async () => {
    const { fortmatic } = this.providerOptions;
    if (fortmatic && fortmatic.key) {
      try {
        const key = fortmatic.key;
        const fm = new Fortmatic(key);
        const provider = await fm.getProvider();
        await fm.user.login();
        const isLoggedIn = await fm.user.isLoggedIn();
        if (isLoggedIn) {
          this.onConnect(provider);
        }
      } catch (error) {
        this.onError(new Error(error));
        return;
      }
    } else {
      this.onError(new Error("Missing Fortmatic key"));
      return;
    }
  };

  public connectToPortis = async () => {
    const { portis } = this.providerOptions;
    if (portis && portis.id) {
      try {
        const id = portis.id;
        const network = portis.network || "mainnet";
        const pt = new Portis(id, network);
        pt.showPortis();
        pt.onLogin(() => {
          this.onConnect(pt.provider);
        });
      } catch (error) {
        this.onError(new Error(error));
        return;
      }
    } else {
      this.onError(new Error("Missing Portis Id"));
      return;
    }
  };

  public connectToWalletConnect = async () => {
    if (this.uri) {
      if (!this.noModal) {
        this.setState({ uri: "" });
      }
      return;
    }
    const bridge = "https://bridge.walletconnect.org";
    const provider = new WalletConnectProvider({
      bridge,
      qrcode: this.noModal
    });

    if (!provider._walletConnector.connected) {
      await provider._walletConnector.createSession();

      if (!this.noModal) {
        this.setState({ uri: provider._walletConnector.uri });
      }

      provider._walletConnector.on("connect", async (error: Error) => {
        if (error) {
          throw error;
        }
        if (!this.noModal) {
          this.setState({ uri: "" });
        }

        this.onConnect(provider);
      });
    } else {
      this.onConnect(provider);
    }
  };

  public toggleModal = async () => {
    if (this.noModal) {
      return;
    }
    const d = typeof window !== "undefined" ? document : "";
    const body = d ? d.body || d.getElementsByTagName("body")[0] : "";
    if (body) {
      if (this.show) {
        body.style.position = "";
      } else {
        body.style.position = "fixed";
      }
    }
    this.setState({ show: !this.show });
  };

  private onError = async (error: any) => {
    await this.toggleModal();
    this.errorCb(error);
  };

  private onConnect = async (provider: any) => {
    await this.toggleModal();
    this.connectCb(provider);
  };

  private onClose = async () => {
    await this.toggleModal();
    this.closeCb();
  };

  private setState = (state: any) => {
    Object.keys(state).forEach(key => {
      this[key] = state[key];
    });
    window.updateWeb3ConnectMainModal(state);
  };

  private resetState = () => {
    this.setState({
      show: false,
      uri: ""
    });
  };

  public renderMainModal() {
    const el = document.createElement("div");
    el.id = WEB3_CONNECT_MODAL_ID;
    document.body.appendChild(el);
    ReactDOM.render(
      <MainModal
        show={this.show}
        uri={this.uri}
        onClose={this.onClose}
        resetState={this.resetState}
        injectedProvider={this.injectedProvider}
        lightboxOpacity={this.lightboxOpacity}
        providerOptions={this.providerOptions}
        connectToInjected={this.connectToInjected}
        connectToFortmatic={this.connectToFortmatic}
        connectToPortis={this.connectToPortis}
        connectToWalletConnect={this.connectToWalletConnect}
      />,
      document.getElementById(WEB3_CONNECT_MODAL_ID)
    );
  }
}

export default Web3ConnectCore;
