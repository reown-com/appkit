import { Component } from '@angular/core';
import { Web3ModalService } from '@web3modal/angular';
import WalletConnectProvider from '@walletconnect/web3-provider';
import Torus from '@toruslabs/torus-embed'
import Portis from '@portis/web3'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'testapp';

  constructor(private web3ModalService: Web3ModalService) {}

  async testModal() {
    this.web3ModalService.setConfiguration({
      disableInjectedProvider: false,
      cacheProvider: false,
      providerOptions: {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: 'INFURA_ID',
          },
        },
        torus: {
          package: Torus,
        },
        portis: {
          package: Portis,
          options: {
            id: 'portis',
          },
        },
      },
      network: '',
    });

    console.log(this.web3ModalService)
    
    const provider = await this.web3ModalService.open()
    console.log(provider)
  }
}
