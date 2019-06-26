import * as React from "react";
import Button from "./components/Button";
import Core from "./core";
import allConnectors from "./connectors";

export const Web3Connect = Core;

export const connectors = allConnectors;

class Web3ConnectReact extends React.Component<any, any> {
  public web3Connect: Core;

  constructor(props: any) {
    super(props);
    this.web3Connect = new Core({
      onConnect: props.onConnect,
      onClose: props.onClose,
      onError: props.onError,
      lightboxOpacity: props.lightboxOpacity,
      providerOptions: props.providerOptions
    });
  }

  public render = () => {
    return (
      <Button onClick={this.web3Connect.toggleModal}>
        {"Connect to Wallet"}
      </Button>
    );
  };
}

export default Web3ConnectReact;
