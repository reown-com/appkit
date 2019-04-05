import * as React from "react";
import styled from "styled-components";
import * as PropTypes from "prop-types";
import Banner from "./Banner";
import { ellipseAddress, getChainData } from "../helpers/utilities";
import { transitions } from "../styles";

const SHeader = styled.div`
  margin-top: -1px;
  margin-bottom: 1px;
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
`;

const SActiveAccount = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  font-weight: 500;
`;

const SActiveChain = styled(SActiveAccount)`
  flex-direction: column;
  text-align: left;
  align-items: flex-start;
  & p {
    font-size: 0.8em;
    margin: 0;
    padding: 0;
  }
  & p:nth-child(2) {
    font-weight: bold;
  }
`;

interface IHeaderStyle {
  connected: boolean;
}

const SAddress = styled.p<IHeaderStyle>`
  transition: ${transitions.base};
  font-weight: bold;
  margin: ${({ connected }) => (connected ? "-2px auto 0.7em" : "0")};
`;

interface IHeaderProps {
  connected: boolean;
  address: string;
  chainId: number;
}

const Header = (props: IHeaderProps) => {
  const { connected, address, chainId } = props;
  const activeChain = chainId ? getChainData(chainId).name : null;
  return (
    <SHeader {...props}>
      {connected && activeChain ? (
        <SActiveChain>
          <p>{`Connected to`}</p>
          <p>{activeChain}</p>
        </SActiveChain>
      ) : (
        <Banner />
      )}
      {address && (
        <SActiveAccount>
          <SAddress connected={connected}>{ellipseAddress(address)}</SAddress>
        </SActiveAccount>
      )}
    </SHeader>
  );
};

Header.propTypes = {
  address: PropTypes.string
};

export default Header;
