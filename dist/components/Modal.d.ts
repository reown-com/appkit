import * as React from "react";
import * as PropTypes from "prop-types";
import { SimpleFunction, IProviderUserOptions, ThemeColors } from "../helpers";
declare global {
    interface Window {
        ethereum: any;
        web3: any;
        updateWeb3Modal: any;
    }
}
interface IModalProps {
    themeColors: ThemeColors;
    userOptions: IProviderUserOptions[];
    onClose: SimpleFunction;
    resetState: SimpleFunction;
    lightboxOpacity: number;
}
interface IModalState {
    show: boolean;
    lightboxOffset: number;
}
export declare class Modal extends React.Component<IModalProps, IModalState> {
    constructor(props: IModalProps);
    static propTypes: {
        userOptions: PropTypes.Validator<object>;
        onClose: PropTypes.Validator<(...args: any[]) => any>;
        resetState: PropTypes.Validator<(...args: any[]) => any>;
        lightboxOpacity: PropTypes.Validator<number>;
    };
    lightboxRef?: HTMLDivElement | null;
    mainModalCard?: HTMLDivElement | null;
    state: IModalState;
    componentDidUpdate(prevProps: IModalProps, prevState: IModalState): void;
    render: () => JSX.Element;
}
export {};
//# sourceMappingURL=Modal.d.ts.map