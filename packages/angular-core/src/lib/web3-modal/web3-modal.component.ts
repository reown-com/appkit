import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { IProviderUserOptions } from '@web3modal/core';
import { Web3ModalService } from './web3-modal.service';

@Component({
  selector: 'm-web3-modal',
  templateUrl: 'web3-modal.component.html',
  styleUrls: ['./web3-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class Web3ModalComponent {
  open: boolean = false;
  providers: IProviderUserOptions[] = [];

  private openSubscription: Subscription;
  private providersSubscription: Subscription;

  @Input() title: string
  @Input() description?: string
  @Input() descriptionGray?: string
  @Input() dismissText?: string

  constructor(private service: Web3ModalService) { }

  ngOnInit() {
    this.openSubscription = this.service.shouldOpen.subscribe({
      next: open => {
        this.open = open;
      },
    });

    this.providersSubscription = this.service.providers.subscribe({
      next: providers => {
        this.providers = providers;
      },
    });
  }

  ngOnDestroy() {
    this.openSubscription.unsubscribe()
    this.providersSubscription.unsubscribe()
  }

  close() {
    this.service.close();
  }
}
