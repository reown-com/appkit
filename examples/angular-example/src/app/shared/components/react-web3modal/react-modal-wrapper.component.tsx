// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core'
import React from 'react'
import { createRoot } from 'react-dom/client'
import { ReactModalComponent } from './react-modal.component'

@Component({
  selector: 'web3-modal-component',
  templateUrl: './react-modal-wrapper.component.html'
})
export class ReactModalWrapperComponent implements AfterViewInit {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  @ViewChild('reactWrapper') public containerRef!: ElementRef
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  ngAfterViewInit(): void {
    createRoot(this.containerRef.nativeElement).render(
      <React.StrictMode>
        <ReactModalComponent />
      </React.StrictMode>
    )
  }
}
