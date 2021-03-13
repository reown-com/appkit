import { ChainData } from "@web3modal/types";
import { CHAIN_DATA_LIST } from "@web3modal/constants";

export function filterMatches<T>(
  array: T[],
  condition: (x: T) => boolean,
  fallback: T | undefined
): T | undefined {
  let result = fallback;
  const matches = array.filter(condition);

  if (!!matches && matches.length) {
    result = matches[0];
  }

  return result;
}

export function getChainId(network: string): number {
  const chains: ChainData[] = Object.values(CHAIN_DATA_LIST);
  const match = filterMatches<ChainData>(
    chains,
    x => x.network === network,
    undefined
  );
  if (!match) {
    throw new Error(`No chainId found match ${network}`);
  }
  return match.chainId;
}
