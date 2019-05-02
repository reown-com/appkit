import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
// @ts-ignore
import WalletConnectProvider from "@walletconnect/web3-provider";
// @ts-ignore
import WalletConnectLogo from "./assets/walletconnect-circle.svg";
// @ts-ignore
import Web3DefaultLogo from "./assets/web3-default.svg";
import Button from "./components/Button";
import QRCodeDisplay from "./components/QRCodeDisplay";
import {
  getWeb3ProviderInfo,
  checkInjectedWeb3Provider,
  isMobile
} from "./utils";

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
  max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "500px")};
  background-color: rgb(255, 255, 255);
  border-radius: 12px;
  margin: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: ${({ hide }) => (!hide ? 1 : 0)};
  visibility: ${({ hide }) => (!hide ? "visible" : "hidden")};
  pointer-events: ${({ hide }) => (!hide ? "auto" : "none")};
`;

const SWalletContainer = styled.div`
  transition: background-color 0.2s ease-in-out;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: rgb(255, 255, 255);
  border-radius: 12px;
  padding: 24px 16px;
`;

const SWallet = styled.div`
  width: 100%;
  padding: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  cursor: pointer;
  @media (hover: hover) {
    &:hover ${SWalletContainer} {
      background-color: rgba(195, 195, 195, 0.14);
    }
  }
`;

interface IWalletIconStyleProps {
  isMetaMask?: boolean;
}

const SWalletIcon = styled.div<IWalletIconStyleProps>`
  width: 45px;
  height: 45px;
  display: flex;
  border-radius: 50%;
  overflow: ${({ isMetaMask }) => (isMetaMask ? "visible" : "hidden")};
  box-shadow: ${({ isMetaMask }) =>
    isMetaMask
      ? "none"
      : "0 4px 6px 0 rgba(50, 50, 93, 0.11), 0 1px 3px 0 rgba(0, 0, 0, 0.08), inset 0 0 1px 0 rgba(0, 0, 0, 0.06)"};
  justify-content: center;
  align-items: center;
  & img {
    width: 100%;
  }
`;

const SWalletTitle = styled.div`
  width: 100%;
  font-size: 24px;
  font-weight: 700;
  margin-top: 0.5em;
`;

const SWalletDescription = styled.div`
  width: 100%;
  font-size: 18px;
  margin: 0.333em 0;
  color: rgb(169, 169, 188);
`;

const SQRCodeDescription = styled(SWalletDescription)`
  margin-top: 30px;
`;

const SSeparator = styled.div`
  width: 100%;
  border-bottom: 2px solid rgba(195, 195, 195, 0.14);
`;

interface IWeb3ConnectProps {
  onClose: any;
  onConnect: any;
  lightboxOpacity?: number;
}

interface IWeb3ConnectState {
  show: boolean;
  uri: string;
  mobile: boolean;
  injectedWeb3Provider: any;
  lightboxOffset: number;
  qrcodeSize: number;
}

const INITIAL_STATE: IWeb3ConnectState = {
  show: false,
  uri: "",
  mobile: isMobile(),
  injectedWeb3Provider: null,
  lightboxOffset: 0,
  qrcodeSize: 382
};

class Web3Connect extends React.Component<
  IWeb3ConnectProps,
  IWeb3ConnectState
> {
  public static propTypes = {
    onConnect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    lightboxOpacity: PropTypes.number
  };

  public lightboxRef?: HTMLDivElement | null;
  public mainModalCard?: HTMLDivElement | null;

  public state: IWeb3ConnectState = {
    ...INITIAL_STATE,
    injectedWeb3Provider: checkInjectedWeb3Provider()
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

  public onConnectToInjectedWeb3Provider = async () => {
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

  public renderInjectedWeb3Provider = () => {
    let result = null;
    const { injectedWeb3Provider } = this.state;
    if (injectedWeb3Provider) {
      const web3ProviderInfo = getWeb3ProviderInfo(injectedWeb3Provider);
      if (web3ProviderInfo) {
        result = (
          <SWallet onClick={this.onConnectToInjectedWeb3Provider}>
            <SWalletContainer>
              <SWalletIcon isMetaMask={web3ProviderInfo.check === "isMetaMask"}>
                <img
                  src={web3ProviderInfo.logo || Web3DefaultLogo}
                  alt={web3ProviderInfo.name}
                />
              </SWalletIcon>
              <SWalletTitle>{web3ProviderInfo.name}</SWalletTitle>
              <SWalletDescription>{`Connect to your ${
                web3ProviderInfo.name
              } Wallet`}</SWalletDescription>
            </SWalletContainer>
          </SWallet>
        );
      }
    }

    return result;
  };

  public render = () => {
    const {
      uri,
      show,
      mobile,
      injectedWeb3Provider,
      lightboxOffset,
      qrcodeSize
    } = this.state;
    const { lightboxOpacity } = this.props;
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
                {!!injectedWeb3Provider && (
                  <React.Fragment>
                    {this.renderInjectedWeb3Provider()}
                    <SSeparator />
                  </React.Fragment>
                )}
                {!(injectedWeb3Provider && mobile) && (
                  <SWallet onClick={this.onConnectToWalletConnectProvider}>
                    <SWalletContainer>
                      <SWalletIcon>
                        <img src={WalletConnectLogo} alt="WalletConnect" />
                      </SWalletIcon>
                      <SWalletTitle>{`WalletConnect`}</SWalletTitle>
                      <SWalletDescription>{`Scan with your Mobile Wallet to connect`}</SWalletDescription>
                    </SWalletContainer>
                  </SWallet>
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
