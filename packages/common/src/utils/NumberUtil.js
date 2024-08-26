import * as BigNumber from 'bignumber.js';
export const NumberUtil = {
    bigNumber(value) {
        return new BigNumber.BigNumber(value);
    },
    multiply(a, b) {
        if (a === undefined || b === undefined) {
            return BigNumber.BigNumber(0);
        }
        const aBigNumber = new BigNumber.BigNumber(a);
        const bBigNumber = new BigNumber.BigNumber(b);
        return aBigNumber.multipliedBy(bBigNumber);
    },
    formatNumberToLocalString(value, decimals = 2) {
        if (value === undefined) {
            return '0.00';
        }
        if (typeof value === 'number') {
            return value.toLocaleString('en-US', {
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals
            });
        }
        return parseFloat(value).toLocaleString('en-US', {
            maximumFractionDigits: decimals,
            minimumFractionDigits: decimals
        });
    }
};
//# sourceMappingURL=NumberUtil.js.map