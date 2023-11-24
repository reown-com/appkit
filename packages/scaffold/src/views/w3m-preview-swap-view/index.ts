import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import styles from './styles.js'

@customElement('w3m-preview-swap-view')
export class W3mPreviewSwapView extends LitElement {
  public static override styles = styles

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <wui-flex flexDirection="column" padding="l" gap="s">${this.templateSwap()}</wui-flex>
    `
  }

  // -- Private ------------------------------------------- //
  private templateSwap() {
    return html`
      <wui-flex flexDirection="column" alignItems="center" gap="l">
        <wui-flex class="preview-container" flexDirection="column" alignItems="center" gap="l">
          ${this.templateToken('0.867')}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M8.30713 0.292893C8.69766 0.683417 8.69766 1.31658 8.30713 1.70711L6.41424 3.6H11.3404C13.8369 3.6 16.0533 5.1975 16.8427 7.56588L16.9487 7.88377C17.1234 8.40772 16.8402 8.97404 16.3163 9.14868C15.7923 9.32333 15.226 9.04017 15.0513 8.51623L14.9454 8.19834C14.4281 6.64664 12.976 5.6 11.3404 5.6H6.41424L8.30713 7.49289C8.69766 7.88342 8.69766 8.51658 8.30713 8.90711C7.91661 9.29763 7.28344 9.29763 6.89292 8.90711L3.29292 5.30711C2.9024 4.91658 2.9024 4.28342 3.29292 3.89289L6.89292 0.292893C7.28344 -0.0976311 7.91661 -0.0976311 8.30713 0.292893ZM3.6838 10.8513C4.20774 10.6767 4.77406 10.9598 4.94871 11.4838L5.05467 11.8017C5.57191 13.3534 7.02404 14.4 8.65967 14.4L13.5858 14.4L11.6929 12.5071C11.3024 12.1166 11.3024 11.4834 11.6929 11.0929C12.0834 10.7024 12.7166 10.7024 13.1071 11.0929L16.7071 14.6929C17.0977 15.0834 17.0977 15.7166 16.7071 16.1071L13.1071 19.7071C12.7166 20.0976 12.0834 20.0976 11.6929 19.7071C11.3024 19.3166 11.3024 18.6834 11.6929 18.2929L13.5858 16.4L8.65967 16.4C6.16317 16.4 3.94677 14.8025 3.15731 12.4341L3.05134 12.1162C2.8767 11.5923 3.15986 11.026 3.6838 10.8513Z"
              fill="#788181"
            />
          </svg>
          ${this.templateToken('4927.3664')}
          <wui-text variant="paragraph-500" color="fg-200">$1,718.6</wui-text>
        </wui-flex>

        <wui-flex class="details-container" flexDirection="column" alignItems="center" gap="xs">
          <wui-flex justifyContent="space-between" alignItems="center" class="details-row">
            <wui-text variant="paragraph-400" color="fg-200">Price</wui-text>
            <wui-flex flexDirection="column" gap="4xs" alignItems="flex-end">
              <wui-text variant="small-400" color="fg-100">1 ETH = 5,700.05 1INCH</wui-text>
              <wui-text variant="small-400" color="fg-200">$2,003.62</wui-text>
            </wui-flex>
          </wui-flex>

          <wui-flex justifyContent="space-between" class="details-row">
            <wui-text variant="paragraph-500" color="fg-200">Network</wui-text>
            <wui-flex alignItems="center" gap="xs">
              <wui-text variant="paragraph-400" color="fg-200">Ethereum</wui-text>
              <wui-image
                class="token-image"
                src="https://explorer-api.walletconnect.com/w3m/v1/getAssetImage/692ed6ba-e569-459a-556a-776476829e00?projectId=c1781fc385454899a2b1385a2b83df3b"
              ></wui-image>
            </wui-flex>
          </wui-flex>

          <wui-flex justifyContent="space-between" class="details-row">
            <wui-text variant="paragraph-400" color="fg-200">Network cost</wui-text>
            <wui-flex flexDirection="column" gap="4xs" alignItems="flex-end">
              <wui-text variant="small-400" color="fg-100">15.4007 1INCH</wui-text>
              <wui-text variant="small-400" color="fg-200">$5.3836</wui-text>
            </wui-flex>
          </wui-flex>

          <wui-flex justifyContent="space-between" class="details-row">
            <wui-text variant="paragraph-400" color="fg-200">Service fee</wui-text>
            <wui-flex>
              <wui-text variant="small-400" color="fg-100">Free</wui-text>
            </wui-flex>
          </wui-flex>
        </wui-flex>

        <wui-flex class="details-container" flexDirection="column" alignItems="center" gap="xs">
        </wui-flex>
      </wui-flex>
    `
  }

  private templateToken(value: string, networkSrc?: string) {
    const networkElement = networkSrc
      ? html`<wui-image src=${networkSrc}></wui-image>`
      : html`
          <wui-icon-box
            size="sm"
            iconColor="fg-200"
            backgroundColor="fg-300"
            icon="networkPlaceholder"
          ></wui-icon-box>
        `

    return html`
      <wui-flex class="token-item">
        <wui-text variant="paragraph-600" color="fg-100">${value}</wui-text>
        ${networkElement}
      </wui-flex>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-preview-swap-view': W3mPreviewSwapView
  }
}
