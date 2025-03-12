import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import { DateUtil } from '@reown/appkit-common'
import { CoreHelperUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import '@reown/appkit-ui/wui-button'
import '@reown/appkit-ui/wui-flex'
import '@reown/appkit-ui/wui-icon-box'
import '@reown/appkit-ui/wui-link'
import '@reown/appkit-ui/wui-tabs'
import '@reown/appkit-ui/wui-tag'
import '@reown/appkit-ui/wui-text'

import { SmartSessionsController } from '../../../controllers/SmartSessionsController.js'
import type { SmartSession } from '../../../utils/TypeUtils.js'
import styles from './styles.js'

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
  @state() private openSession?: string

  public constructor() {
    super()
    this.unsubscribe.push(
      SmartSessionsController.subscribeKey('sessions', sessions => {
        this.sessions = sessions
      })
    )
  }

  public override firstUpdated() {
    SmartSessionsController.getSmartSessions()
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
    const revokedSessions = this.sessions.filter(session => session.revokedAt)
    const expiredSessions = this.sessions.filter(session => session.expiry < Date.now())
    const activeSessions = this.sessions.filter(
      session => !session.revokedAt && session.expiry > Date.now()
    )

    const sessionsByTab = [activeSessions, expiredSessions, revokedSessions]

    const sessions = sessionsByTab[this.currentTab] || []

    if (!sessions.length) {
      return this.templateNoSessions()
    }

    return html`${this.groupedSessionsTemplate(sessions)}`
  }

  private groupedSessionsTemplate(sessions: SmartSession[]) {
    function getTitle(year: number, month: number) {
      const currentYear = DateUtil.getYear()
      const monthName = DateUtil.getMonthNameByIndex(month)
      const isCurrentYear = year === currentYear
      const groupTitle = isCurrentYear ? monthName : `${monthName} ${year}`

      return groupTitle
    }
    const sessionsByYearAndMonth = sessions.reduce<Record<number, Record<number, SmartSession[]>>>(
      (acc, session) => {
        const date = new Date(session.createdAt * 1000)
        const year = date.getFullYear()
        const month = date.getMonth()

        const acumYear = acc[year] || {}
        const acumMonth = acumYear[month] || []

        acumMonth.push(session)
        acumYear[month] = acumMonth
        acc[year] = acumYear

        return acc
      },
      {}
    )

    const sortedYearKeys = Object.keys(sessionsByYearAndMonth).sort().reverse()

    return sortedYearKeys.map(year => {
      const yearInt = parseInt(year, 10)

      const sortedMonthIndexes = new Array(12)
        .fill(null)
        .map((_, idx) => {
          const groupTitle = getTitle(yearInt, idx)
          const monthSessions = sessionsByYearAndMonth[yearInt]?.[idx]

          return {
            groupTitle,
            monthSessions
          }
        })
        .reverse()

      return sortedMonthIndexes.map(({ groupTitle, monthSessions }, index) => {
        const isLastGroup = index === sortedMonthIndexes.length - 1

        if (!monthSessions) {
          return null
        }

        return html`
          <wui-flex
            flexDirection="column"
            class="group-container"
            last-group="${isLastGroup ? 'true' : 'false'}"
          >
            <wui-flex
              alignItems="center"
              flexDirection="row"
              .padding=${['xs', 's', 's', 's'] as const}
            >
              <wui-text variant="paragraph-500" color="fg-200">${groupTitle}</wui-text>
            </wui-flex>
            <wui-flex flexDirection="column" gap="m">
              ${this.templateSessions(monthSessions)}
            </wui-flex>
          </wui-flex>
        `
      })
    })
  }

  private templateNoSessions() {
    const type = SMART_SESSION_TABS[this.currentTab]?.label || ''

    return html`<wui-flex
      alignItems="center"
      justifyContent="center"
      .padding=${['l', 'l', 'l', 'l'] as const}
    >
      <wui-text variant="title-400" color="fg-200">No ${type.toLowerCase()} sessions</wui-text>
    </wui-flex>`
  }

  private templateSessions(sessions: SmartSession[]) {
    return sessions.map(session => {
      const { project } = session

      return html` <wui-flex
        class="session-container"
        gap="s"
        flexDirection="column"
        .padding=${['s', 's', 's', 's'] as const}
        @click=${this.onSessionClick.bind(this, session)}
      >
        <wui-flex gap="s" alignItems="center" justifyContent="space-between">
          <wui-flex gap="xs">
            ${project.iconUrl
              ? html`<img
                  class="session-project-image"
                  src=${project?.iconUrl}
                  width="40px"
                  height="40px"
                />`
              : html`<wui-icon-box
                  size="lg"
                  icon="helpCircle"
                  background="opaque"
                  iconColor="fg-100"
                  backgroundColor="inverse-100"
                ></wui-icon-box>`}
            <wui-flex flexDirection="column">
              <wui-text variant="small-400" color="fg-100"
                >${project?.name || 'Unknown Dapp'}</wui-text
              >
              ${project.url ? html`<wui-link>${project?.url}</wui-link>` : null}
            </wui-flex>
          </wui-flex>
          <wui-tag variant=${this.getVariant(session)}
            >${SMART_SESSION_TABS[this.currentTab]?.label}</wui-tag
          >
        </wui-flex>
        ${this.openSession === session.pci
          ? html`<wui-flex>
              ${session.permissions.map(permission => {
                // Skip other perms for now. TODO: map to corresponding ui pieces
                if (permission.type !== 'contract-call') {
                  return ''
                }
                const { data } = permission

                return html` <wui-flex flexDirection="column" gap="s">
                  <wui-permission-contract-call
                    .contractAddress=${data.address}
                    .expiry=${session.expiry / 1000}
                    .functions=${data.functions}
                  ></wui-permission-contract-call>
                  ${this.currentTab === 0
                    ? html`<wui-button
                        @click=${this.revokePermission.bind(this, session)}
                        fullWidth
                        variant="accent"
                      >
                        Revoke
                      </wui-button>`
                    : null}
                </wui-flex>`
              })}
            </wui-flex>`
          : null}
      </wui-flex>`
    })
  }

  private getVariant(session: SmartSession) {
    if (session.revokedAt) {
      return 'error'
    }

    return session.expiry < Date.now() ? 'shade' : 'success'
  }

  private onSessionClick(session: SmartSession) {
    this.openSession = this.openSession === session.pci ? undefined : session.pci
  }

  private async revokePermission(session: SmartSession) {
    await SmartSessionsController.revokeSmartSession(session)
    this.requestUpdate()
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
