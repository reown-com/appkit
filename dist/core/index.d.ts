import { ICoreOptions, ThemeColors, SimpleFunction } from "../helpers";
export declare class Core {
    private show;
    private themeColors;
    private eventController;
    private lightboxOpacity;
    private providerController;
    private userOptions;
    constructor(opts?: Partial<ICoreOptions>);
    get cachedProvider(): string;
    connect: () => Promise<any>;
    connectTo: (id: string) => Promise<any>;
    toggleModal(): Promise<void>;
    on(event: string, callback: SimpleFunction): SimpleFunction;
    off(event: string, callback?: SimpleFunction): void;
    clearCachedProvider(): void;
    setCachedProvider(id: string): void;
    updateTheme(theme: string | ThemeColors): Promise<void>;
    private renderModal;
    private _toggleModal;
    private onError;
    private onConnect;
    private onClose;
    private updateState;
    private resetState;
}
//# sourceMappingURL=index.d.ts.map