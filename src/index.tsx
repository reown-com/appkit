import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
// @ts-ignore
import WalletConnectLogo from "./assets/walletconnect-circle.svg";
// @ts-ignore
import Web3DefaultLogo from "./assets/web3-default.svg";
import Button from "./Button";
import {
  getWeb3ProviderInfo,
  checkInjectedWeb3Provider,
  isMobile
} from "./utils";

interface IWalletConnectStyleProps {
  show: boolean;
  offset: number;
  opacity?: number;
}

const SLightbox = styled.div<IWalletConnectStyleProps>`
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

const SModalCard = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  background-color: rgb(255, 255, 255);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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

const SSeparator = styled.div`
  width: 100%;
  border-bottom: 2px solid rgba(195, 195, 195, 0.14);
`;

interface IWalletConnectProps {
  onClose: any;
  onConnect: any;
  lightboxOpacity?: number;
}

interface IWalletConnectState {
  show: boolean;
  injectedWeb3Provider: any;
}

const INITIAL_STATE: IWalletConnectState = {
  show: false,
  injectedWeb3Provider: null
};

class WalletConnect extends React.Component<
  IWalletConnectProps,
  IWalletConnectState
> {
  public static propTypes = {
    onConnect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    lightboxOpacity: PropTypes.number
  };

  public lightboxRef?: HTMLDivElement | null;

  public state: IWalletConnectState = {
    ...INITIAL_STATE,
    injectedWeb3Provider: checkInjectedWeb3Provider()
  };

  public toggleModal = async () => {
    console.log("[WalletConnect] toggleModal"); // tslint:disable-line
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

  public onConnect = () => this.props.onConnect(null);

  public onClose = async () => {
    await this.toggleModal();
    this.props.onClose();
  };

  public renderInjectedWeb3Provider = () => {
    let result = null;
    const { injectedWeb3Provider } = this.state;
    if (injectedWeb3Provider) {
      const web3ProviderInfo = getWeb3ProviderInfo(injectedWeb3Provider);
      if (web3ProviderInfo) {
        result = (
          <SWallet>
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
    const { show, injectedWeb3Provider } = this.state;
    const { lightboxOpacity } = this.props;
    let lightboxOffset = 0;
    if (this.lightboxRef) {
      const lightboxRect = this.lightboxRef.getBoundingClientRect();
      lightboxOffset = lightboxRect.top > 0 ? lightboxRect.top : 0;
    }
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
            <SModalCard>
              {!!injectedWeb3Provider && (
                <React.Fragment>
                  {this.renderInjectedWeb3Provider()}
                  <SSeparator />
                </React.Fragment>
              )}
              {!(injectedWeb3Provider && isMobile()) && (
                <SWallet>
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
          </SModalContainer>
        </SLightbox>
      </React.Fragment>
    );
  };
}

export default WalletConnect;
