import { IConnectorsMap } from "../../helpers";

import injected from "./injected";
import walletconnect from "./walletconnect";
import portis from "./portis";
import fortmatic from "./fortmatic";
import torus from "./torus";
import squarelink from "./squarelink";
import arkane from "./arkane";
import authereum from "./authereum";
import burnerconnect from "./burnerconnect";

const connectors: IConnectorsMap = {
  injected,
  walletconnect,
  portis,
  torus,
  fortmatic,
  squarelink,
  arkane,
  authereum,
  burnerconnect
};

export default connectors;
