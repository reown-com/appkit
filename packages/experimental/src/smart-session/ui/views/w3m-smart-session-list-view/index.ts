import { CoreHelperUtil } from '@reown/appkit-core'
import { customElement } from '@reown/appkit-ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import styles from './styles.js'
import { SmartSessionsController } from '../../../controllers/SmartSessionsController.js'
import { DateUtil } from '@reown/appkit-common'
import type { SmartSession } from '../../../utils/TypeUtils.js'

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
    const expiredSessions = this.sessions.filter(session => session.expiration < Date.now())
    const activeSessions = this.sessions.filter(
      session => !session.revokedAt && session.expiration > Date.now()
    )

    const sessionsByTab = [activeSessions, expiredSessions, revokedSessions]

    const sessions = sessionsByTab[this.currentTab] || []

    return html`${this.groupedSessionsTemplate(sessions)}`
  }

  private groupedSessionsTemplate(sessions: SmartSession[]) {
    function getMonthName(monthNumber: number) {
      const date = new Date()
      date.setMonth(monthNumber)

      return date.toLocaleString('en-US', {
        month: 'long'
      })
    }
    function getTitle(year: number, month: number) {
      const currentYear = DateUtil.getYear()
      const monthName = getMonthName(month)
      const isCurrentYear = year === currentYear
      const groupTitle = isCurrentYear ? monthName : `${monthName} ${year}`

      return groupTitle
    }
    const sessionsByYearAndMonth = sessions.reduce<Record<number, Record<number, SmartSession[]>>>(
      (acc, session) => {
        const date = new Date(session.createdAt)
        const year = date.getFullYear()
        const month = date.getMonth()

        if (!acc[year]) {
          acc[year] = {}
        }

        if (!acc[year][month]) {
          acc[year][month] = []
        }

        acc[year][month].push(session)

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

  private templateSessions(sessions: SmartSession[]) {
    return sessions.map(session => {
      const { project } = session

      function getVariant(val: SmartSession) {
        if (session.revokedAt) {
          return 'error'
        }

        return val.expiration < Date.now() ? 'shade' : 'success'
      }

      return html`<wui-flex
        class="session-container"
        gap="s"
        .padding=${['s', 's', 's', 's'] as const}
        alignItems="center"
        justifyContent="space-between"
      >
        <wui-flex gap="xs">
          <img class="session-project-image" src=${project?.iconUrl} width="40px" height="40px" />
          <wui-flex flexDirection="column">
            <wui-text variant="small-400" color="fg-100">${project?.name}</wui-text>
            <wui-link>${project?.url}</wui-link>
          </wui-flex>
        </wui-flex>
        <wui-tag variant=${getVariant(session)}
          >${SMART_SESSION_TABS[this.currentTab]?.label}</wui-tag
        >
      </wui-flex>`
    })
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
