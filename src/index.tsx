import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import Portis from "@portis/web3";
// @ts-ignore
import Fortmatic from "fortmatic";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
import Button from "./components/Button";
import Provider from "./components/Provider";
import QRCodeDisplay from "./components/QRCodeDisplay";
import { SDescription } from "./components/common";
import { getInjectProvider, isMobile } from "./utils";

declare global {
  // tslint:disable-next-line
  interface Window {
    ethereum: any;
    web3: any;
  }
}

interface IWeb3ConnectStyleProps {
  show: boolean;
  offset: number;
  opacity?: number;
}

const SLightbox = styled.div<IWeb3ConnectStyleProps>`
  transition: opacity 0.1s ease-in-out;
  text-align: center;
  position: absolute;
  width: 100vw;
  height: 100vh;
  margin-left: -50vw;
  top: ${({ offset }) => (offset ? `-${offset}px` : 0)};
  left: 50%;
  z-index: 2;
  will-change: opacity;
  background-color: ${({ opacity }) => {
    let alpha = 0.4;
    if (typeof opacity === "number") {
      alpha = opacity;
    }
    return `rgba(0, 0, 0, ${alpha})`;
  }};
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  pointer-events: ${({ show }) => (show ? "auto" : "none")};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SModalContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SHitbox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

interface IQRCodeWrapperStyleProps {
  size: number;
}

const SQRCodeWrapper = styled.div<IQRCodeWrapperStyleProps>`
  padding: 20px;
  width: 100%;
  max-width: ${({ size }) => `${size}px`};
  height: 100%;
  max-height: ${({ size }) => `${size}px`};
`;

const SQRCodeDisplay = styled(QRCodeDisplay)`
  height: 100%;
`;

interface IModalCardStyleProps {
  maxWidth?: number;
  hide?: boolean;
}

const SModalCard = styled.div<IModalCardStyleProps>`
  position: relative;
  width: 100%;
  background-color: rgb(255, 255, 255);
  border-radius: 12px;
  margin: 10px;
  padding: 0;
  opacity: ${({ hide }) => (!hide ? 1 : 0)};
  visibility: ${({ hide }) => (!hide ? "visible" : "hidden")};
  pointer-events: ${({ hide }) => (!hide ? "auto" : "none")};

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "800px")};

  @media screen and (max-width: 768px) {
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "500px")};
  }
`;

const SQRCodeDescription = styled(SDescription)`
  margin-top: 30px;
