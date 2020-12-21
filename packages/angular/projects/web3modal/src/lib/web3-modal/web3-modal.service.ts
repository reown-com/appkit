import { EventEmitter, Injectable, Optional } from '@angular/core';
import {
  CONNECT_EVENT,
  ERROR_EVENT,
  IProviderControllerOptions,
  Web3WalletConnector,
  IProviderUserOptions
} from '@web3modal/core';
import { take } from 'rxjs/operators';

@Injectable()
export class Web3ModalService {
  private web3WalletConnector: Web3WalletConnector

  public shouldOpen: EventEmitter<boolean> = new EventEmitter();
  public providers: EventEmitter<IProviderUserOptions[]> = new EventEmitter();

  constructor (@Optional() configOptions?: IProviderControllerOptions) {
    this.web3WalletConnector = new Web3WalletConnector(configOptions)
  }

  async open() {
    this.providers.next(this.web3WalletConnector.providers)

    return await new Promise((resolve, reject) => {
      this.web3WalletConnector.providerController.on(CONNECT_EVENT, provider => {
        resolve(provider);
      });
  
      this.web3WalletConnector.providerController.on(ERROR_EVENT, error => {
        reject(error);
      });

      this.shouldOpen.next(true)

      this.shouldOpen.pipe(take(1)).subscribe({
        next: (open) => {
          if (!open) {
            reject('Dismissed modal');
          }
        }
      })
    }).finally(() => {
      this.close()
    })
  }

  setConfiguration(options: IProviderControllerOptions) {
    this.web3WalletConnector.setConfiguration(options)
  }

  clearCachedProvider(): void {
    this.web3WalletConnector.providerController.clearCachedProvider();
  }

  setCachedProvider(id: string): void {
    this.web3WalletConnector.providerController.setCachedProvider(id);
  }

  close() {
    this.shouldOpen.next(false)
  }
}
