export type ThemeType = 'dark' | 'light';
export interface ThemeVariables {
    '--w3m-font-family'?: string;
    '--w3m-accent'?: string;
    '--w3m-color-mix'?: string;
    '--w3m-color-mix-strength'?: number;
    '--w3m-font-size-master'?: string;
    '--w3m-border-radius-master'?: string;
    '--w3m-z-index'?: number;
}
export interface W3mThemeVariables {
    '--w3m-accent': string;
    '--w3m-background': string;
}
export declare function getW3mThemeVariables(themeVariables?: ThemeVariables, themeType?: ThemeType): {
    '--w3m-accent': string;
    '--w3m-background': string;
};