`;

interface IProviderOptions {
  [providerName: string]: any;
}

interface IWeb3ConnectProps {
  onClose: any;
  onConnect: any;
  lightboxOpacity?: number;
  providerOptions?: IProviderOptions;
}

interface IWeb3ConnectState {
  show: boolean;
  uri: string;
  mobile: boolean;
  injectedProvider: any;
  lightboxOffset: number;
  qrcodeSize: number;
  providerOptions: IProviderOptions;
}

const INITIAL_STATE: IWeb3ConnectState = {
  show: false,
  uri: "",
  mobile: isMobile(),
  injectedProvider: null,
  lightboxOffset: 0,
  qrcodeSize: 382,
  providerOptions: {}
};

class Web3Connect extends React.Component<
  IWeb3ConnectProps,
  IWeb3ConnectState
> {
  public static propTypes = {
    onConnect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    lightboxOpacity: PropTypes.number,
    providerOptions: PropTypes.object
  };

  public lightboxRef?: HTMLDivElement | null;
  public mainModalCard?: HTMLDivElement | null;

  public state: IWeb3ConnectState = {
    ...INITIAL_STATE,
    injectedProvider: getInjectProvider(),
    providerOptions: this.props.providerOptions || {}
  };

  public componentDidUpdate(
    prevProps: IWeb3ConnectProps,
    prevState: IWeb3ConnectState
  ) {
    if (prevState.show && !this.state.show && prevState.uri) {
      this.setState({ uri: "" });
    }
    if (this.lightboxRef) {
      const lightboxRect = this.lightboxRef.getBoundingClientRect();
      const lightboxOffset = lightboxRect.top > 0 ? lightboxRect.top : 0;

      if (
        lightboxOffset !== INITIAL_STATE.lightboxOffset &&
        lightboxOffset !== this.state.lightboxOffset
      ) {
        this.setState({ lightboxOffset });
      }
    }

    if (this.mainModalCard) {
      const mainModalCardRect = this.mainModalCard.getBoundingClientRect();
      const qrcodeSize = mainModalCardRect.height;

      if (
        qrcodeSize !== INITIAL_STATE.qrcodeSize &&
        qrcodeSize !== this.state.qrcodeSize
      ) {
        this.setState({ qrcodeSize });
      }
    }
  }

  public toggleModal = async () => {
    const d = typeof window !== "undefined" ? document : "";
    const body = d ? d.body || d.getElementsByTagName("body")[0] : "";
    if (body) {
      if (this.state.show) {
        body.style.position = "";
      } else {
        body.style.position = "fixed";
      }
    }
    await this.setState({ show: !this.state.show });
  };

  public onConnect = async (provider: any) => {
    await this.toggleModal();
    this.props.onConnect(provider);
  };

  public onClose = async () => {
    await this.toggleModal();
    this.props.onClose();
  };

  public onConnectToInjectedProvider = async () => {
    let provider = null;
    if (window.ethereum) {
      provider = window.ethereum;
      try {
        await window.ethereum.enable();
      } catch (error) {
        console.error("User Rejected");
        return;
      }
    } else if (window.web3) {
      provider = window.web3.currentProvider;
    } else {
      console.error("No Web3 Provider found");
      return;
    }
    this.onConnect(provider);
  };

  public onConnectToFortmaticProvider = async () => {
    const { providerOptions } = this.state;
    if (
      providerOptions &&
      providerOptions.fortmatic &&
      providerOptions.fortmatic.key
    ) {
      try {
        const key = providerOptions.fortmatic.key;
        const fm = new Fortmatic(key);
        const provider = await fm.getProvider();
        await fm.user.login();
        const isLoggedIn = await fm.user.isLoggedIn();
        if (isLoggedIn) {
          this.onConnect(provider);
        }
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      console.error("Missing Fortmatic key");
      return;
    }
  };

  public onConnectToPortisProvider = async () => {
    const { providerOptions } = this.state;
    if (
      providerOptions &&
      providerOptions.portis &&
      providerOptions.portis.id
    ) {
      try {
        const id = providerOptions.portis.id;
        const network = providerOptions.portis.network || "mainnet";
        const portis = new Portis(id, network);
        portis.showPortis();
        portis.onLogin(() => {
          this.onConnect(portis.provider);
        });
      } catch (error) {
        console.error(error);
        return;
      }
    } else {
      console.error("Missing Portis Id");
      return;
    }
  };

  public onConnectToWalletConnectProvider = async () => {
    if (this.state.uri) {
      await this.setState({ uri: "" });
      return;
    }
    const bridge = "https://bridge.walletconnect.org";
    const provider = new WalletConnectProvider({ bridge, qrcode: false });

    if (!provider._walletConnector.connected) {
      await provider._walletConnector.createSession();

      const uri = provider._walletConnector.uri;

      await this.setState({ uri });

      provider._walletConnector.on("connect", async (error: Error) => {
        if (error) {
          throw error;
        }
        await this.setState({ uri: "" });

        this.onConnect(provider);
      });
    } else {
      this.onConnect(provider);
    }
  };

  public render = () => {
    const {
      uri,
      show,
      mobile,
      injectedProvider,
      lightboxOffset,
      qrcodeSize,
      providerOptions
    } = this.state;
    const { lightboxOpacity } = this.props;
    const displayFortmatic =
      providerOptions &&
      providerOptions.fortmatic &&
      providerOptions.fortmatic.key;

    const displayPortis =
      providerOptions && providerOptions.portis && providerOptions.portis.id;

    const hideMainModalCard = !show || (!!uri && window.innerWidth <= 860);
    return (
      <React.Fragment>
        <Button onClick={this.toggleModal}>{"Connect to Wallet"}</Button>

        <SLightbox
          offset={lightboxOffset}
          opacity={lightboxOpacity}
          ref={c => (this.lightboxRef = c)}
          show={show}
        >
          <SModalContainer>
            <SHitbox onClick={this.onClose} />
            {!hideMainModalCard && (
              <SModalCard ref={c => (this.mainModalCard = c)}>
                {!!injectedProvider && (
                  <Provider
                    name={this.state.injectedProvider}
                    onClick={this.onConnectToInjectedProvider}
                  />
                )}
                {!(injectedProvider && mobile) && (
                  <React.Fragment>
                    <Provider
                      name={"WalletConnect"}
                      onClick={this.onConnectToWalletConnectProvider}
                    />
                    {displayPortis && (
                      <Provider
                        name={"Portis"}
                        onClick={this.onConnectToPortisProvider}
                      />
                    )}

                    {displayFortmatic && (
                      <Provider
                        name={"Fortmatic"}
                        onClick={this.onConnectToFortmaticProvider}
                      />
                    )}
                  </React.Fragment>
                )}
              </SModalCard>
            )}
            {uri && (
              <SModalCard maxWidth={hideMainModalCard ? 500 : qrcodeSize}>
                {hideMainModalCard && (
                  <SQRCodeDescription>{`Scan with your Mobile Wallet to connect`}</SQRCodeDescription>
                )}
                <SQRCodeWrapper size={hideMainModalCard ? 500 : qrcodeSize}>
                  <SQRCodeDisplay data={uri} />
                </SQRCodeWrapper>
              </SModalCard>
            )}
          </SModalContainer>
        </SLightbox>
      </React.Fragment>
    );
  };
}

export default Web3Connect;
