import * as env from "detect-browser";
import {
  IProviderInfo,
  IInjectedProvidersMap,
  RequiredOption
} from "@web3modal/types";

import { providers } from "./providers";
import { injected } from "./injected";

declare global {
  interface Window {
    ethereum: any;
    web3: any;
    updateWeb3Modal: any;
  }
}

export function checkInjectedProviders(): IInjectedProvidersMap {
  const result = {
    injectedAvailable: !!window.ethereum || !!window.web3
  };
  if (result.injectedAvailable) {
    let fallbackProvider = true;
    Object.values(injected).forEach(provider => {
      const isAvailable = verifyInjectedProvider(provider.check);
      if (isAvailable) {
        result[provider.check] = true;
        fallbackProvider = false;
      }
    });

    const browser = env.detect();

    if (browser && browser.name === "opera") {
      result[injected.OPERA.check] = true;
      fallbackProvider = false;
    }

    if (fallbackProvider) {
      result[injected.FALLBACK.check] = true;
    }
  }

  return result;
}

export function verifyInjectedProvider(check: string): boolean {
  return window.ethereum
    ? window.ethereum[check]
    : window.web3 &&
        window.web3.currentProvider &&
        window.web3.currentProvider[check];
}

export function getInjectedProvider(): IProviderInfo | null {
  let result: any = null;

  const injectedProviders = checkInjectedProviders();

  if (injectedProviders.injectedAvailable) {
    delete injectedProviders.injectedAvailable;
    const checks = Object.keys(injectedProviders);
    result = getProviderInfoFromChecksArray(checks);
  }
  return result;
}

export function getInjectedProviderName(): string | null {
  const injectedProvider = getInjectedProvider();
  return injectedProvider ? injectedProvider.name : null;
}

export function getProviderInfo(provider: any): IProviderInfo {
  if (!provider) return injected.FALLBACK;
  const checks = Object.values(providers)
    .filter(x => provider[x.check])
    .map(x => x.check);
  return getProviderInfoFromChecksArray(checks);
}

export function getProviderInfoFromChecksArray(
  checks: string[]
): IProviderInfo {
  const check = filterProviderChecks(checks);
  return filterProviders("check", check);
}

export function getProviderInfoByName(name: string | null): IProviderInfo {
  return filterProviders("name", name);
}

export function getProviderInfoById(id: string | null): IProviderInfo {
  return filterProviders("id", id);
}

export function getProviderInfoByCheck(check: string | null): IProviderInfo {
  return filterProviders("check", check);
}

export function getProviderDescription(
  providerInfo: Partial<IProviderInfo>
): string {
  if (providerInfo.description) {
    return providerInfo.description;
  }
  let description = "";
  switch (providerInfo.type) {
    case "injected":
      description = `Connect to your ${providerInfo.name} Wallet`;
      break;
    case "web":
      description = `Connect with your ${providerInfo.name} account`;
      break;
    case "qrcode":
      description = `Scan with ${providerInfo.name} to connect`;
      break;
    case "hardware":
      description = `Connect to your ${providerInfo.name} Hardware Wallet`;
      break;
    default:
      break;
  }
  return description;
}

export function filterMatches<T>(
  array: T[],
  condition: (x: T) => boolean,
  fallback: T | undefined
): T | undefined {
  const match = array.find(condition);
  return match ? match : fallback;
}

export function filterProviders(
  param: string,
  value: string | null
): IProviderInfo {
  if (!value) return injected.FALLBACK;
  const match = filterMatches<IProviderInfo>(
    Object.values(providers),
    x => x[param] === value,
    injected.FALLBACK
  );
  return match || injected.FALLBACK;
}

export function filterProviderChecks(checks: string[]): string {
  if (!!checks && checks.length) {
    if (checks.length > 1) {
      if (
        checks[0] === injected.METAMASK.check ||
        checks[0] === injected.CIPHER.check
      ) {
        return checks[1];
      }
    }
    return checks[0];
  }
  return injected.FALLBACK.check;
}

export function findMatchingRequiredOptions(
  requiredOptions: RequiredOption[],
  providedOptions: { [key: string]: any }
): RequiredOption[] {
  const matches = requiredOptions.filter(requiredOption => {
    if (typeof requiredOption === "string") {
      return requiredOption in providedOptions;
    }
    const matches = findMatchingRequiredOptions(
      requiredOption,
      providedOptions
    );
    return matches && matches.length;
  });
  return matches;
}
