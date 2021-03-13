import { IProviders } from "@web3modal/types";

declare module "injected" {
  const injected: IProviders;
  export = injected;
}
