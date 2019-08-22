import { IEventCallback } from "../helpers/types";

// -- EventManager --------------------------------------------------------- //

class EventManager {
  private _eventCallbacks: IEventCallback[];

  constructor() {
    this._eventCallbacks = [];
  }

  public on(eventCallback: IEventCallback) {
    this._eventCallbacks.push(eventCallback);
  }

  public off(event?: string) {
    if (event) {
      this._eventCallbacks.filter(
        (eventCallback: IEventCallback) => eventCallback.event !== event
      );
    } else {
      this._eventCallbacks = [];
    }
  }

  public trigger(event: string, result?: any): void {
    let eventCallbacks: IEventCallback[] = this._eventCallbacks.filter(
      (eventCallback: IEventCallback) => eventCallback.event === event
    );

    if (eventCallbacks && eventCallbacks.length) {
      eventCallbacks.forEach((eventCallback: IEventCallback) => {
        eventCallback.callback(result);
      });
    }
  }
}

export default EventManager;
