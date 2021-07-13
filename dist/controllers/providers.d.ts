import { IProviderControllerOptions, IProviderDisplayWithConnector, IProviderUserOptions } from "../helpers";
export declare class ProviderController {
    cachedProvider: string;
    shouldCacheProvider: boolean;
    disableInjectedProvider: boolean;
    private eventController;
    private injectedProvider;
    private providers;
    private providerOptions;
    private network;
    constructor(opts: IProviderControllerOptions);
    shouldDisplayProvider(id: string): boolean;
    getUserOptions: () => IProviderUserOptions[];
    getProvider(id: string): IProviderDisplayWithConnector | undefined;
    getProviderOption(id: string, key: string): any;
    clearCachedProvider(): void;
    setCachedProvider(id: string): void;
    connectTo: (id: string, connector: (providerPackage: any, opts: any) => Promise<any>) => Promise<void>;
    connectToCachedProvider(): Promise<void>;
    on(event: string, callback: (result: any) => void): () => void;
    off(event: string, callback?: (result: any) => void): void;
}
//# sourceMappingURL=providers.d.ts.map