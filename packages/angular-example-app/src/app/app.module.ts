import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { Web3ModalModule, Web3ModalService, Web3ModalComponent } from '@web3modal/angular';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    Web3ModalModule
  ],
  entryComponents: [Web3ModalComponent],
  providers: [Web3ModalService],
  bootstrap: [AppComponent]
})
export class AppModule { }
