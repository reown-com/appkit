import * as React from "react";
import Button from "./components/Button";
import Core from "./core";

export const Web3ConnectCore = Core;

class Web3Connect extends React.Component<any, any> {
  public core: Core;

  constructor(props: any) {
    super(props);
    this.core = new Core(props);
  }

  public render = () => {
    return (
      <Button onClick={this.core.toggleModal}>{"Connect to Wallet"}</Button>
    );
  };
}

export default Web3Connect;
