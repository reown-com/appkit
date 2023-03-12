import { Component } from '@angular/core';
import { configureChains, createClient } from '@wagmi/core';
import { arbitrum, mainnet, polygon } from '@wagmi/core/chains';
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum';
import { Web3Modal } from '@web3modal/html';

@Component({
  selector: 'web3-app-web3modal',
  templateUrl: './web3modal.component.html',
  styleUrls: ['./web3modal.component.scss']
})
export class Web3modalComponent {
  
  id: string = '5eec3e3ff91ddea25b76615da1e8b668'
  chains: any = [arbitrum, mainnet, polygon]
  ethereumClient: any
  wagmiClient: any
  web3modal: any

  constructor(){
    this.setProvider();
  }

  setProvider():void{
    const {provider} = configureChains(this.chains, [w3mProvider({ projectId:this.id })])
    this.wagmiClient = createClient({
      autoConnect: true,
      connectors: w3mConnectors({ projectId:this.id, version: 1, chains:this.chains }),
      provider
    })
    this.ethereumClient = new EthereumClient(this.wagmiClient, this.chains)
    this.web3modal = new Web3Modal({ projectId: this.id }, this.ethereumClient)
  }

  open():void{
    this.web3modal.openModal()
  }
  
}
