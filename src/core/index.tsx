import * as React from "react";
import * as ReactDOM from "react-dom";

import {
  ICoreOptions,
  IProviderUserOptions,
  ThemeColors,
  getThemeColors,
  SimpleFunction
} from "../helpers";
import {
  WEB3_CONNECT_MODAL_ID,
  CONNECT_EVENT,
  ERROR_EVENT,
  CLOSE_EVENT,
  SELECT_EVENT
} from "../constants";
import { themesList } from "../themes";
import { Modal } from "../components";
import { EventController, ProviderController } from "../controllers";

const INITIAL_STATE = { show: false };

const defaultOpts: ICoreOptions = {
  lightboxOpacity: 0.4,
  theme: themesList.default.name,
  cacheProvider: false,
  disableInjectedProvider: false,
  providerOptions: {},
  network: ""
};

export class Core {
  private show: boolean = INITIAL_STATE.show;
  private themeColors: ThemeColors;
  private eventController: EventController = new EventController();
  private lightboxOpacity: number;
  private providerController: ProviderController;
  private userOptions: IProviderUserOptions[];

  constructor(opts?: Partial<ICoreOptions>) {
    const options: ICoreOptions = {
      ...defaultOpts,
      ...opts
    };

    this.lightboxOpacity = options.lightboxOpacity;
    this.themeColors = getThemeColors(options.theme);

    this.providerController = new ProviderController({
      disableInjectedProvider: options.disableInjectedProvider,
      cacheProvider: options.cacheProvider,
      providerOptions: options.providerOptions,
      network: options.network
    });

    this.providerController.on(CONNECT_EVENT, provider =>
      this.onConnect(provider)
    );
    this.providerController.on(ERROR_EVENT, error => this.onError(error));

    this.providerController.on(SELECT_EVENT, this.onProviderSelect);

    this.userOptions = this.providerController.getUserOptions();
    this.renderModal();
  }

  get cachedProvider(): string {
    return this.providerController.cachedProvider;
  }

  // --------------- PUBLIC METHODS --------------- //

  public connect = (): Promise<any> =>
    new Promise(async (resolve, reject) => {
      this.on(CONNECT_EVENT, provider => resolve(provider));
      this.on(ERROR_EVENT, error => reject(error));
      this.on(CLOSE_EVENT, () => reject("Modal closed by user"));
      await this.toggleModal();
    });

  public connectTo = (id: string): Promise<any> =>
    new Promise(async (resolve, reject) => {
      this.on(CONNECT_EVENT, provider => resolve(provider));
      this.on(ERROR_EVENT, error => reject(error));
      this.on(CLOSE_EVENT, () => reject("Modal closed by user"));
      const provider = this.providerController.getProvider(id);
      if (!provider) {
        return reject(
          new Error(
            `Cannot connect to provider (${id}), check provider options`
          )
        );
      }
      await this.providerController.connectTo(provider.id, provider.connector);
    });

  public async toggleModal(): Promise<void> {
    if (this.cachedProvider) {
      await this.providerController.connectToCachedProvider();
      return;
    }
    if (
      this.userOptions &&
      this.userOptions.length === 1 &&
      this.userOptions[0].name
    ) {
      await this.userOptions[0].onClick();
      return;
    }
    await this._toggleModal();
  }

  public on(event: string, callback: SimpleFunction): SimpleFunction {
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

  public off(event: string, callback?: SimpleFunction): void {
    this.eventController.off({
      event,
      callback
    });
  }

  public getUserOptions(): IProviderUserOptions[] {
    return this.userOptions
  }

  public clearCachedProvider(): void {
    this.providerController.clearCachedProvider();
  }

  public setCachedProvider(id: string): void {
    this.providerController.setCachedProvider(id);
  }

  public async updateTheme(theme: string | ThemeColors): Promise<void> {
    this.themeColors = getThemeColors(theme);
    await this.updateState({ themeColors: this.themeColors });
  }

  // --------------- PRIVATE METHODS --------------- //

  private renderModal() {
    const el = document.createElement("div");
    el.id = WEB3_CONNECT_MODAL_ID;
    document.body.appendChild(el);

    ReactDOM.render(
      <Modal
        themeColors={this.themeColors}
        userOptions={this.userOptions}
        onClose={this.onClose}
        resetState={this.resetState}
        lightboxOpacity={this.lightboxOpacity}
      />,
      document.getElementById(WEB3_CONNECT_MODAL_ID)
    );
  }

  private _toggleModal = async () => {
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

  private onError = async (error: any) => {
    if (this.show) {
      await this._toggleModal();
    }
    this.eventController.trigger(ERROR_EVENT, error);
  };

  private onProviderSelect = (providerId: string) => {
    this.eventController.trigger(SELECT_EVENT, providerId);
  };

  private onConnect = async (provider: any) => {
    if (this.show) {
      await this._toggleModal();
    }
    this.eventController.trigger(CONNECT_EVENT, provider);
  };

  private onClose = async () => {
    if (this.show) {
      await this._toggleModal();
    }
    this.eventController.trigger(CLOSE_EVENT);
  };

  private updateState = async (state: any) => {
    Object.keys(state).forEach(key => {
      this[key] = state[key];
    });
    await window.updateWeb3Modal(state);
  };

  private resetState = () => this.updateState({ ...INITIAL_STATE });
}
