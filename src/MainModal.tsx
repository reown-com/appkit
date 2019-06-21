import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import Provider from "./components/Provider";
import QRCodeDisplay from "./components/QRCodeDisplay";
import { SDescription } from "./components/common";
import { isMobile } from "./utils";
import { NoopFunction, IProviderOptions } from "./types";

declare global {
  // tslint:disable-next-line
  interface Window {
    ethereum: any;
    web3: any;
    updateWeb3ConnectMainModal: any;
  }
}

interface IWeb3ConnectMainModalStyleProps {
  show: boolean;
  offset: number;
  opacity?: number;
}

const SLightbox = styled.div<IWeb3ConnectMainModalStyleProps>`
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

interface IWeb3ConnectMainModalProps {
  show: boolean;
  uri: string;
  onClose: NoopFunction;
  resetState: NoopFunction;
  injectedProvider: string | null;
  lightboxOpacity: number;
  providerOptions: IProviderOptions;
  connectToInjected: NoopFunction;
  connectToFortmatic: NoopFunction;
  connectToPortis: NoopFunction;
  connectToWalletConnect: NoopFunction;
}

interface IWeb3ConnectMainModalState {
  show: boolean;
  uri: string;
  mobile: boolean;
  lightboxOffset: number;
  qrcodeSize: number;
}

const INITIAL_STATE: IWeb3ConnectMainModalState = {
  show: false,
  uri: "",
  mobile: isMobile(),
  lightboxOffset: 0,
  qrcodeSize: 382
};

class Web3ConnectMainModal extends React.Component<
  IWeb3ConnectMainModalProps,
  IWeb3ConnectMainModalState
> {
  constructor(props: IWeb3ConnectMainModalProps) {
    super(props);
    window.updateWeb3ConnectMainModal = (state: IWeb3ConnectMainModalState) =>
      this.setState(state);
  }
  public static propTypes = {
    show: PropTypes.bool.isRequired,
    uri: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
    resetState: PropTypes.func.isRequired,
    injectedProvider: PropTypes.string.isRequired,
    lightboxOpacity: PropTypes.number.isRequired,
    providerOptions: PropTypes.object.isRequired,
    connectToInjected: PropTypes.func.isRequired,
    connectToFortmatic: PropTypes.func.isRequired,
    connectToPortis: PropTypes.func.isRequired,
    connectToWalletConnect: PropTypes.func.isRequired
  };

  public lightboxRef?: HTMLDivElement | null;
  public mainModalCard?: HTMLDivElement | null;

  public state: IWeb3ConnectMainModalState = {
    ...INITIAL_STATE,
    show: this.props.show || INITIAL_STATE.show,
    uri: this.props.uri || INITIAL_STATE.uri
  };

  public componentDidUpdate(
    prevProps: IWeb3ConnectMainModalProps,
    prevState: IWeb3ConnectMainModalState
  ) {
    if (prevState.show && !this.state.show && prevState.uri) {
      this.props.resetState();
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

  public render = () => {
    const { show, uri, mobile, lightboxOffset, qrcodeSize } = this.state;

    const {
      onClose,
      injectedProvider,
      lightboxOpacity,
      providerOptions,
      connectToInjected,
      connectToFortmatic,
      connectToPortis,
      connectToWalletConnect
    } = this.props;

    const displayFortmatic =
      providerOptions &&
      providerOptions.fortmatic &&
      providerOptions.fortmatic.key;

    const displayPortis =
      providerOptions && providerOptions.portis && providerOptions.portis.id;

    const hideMainModalCard = !show || (!!uri && window.innerWidth <= 860);
    return (
      <SLightbox
        offset={lightboxOffset}
        opacity={lightboxOpacity}
        ref={c => (this.lightboxRef = c)}
        show={show}
      >
        <SModalContainer>
          <SHitbox onClick={onClose} />
          {!hideMainModalCard && (
            <SModalCard ref={c => (this.mainModalCard = c)}>
              {!!injectedProvider && (
                <Provider name={injectedProvider} onClick={connectToInjected} />
              )}
              {!(injectedProvider && mobile) && (
                <React.Fragment>
                  <Provider
                    name={"WalletConnect"}
                    onClick={connectToWalletConnect}
                  />
                  {displayPortis && (
                    <Provider name={"Portis"} onClick={connectToPortis} />
                  )}

                  {displayFortmatic && (
                    <Provider name={"Fortmatic"} onClick={connectToFortmatic} />
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
    );
  };
}

export default Web3ConnectMainModal;
