import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { AppComponent } from './app.component'
import { ReactModalWrapperComponent } from './shared/components/react-web3modal/react-modal-wrapper.component'

@NgModule({
  declarations: [AppComponent, ReactModalWrapperComponent],
  providers: [],
  bootstrap: [AppComponent],
  imports: [BrowserModule]
})
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class AppModule {}
