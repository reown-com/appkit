import * as React from "react";
import Button from "./components/Button";
import Core from "./core";
import connectors from "./connectors";

class Web3ConnectButton extends React.Component<any, any> {
  public core: Core;

  constructor(props: any) {
    super(props);
    this.core = new Core({
      lightboxOpacity: props.lightboxOpacity,
      providerOptions: props.providerOptions
    });
    this.core.on("connect", props.onConnect);
    this.core.on("close", props.onClose);
    this.core.on("error", props.onError);
  }

  public render = () => {
    return (
      <Button onClick={this.core.toggleModal}>{"Connect to Wallet"}</Button>
    );
  };
}

export default {
  Button: Web3ConnectButton,
  Core,
  ...connectors
};
