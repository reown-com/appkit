import ConnectButton from "./components/ConnectButton";
import Core from "./core";
import connectors from "./core/connectors";
import * as utils from "./helpers/utils";
import * as types from "./helpers/types";

export default {
  Button: ConnectButton,
  Core,
  ...connectors,
  ...utils,
  ...types
};
