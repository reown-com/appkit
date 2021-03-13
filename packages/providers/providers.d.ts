import { IProviders } from "@web3modal/types";

declare module "providers" {
  const providers: IProviders;
  export = providers;
}
