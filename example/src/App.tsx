import * as React from "react";
import styled from "styled-components";
import Web3Connect from "web3connect";
import Column from "./components/Column";
import Wrapper from "./components/Wrapper";
import Header from "./components/Header";

const SLayout = styled.div`
  position: relative;
  width: 100%;
  min-height: 100vh;
  text-align: center;
`;

const SContent = styled(Wrapper)`
  width: 100%;
  height: 100%;
  padding: 0 16px;
`;

const SLanding = styled(Column)`
  height: 600px;
`;

interface IAppState {
  fetching: boolean;
  address: string;
  connected: boolean;
  chainId: number;
}

const INITIAL_STATE: IAppState = {
  fetching: false,
  address: "",
  connected: false,
  chainId: 1
};

class App extends React.Component<any, any> {
  public state: IAppState = {
    ...INITIAL_STATE
  };

  public render = () => {
    const { address, connected, chainId } = this.state;
    return (
      <SLayout>
        <Column maxWidth={1000} spanHeight>
          <Header connected={connected} address={address} chainId={chainId} />
          <SContent>
            <SLanding center>
              <h3>{`Try out Web3Connect`}</h3>
              <Web3Connect
                onConnect={(provider: any) => {
                  console.log("[Web3Connect] onConnect", provider); // tslint:disable-line
                }}
                onClose={() => {
                  console.log("[Web3Connect] onClose"); // tslint:disable-line
                }}
              />
            </SLanding>
          </SContent>
        </Column>
      </SLayout>
    );
  };
}

export default App;
