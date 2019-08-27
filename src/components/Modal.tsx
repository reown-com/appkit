import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import Provider from "./Provider";
import QRCodeDisplay from "./QRCodeDisplay";
import { SDescription } from "./common";
import {
  getProviderInfoByName,
  formatProviderDescription
} from "../helpers/utils";
import { SimpleFunction, IProviderCallback } from "../helpers/types";

declare global {
  // tslint:disable-next-line
  interface Window {
    ethereum: any;
    web3: any;
    updateWeb3ConnectModal: any;
  }
}

interface IModalStyleProps {
  show: boolean;
  offset: number;
  opacity?: number;
}

const SLightbox = styled.div<IModalStyleProps>`
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

  & * {
    box-sizing: border-box !important;
  }
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
  min-width: fit-content;

  @media screen and (max-width: 768px) {
    max-width: ${({ maxWidth }) => (maxWidth ? `${maxWidth}px` : "500px")};
  }
`;

const SQRCodeModalCard = styled(SModalCard)`
  display: flex;
  justify-content: center;
`;

const SQRCodeDescription = styled(SDescription)`
  margin-top: 30px;
`;

interface IModalProps {
  providers: IProviderCallback[];
  onClose: SimpleFunction;
  resetState: SimpleFunction;
  lightboxOpacity: number;
}

interface IModalState {
  show: boolean;
  uri: string;
  lightboxOffset: number;
  qrcodeSize: number;
}

const INITIAL_STATE: IModalState = {
  show: false,
  uri: "",
  lightboxOffset: 0,
  qrcodeSize: 382
};

class Modal extends React.Component<IModalProps, IModalState> {
  constructor(props: IModalProps) {
    super(props);
    window.updateWeb3ConnectModal = async (state: IModalState) =>
      this.setState(state);
  }
  public static propTypes = {
    providers: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    resetState: PropTypes.func.isRequired,
    lightboxOpacity: PropTypes.number.isRequired
  };

  public lightboxRef?: HTMLDivElement | null;
  public mainModalCard?: HTMLDivElement | null;

  public state: IModalState = {
    ...INITIAL_STATE
  };

  public componentDidUpdate(prevProps: IModalProps, prevState: IModalState) {
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
    const { show, uri, lightboxOffset, qrcodeSize } = this.state;

    const { onClose, lightboxOpacity, providers } = this.props;

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
            <SModalCard
              maxWidth={providers.length < 3 ? 500 : 800}
              ref={c => (this.mainModalCard = c)}
            >
              {providers.map(provider =>
                provider ? (
                  <Provider name={provider.name} onClick={provider.onClick} />
                ) : null
              )}
            </SModalCard>
          )}
          {uri && (
            <SQRCodeModalCard maxWidth={hideMainModalCard ? 500 : qrcodeSize}>
              {hideMainModalCard && (
                <SQRCodeDescription>
                  {formatProviderDescription(
                    getProviderInfoByName("WalletConnect")
                  )}
                </SQRCodeDescription>
              )}
              <SQRCodeWrapper size={hideMainModalCard ? 500 : qrcodeSize}>
                <SQRCodeDisplay data={uri} />
              </SQRCodeWrapper>
            </SQRCodeModalCard>
          )}
        </SModalContainer>
      </SLightbox>
    );
  };
}

export default Modal;
