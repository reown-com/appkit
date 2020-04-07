import { providers, FALLBACK } from "../providers";
import {
  METAMASK_INJECTED,
  CIPHER_INJECTED,
  FALLBACK_INJECTED
} from "../providers/injected";
import {
  IProviderInfo,
  IInjectedProvidersMap,
  ChainData,
  ThemeColors
} from "./types";
import { themesList } from "../themes";
import { chainList, EMPTY_CHAIN_DATA } from "./chains";

export function checkInjectedProviders(): IInjectedProvidersMap {
  const result = {
    injectedAvailable: !!window.ethereum || !!window.web3
  };
  if (result.injectedAvailable) {
    let fallbackProvider = true;
    providers.forEach(provider => {
      const isAvailable = verifyInjectedProvider(provider.check);
      if (isAvailable) {
        result[provider.check] = true;
        fallbackProvider = false;
      }
    });

    if (fallbackProvider) {
      result[FALLBACK_INJECTED.check] = true;
    }
  }

  return result;
}

export function verifyInjectedProvider(check: string): boolean {
  return window.ethereum
    ? window.ethereum[check] || (window.web3 && window.web3.currentProvider)
      ? window.web3
        ? window.web3.currentProvider[check]
        : true
      : false
    : window.web3 && window.web3.currentProvider
    ? window.web3.currentProvider[check]
    : false;
}

export function getInjectedProvider(): IProviderInfo | null {
  let result = null;

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
  if (!provider) return FALLBACK;
  const checks = providers.filter(x => provider[x.check]).map(x => x.check);
  return getProviderInfoFromChecksArray(checks);
}

export function getProviderInfoFromChecksArray(
  checks: string[]
): IProviderInfo {
  const match = filterProviderChecks(checks);
  return getProviderInfoByCheck(match);
}

export function getProviderInfoByName(name: string | null): IProviderInfo {
  if (!name) return FALLBACK;
  return filterMatches<IProviderInfo>(
    providers,
    x => x.name === name,
    FALLBACK
  );
}

export function getProviderInfoByCheck(check: string | null): IProviderInfo {
  if (!check) return FALLBACK;
  return filterMatches<IProviderInfo>(
    providers,
    x => x.check === check,
    FALLBACK
  );
}

export function isMobile(): boolean {
  let mobile: boolean = false;

  function hasTouchEvent(): boolean {
    try {
      document.createEvent("TouchEvent");
      return true;
    } catch (e) {
      return false;
    }
  }

  function hasMobileUserAgent(): boolean {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(
        navigator.userAgent
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw-(n|u)|c55\/|capi|ccwa|cdm-|cell|chtm|cldc|cmd-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc-s|devi|dica|dmob|do(c|p)o|ds(12|-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(-|_)|g1 u|g560|gene|gf-5|g-mo|go(.w|od)|gr(ad|un)|haie|hcit|hd-(m|p|t)|hei-|hi(pt|ta)|hp( i|ip)|hs-c|ht(c(-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i-(20|go|ma)|i230|iac( |-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|-[a-w])|libw|lynx|m1-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|-([1-8]|c))|phil|pire|pl(ay|uc)|pn-2|po(ck|rt|se)|prox|psio|pt-g|qa-a|qc(07|12|21|32|60|-[2-7]|i-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h-|oo|p-)|sdk\/|se(c(-|0|1)|47|mc|nd|ri)|sgh-|shar|sie(-|m)|sk-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h-|v-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl-|tdg-|tel(i|m)|tim-|t-mo|to(pl|sh)|ts(70|-|m3|m5)|tx-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas-|your|zeto|zte-/i.test(
        navigator.userAgent.substr(0, 4)
      )
    ) {
      return true;
    } else if (hasTouchEvent()) {
      return true;
    }
    return false;
  }

  mobile = hasMobileUserAgent();

  return mobile;
}

export function formatProviderDescription(providerInfo: IProviderInfo): string {
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
  fallback: T
): T {
  let result = fallback;
  const matches = array.filter(condition);

  if (!!matches && matches.length) {
    result = matches[0];
  }

  return result;
}

export function filterProviderChecks(checks: string[]): string {
  if (!!checks && checks.length) {
    if (checks.length > 1) {
      if (
        checks[0] === METAMASK_INJECTED.check ||
        checks[0] === CIPHER_INJECTED.check
      ) {
        return checks[1];
      }
    }
    return checks[0];
  }
  return FALLBACK.check;
}

export function getChainId(network: string): number {
  const chains: ChainData[] = Object.values(chainList);
  const { chainId } = filterMatches<ChainData>(
    chains,
    x => x.network === network,
    EMPTY_CHAIN_DATA
  );
  return chainId;
}

export function getThemeColors(theme: string | ThemeColors): ThemeColors {
  return typeof theme === "string" ? themesList[theme].colors : theme;
}
