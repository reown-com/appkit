import * as React from "react";
import * as PropTypes from "prop-types";
import styled from "styled-components";
import { GrClose } from "react-icons/gr";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
// @ts-ignore
import FlurryIconOnly from "../assets/flurry_icon_only.png";

import { Provider } from "./Provider";
import {
  MODAL_LIGHTBOX_CLASSNAME,
  MODAL_CONTAINER_CLASSNAME,
  MODAL_HITBOX_CLASSNAME,
  MODAL_CARD_CLASSNAME
} from "../constants";
import { SimpleFunction, IProviderUserOptions, ThemeColors } from "../helpers";

interface SpacerProps {
  axis?: "horizontal" | "vertical";
  size: number;
}

function getHeight({ axis, size }: SpacerProps) {
  return axis === "horizontal" ? 1 : size;
}

function getWidth({ axis, size }: SpacerProps) {
  return axis === "vertical" ? 1 : size;
}

const Spacer = styled.span`
  display: block;
  width: ${getWidth}px;
  min-width: ${getWidth}px;
  height: ${getHeight}px;
  min-height: ${getHeight}px;
`;

declare global {
  // tslint:disable-next-line
  interface Window {
    ethereum: any;
    web3: any;
    updateWeb3Modal: any;
    binanceSmartChain: any;
  }
}

interface ILightboxStyleProps {
  show: boolean;
  offset: number;
  opacity?: number;
}

const SLightbox = styled.div<ILightboxStyleProps>`
  transition: opacity 0.1s ease-in-out;
  text-align: center;
  position: fixed;
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

interface IModalContainerStyleProps {
  show: boolean;
}

const SModalContainer = styled.div<IModalContainerStyleProps>`
  position: relative;
  width: 100%;
  height: 100%;
  padding: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  pointer-events: ${({ show }) => (show ? "auto" : "none")};
`;

const SHitbox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

const SMessage = styled.p`
  font-size: 10px;
  padding: 0px 1.5rem;
  color: #222dc3;
  margin: 1rem 0 0 0;
  a {
    text-decoration: underline;
    font-weight: bold;
  }
`;

interface IModalCardStyleProps {
  show: boolean;
  themeColors: ThemeColors;
  maxWidth?: number;
}

const SModalCard = styled.div<IModalCardStyleProps>`
  position: relative;
  opacity: ${({ show }) => (show ? 1 : 0)};
  visibility: ${({ show }) => (show ? "visible" : "hidden")};
  pointer-events: ${({ show }) => (show ? "auto" : "none")};

  display: flex;
  flex-direction: column;
  align-items: center;
  width: 380px;
  border-radius: 15px;
  background-color: white;
  margin: 3rem auto;
  padding: 1.2rem 1rem;
  max-height: 100%;
  overflow: auto;
`;

const SCloseBtn = styled(GrClose)`
  align-self: flex-end;
  opacity: 0.3;
  margin-right: 0.5rem;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
`;

const SLogo = styled.img`
  max-width: 70px;
  height: auto;
`;

const STitle = styled.h5`
  font-weight: normal;
  font-size: 0.9rem;
  text-align: center;
`;

const SProvidersContainer = styled.div`
  width: 100%;
`;

const SShowMoreBtn = styled.button`
  cursor: pointer;
  outline: none;
  border: none;
  background-color: transparent;
  opacity: 0.6;
  & svg {
    vertical-align: bottom;
  }
`;

interface IModalProps {
  themeColors: ThemeColors;
  userOptions: IProviderUserOptions[];
  onClose: SimpleFunction;
  resetState: SimpleFunction;
  lightboxOpacity: number;
}

interface IModalState {
  show: boolean;
  lightboxOffset: number;
  showAllProviders: boolean;
  showMessage: boolean;
  messageProviderId: string;
  messageProviderUrl: string;
}

const INITIAL_STATE: IModalState = {
  show: false,
  lightboxOffset: 0,
  showAllProviders: false,
  showMessage: false,
  messageProviderId: "",
  messageProviderUrl: ""
};

const MAX_PROVIDER_COUNT = 3;

export class Modal extends React.Component<IModalProps, IModalState> {
  constructor(props: IModalProps) {
    super(props);
    window.updateWeb3Modal = async (state: IModalState) => {
      this.setState(state);
    };
  }
  public static propTypes = {
    userOptions: PropTypes.object.isRequired,
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
    if (prevState.show && !this.state.show) {
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
  }

  public render = () => {
    const {
      show,
      lightboxOffset,
      showMessage,
      messageProviderId,
      messageProviderUrl
    } = this.state;

    const { onClose, lightboxOpacity, userOptions, themeColors } = this.props;

    return (
      <SLightbox
        className={MODAL_LIGHTBOX_CLASSNAME}
        offset={lightboxOffset}
        opacity={lightboxOpacity}
        ref={c => (this.lightboxRef = c)}
        show={show}
      >
        <SModalContainer className={MODAL_CONTAINER_CLASSNAME} show={show}>
          <SHitbox className={MODAL_HITBOX_CLASSNAME} onClick={onClose} />
          <SModalCard
            className={MODAL_CARD_CLASSNAME}
            show={show}
            themeColors={themeColors}
            maxWidth={userOptions.length < 3 ? 500 : 800}
            ref={c => (this.mainModalCard = c)}
          >
            <SCloseBtn onClick={onClose} />
            <Spacer axis="vertical" size={20} />
            <SLogo src={FlurryIconOnly} alt="Flurry logo" />
            <Spacer axis="vertical" size={15} />
            <STitle>
              <b>Connect a wallet</b>
              <br /> and start using Flurry
            </STitle>
            {showMessage && messageProviderId && messageProviderUrl && (
              <SMessage>
                <span>{`Seems like you do not have a ${messageProviderId} wallet.`}</span><br />
                <a
                  href={messageProviderUrl}
                  target="_blank"
                >{`Install ${messageProviderId}`}</a>
                <span>{" and try again!"}</span>
              </SMessage>
            )}
            <Spacer axis="vertical" size={20} />
            <SProvidersContainer>
              {userOptions.map((provider, index) => {
                if (
                  !this.state.showAllProviders &&
                  index > MAX_PROVIDER_COUNT - 1
                ) {
                  return null;
                }

                return !!provider ? (
                  <>
                    <Provider
                      name={provider.name}
                      logo={provider.logo}
                      onClick={provider.onClick}
                    />
                    <Spacer axis="vertical" size={20} />
                  </>
                ) : null;
              })}
            </SProvidersContainer>
            {userOptions.length > MAX_PROVIDER_COUNT && (
              <SShowMoreBtn
                onClick={() =>
                  this.setState({
                    showAllProviders: !this.state.showAllProviders
                  })
                }
              >
                {!this.state.showAllProviders ? (
                  <>
                    Show more wallets <FaChevronDown size={12} />
                  </>
                ) : (
                  <>
                    Show less wallets <FaChevronUp size={12} />
                  </>
                )}
              </SShowMoreBtn>
            )}
            <Spacer axis="vertical" size={20} />
          </SModalCard>
        </SModalContainer>
      </SLightbox>
    );
  };
}
