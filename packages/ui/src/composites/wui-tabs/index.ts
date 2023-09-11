import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { IconType } from '../../utils/TypesUtil.js'
import styles from './styles.js'

@customElement('wui-tabs')
export class WuiTabs extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property({ type: Array }) public tabs: { icon: IconType; label: string }[] = []

  @property() public onTabChange: (index: number) => void = () => null

  @property({ type: Array }) public buttons: HTMLButtonElement[] = []

  @property({ type: Boolean }) public disabled = false

  @state() public activeTab = 0

  @state() public localTabWidth = '100px'

  @state() public isDense = false

  // -- Render -------------------------------------------- //
  public override render() {
    this.isDense = this.tabs.length > 3

    this.style.cssText = `
      --local-tab: ${this.activeTab};
      --local-tab-width: ${this.localTabWidth};
    `

    this.dataset['type'] = this.isDense ? 'flex' : 'block'

    return this.tabs.map((tab, index) => {
      const isActive = index === this.activeTab

      return html`
        <button
          ?disabled=${this.disabled}
          @click=${() => this.onTabClick(index)}
          data-active=${isActive}
        >
          <wui-icon size="sm" color="inherit" name=${tab.icon}></wui-icon>
          <wui-text variant="small-600" color="inherit"> ${tab.label} </wui-text>
        </button>
      `
    })
  }

  override firstUpdated() {
    if (this.shadowRoot && this.isDense) {
      this.buttons = [...this.shadowRoot.querySelectorAll('button')]
      setTimeout(() => {
        this.animateTabs(0, true)
      }, 0)
    }
  }

  // -- Private ------------------------------------------- //
  private onTabClick(index: number) {
    if (this.buttons) {
      this.animateTabs(index, false)
    }
    this.activeTab = index
    this.onTabChange(index)
  }

  private animateTabs(index: number, initialAnimation: boolean) {
    const passiveBtn = this.buttons[this.activeTab]
    const activeBtn = this.buttons[index]

    const passiveBtnText = passiveBtn?.querySelector('wui-text')
    const activeBtnText = activeBtn?.querySelector('wui-text')

    const activeBtnBounds = activeBtn?.getBoundingClientRect()
    const activeBtnTextBounds = activeBtnText?.getBoundingClientRect()

    if (passiveBtn && passiveBtnText && !initialAnimation && index !== this.activeTab) {
      passiveBtnText.animate([{ opacity: 0 }], {
        duration: 200,
        easing: 'ease',
        fill: 'forwards'
      })

      passiveBtn.animate([{ width: `34px` }], {
        duration: 500,
        easing: 'ease',
        fill: 'forwards'
      })
    }

    if (activeBtn && activeBtnBounds && activeBtnTextBounds && activeBtnText) {
      if (index !== this.activeTab || initialAnimation) {
        this.localTabWidth = `${
          Math.round(activeBtnBounds.width + activeBtnTextBounds.width) + 6
        }px`

        activeBtn.animate([{ width: `${activeBtnBounds.width + activeBtnTextBounds.width}px` }], {
          duration: initialAnimation ? 0 : 500,
          fill: 'forwards',
          easing: 'ease'
        })

        activeBtnText.animate([{ opacity: 1 }], {
          duration: initialAnimation ? 0 : 250,
          delay: initialAnimation ? 0 : 50,
          fill: 'forwards',
          easing: 'ease'
        })
      }
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-tabs': WuiTabs
  }
}
