import { AccountController, CoreHelperUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { SmartSessionsController } from '../../../controllers/SmartSessionsController.js'

const TABS = 3
const TABS_PADDING = 48
const MODAL_MOBILE_VIEW_PX = 430
const SMART_SESSION_TABS = [{ label: 'Active' }, { label: 'Expired' }, { label: 'Revoked' }]
@customElement('w3m-smart-session-list-view')
export class W3mSmartSessionListView extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  @state() private currentTab = 0

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private sessions = SmartSessionsController.state.sessions

  public constructor() {
    super()
    this.unsubscribe.push(
      SmartSessionsController.subscribeKey('sessions', sessions => {
        this.sessions = sessions
      })
    )
  }

  public override firstUpdated() {
    AccountController.fetchTokenBalance()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<wui-flex
      flexDirection="column"
      .padding=${['0', 'xl', 'm', 'xl'] as const}
      alignItems="center"
      gap="m"
    >
      <wui-tabs
        .onTabChange=${this.onTabChange.bind(this)}
        .activeTab=${this.currentTab}
        localTabWidth=${CoreHelperUtil.isMobile() && window.innerWidth < MODAL_MOBILE_VIEW_PX
          ? `${(window.innerWidth - TABS_PADDING) / TABS}px`
          : '104px'}
        .tabs=${SMART_SESSION_TABS}
      ></wui-tabs>
      ${this.listContentTemplate()}
    </wui-flex>`
  }

  // -- Private ------------------------------------------- //
  private listContentTemplate() {
    const currentTabStatus = SMART_SESSION_TABS[this.currentTab]?.label?.toLocaleLowerCase()
    const sessions = this.sessions.filter(session => session.status === currentTabStatus)

    return html`<w3m-smart-session-list .sessions=${sessions}></w3m-smart-session-list>`
  }

  private onTabChange(index: number) {
    this.currentTab = index
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-smart-session-list-view': W3mSmartSessionListView
  }
}
