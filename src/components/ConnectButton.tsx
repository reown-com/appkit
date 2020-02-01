import * as React from "react";
import Button from "./Button";
import Core from "../core";
import { CONNECT_BUTTON_CLASSNAME } from "../helpers/constants";

class ConnectButton extends React.Component<any, any> {
  public core: Core;

  constructor(props: any) {
    super(props);
    this.core = new Core({
      lightboxOpacity: props.lightboxOpacity,
      cacheProvider: props.cacheProvider,
      providerOptions: props.providerOptions,
      network: props.network
    });
    this.core.on("connect", props.onConnect);
    this.core.on("close", props.onClose);
    this.core.on("error", props.onError);
  }

  public render = () => {
    return (
      <Button
        className={CONNECT_BUTTON_CLASSNAME}
        onClick={this.core.toggleModal}
      >
        {this.props.label || "Connect"}
      </Button>
    );
  };
}

export default ConnectButton;
