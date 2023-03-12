import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { AppComponent } from './app.component';
import { Web3modalComponent } from './shared/components/web3modal/web3modal.component'
@NgModule({
  declarations: [AppComponent, Web3modalComponent],
  providers: [],
  bootstrap: [AppComponent],
  imports: [BrowserModule]
})
export class AppModule {}
