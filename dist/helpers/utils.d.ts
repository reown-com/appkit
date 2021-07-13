import { IProviderInfo, IInjectedProvidersMap, ThemeColors, RequiredOption } from "./types";
export declare function checkInjectedProviders(): IInjectedProvidersMap;
export declare function verifyInjectedProvider(check: string): boolean;
export declare function getInjectedProvider(): IProviderInfo | null;
export declare function getInjectedProviderName(): string | null;
export declare function getProviderInfo(provider: any): IProviderInfo;
export declare function getProviderInfoFromChecksArray(checks: string[]): IProviderInfo;
export declare function getProviderInfoByName(name: string | null): IProviderInfo;
export declare function getProviderInfoById(id: string | null): IProviderInfo;
export declare function getProviderInfoByCheck(check: string | null): IProviderInfo;
export declare function isMobile(): boolean;
export declare function getProviderDescription(providerInfo: Partial<IProviderInfo>): string;
export declare function filterMatches<T>(array: T[], condition: (x: T) => boolean, fallback: T | undefined): T | undefined;
export declare function filterProviders(param: string, value: string | null): IProviderInfo;
export declare function filterProviderChecks(checks: string[]): string;
export declare function getChainId(network: string): number;
export declare function getThemeColors(theme: string | ThemeColors): ThemeColors;
export declare function findMatchingRequiredOptions(requiredOptions: RequiredOption[], providedOptions: {
    [key: string]: any;
}): RequiredOption[];
//# sourceMappingURL=utils.d.ts.map