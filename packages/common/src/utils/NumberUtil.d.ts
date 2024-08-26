import * as BigNumber from 'bignumber.js';
export declare const NumberUtil: {
    bigNumber(value: BigNumber.BigNumber.Value): BigNumber.BigNumber;
    multiply(a: BigNumber.BigNumber.Value | undefined, b: BigNumber.BigNumber.Value | undefined): BigNumber.BigNumber;
    formatNumberToLocalString(value: string | number | undefined, decimals?: number): string;
};
