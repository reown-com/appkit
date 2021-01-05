import { Component, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'm-modal',
  host: {
    '[hidden]': 'hidden',
  },
  inputs: ['open', 'allowClose'],
  outputs: ['closed'],
  styleUrls: ['./modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './modal.component.html',
})
export class Modal {
  allowClose: boolean = true;
  hidden: boolean = true;
  closed: EventEmitter<any> = new EventEmitter();

  set _hidden(value: boolean) {
    this.hidden = value;
  }

  set open(value: boolean) {
    this.hidden = !value;
  }

  close(event) {
    if (!this.allowClose) return;

    this.hidden = !this.hidden;
    this.closed.next(true);
    event.stopPropagation();
  }
}
