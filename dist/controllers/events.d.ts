import { IEventCallback } from "../helpers";
export declare class EventController {
    private _eventCallbacks;
    constructor();
    on(eventCallback: IEventCallback): void;
    off(eventObj?: Partial<IEventCallback>): void;
    trigger(event: string, result?: any): void;
}
//# sourceMappingURL=events.d.ts.map