# DOM Tags

<p>This section is a key of the DOM elements used for internal E2E testing</p>
<p>Accessible with `data-testid`</p>

## _View_ Selectors

| Account View     | Id                               | Description                 | Tag Type                       |
| ---------------- | -------------------------------- | --------------------------- | ------------------------------ |
| w3m-account-view | `view-account-content`           | Account view content        | `<w3m-modal-content>`          |
| w3m-account-view | `view-account-avatar`            | Account avatar              | `<w3m-avatar>`                 |
| w3m-account-view | `view-account-address-text`      | Account address             | `<w3m-address-text>`           |
| w3m-account-view | `view-account-connection-badge`  | Account connection status   | `<w3m-text>`                   |
| w3m-account-view | `view-account-balance`           | Account balance             | `<w3m-balance>`                |
| w3m-account-view | `view-account-footer`            | Account view footer         | `<w3m-modal-footer>`           |
| w3m-account-view | `view-account-network-button`    | Account view network button | `<w3m-account-network-button>` |
| w3m-account-view | `view-account-copy-button`       | Account address copy button | `<w3m-box-button>`             |
| w3m-account-view | `view-account-disconnect-button` | Account disconnect button   | `<w3m-box-button>`             |

| Desktop Connecting View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-desktop-connection-view | `view-desktop-connecting-header` | Header | `<w3m-modal-header>`|
| w3m-desktop-connection-view | `view-desktop-connecting-waiting` | Waiting indicator | `<w3m-connector-waiting>` |
| w3m-desktop-connection-view | `view-desktop-connecting-footer` | Footer | `<w3m-modal-footer>`|
| w3m-desktop-connection-view | `view-desktop-connecting-retry-button` | Retry failed connection | `<button>`|

| Get Wallet View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-get-wallet-view | `view-get-wallet-${wallet.id}` | Wallet content by id | `<div>` |
| w3m-get-wallet-view | `view-get-wallet-button-${wallet.id}` | Select wallet by id button | `<w3m-button>` |
| w3m-get-wallet-view | `view-get-wallet-explorer-button` | Open explorer button | `<w3m-button>` |

| Injected Connecting View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-injected-connecting-view | `view-injected-header` | Header | `<w3m-modal-header>` |
| w3m-injected-connecting-view | `view-injected-content` | Content | `<w3m-modal-content>` |
| w3m-injected-connecting-view | `view-injected-footer` | Footer | `<w3m-modal-footer>` |
| w3m-injected-connecting-view | `view-injected-retry-button` | Retry connection button | `<w3m-button>` |

| Install Wallet View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-install-wallet-view |`view-install-wallet-header` | Header| `<w3m-modal-header>` |
| w3m-install-wallet-view |`view-install-wallet-content` | Content| `<w3m-modal-content>` | 
| w3m-install-wallet-view |`view-install-wallet-footer` | Footer | `<w3m-modal-footer>` |
| w3m-install-wallet-view |`view-install-wallet-download-button` | Download wallet button| `<w3m-button>`|

| Mobile Connecting View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-mobile-connecting-view |`view-mobile-connecting-header` | Header| `<w3m-modal-header>` |
| w3m-mobile-connecting-view |`view-mobile-connecting-content` | Content| `<w3m-modal-content>` |
| w3m-mobile-connecting-view |`view-mobile-connecting-footer` | Footer | `<w3m-modal-footer>` |
| w3m-mobile-connecting-view |`view-mobile-connecting-app-store-button` | Open app app store to download | `<w3m-button>` |

| Mobile QR View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-mobile-qr-connecting-view |`view-mobile-qr-connecting-header` | Header| `<w3m-modal-header>` |
| w3m-mobile-qr-connecting-view |`view-mobile-qr-connecting-header` | Content| `<w3m-modal-content>` | 
| w3m-mobile-qr-connecting-view |`view-mobile-qr-connecting-header` | Footer | `<w3m-modal-footer>` |

| QR Code View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-qrcode-view |`view-qrcode-header` | Header| `<w3m-modal-header>` |
| w3m-qrcode-view |`view-qrcode-content` | Content| `<w3m-modal-content>` |

| Select Network View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-select-network-view |`view-select-network-header` | Header| `<w3m-modal-header>` |
| w3m-select-network-view |`view-select-network-content` | Content| `<w3m-modal-content>` |
| w3m-select-network-view |`view-select-network-button-${chain.id}` | Select chain by id | `<w3m-network-button>` |

| Switch Network View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-switch-network-view |`view-switch-network-header` | Header| `<w3m-modal-header>` |
| w3m-switch-network-view |`view-switch-network-content` | Content| `<w3m-modal-content>` |
| w3m-switch-network-view |`view-switch-network-footer` | Footer | `<w3m-modal-footer>` |
| w3m-switch-network-view |`view-switch-network-retry-button` | Retry network switch | `<w3m-button>` |

| Wallet Explorer View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-wallet-explorer-view |`view-wallet-explorer-header` | Header| `<w3m-modal-header>` |
| w3m-wallet-explorer-view |`view-wallet-explorer-content` | Content| `<w3m-modal-content>` |
| w3m-wallet-explorer-view |`view-wallet-explorer-input` | Search box | `<w3m-search-input>` |
| w3m-wallet-explorer-view | `view-wallet-explorer-button-${listings[index].id}` | Results of search | `<w3m-wallet-button>`

| Web Connecting View     | Id                     | Description          | Tag Type              |
| ----------------------- | ---------------------- | -------------------- | --------------------- |
| w3m-web-connecting-view |`view-web-connecting-header` | Header| `<w3m-modal-header>` |
| w3m-web-connecting-view |`view-web-connecting-content` | Content| `<w3m-modal-content>` |
| w3m-web-connecting-view |`view-web-connecting-footer` | Footer | `<w3m-modal-footer>` |
| w3m-web-connecting-view |`view-web-connecting-waiting` | Loading connecter element | `<w3m-connector-waiting>` |
| w3m-web-connecting-view |`view-web-connecting-retry-button` | Retry button | `<w3m-button>` |


<p align="center">
  <img src="./.github/assets/header.png" alt="" border="0">
</p>

## _Partials_ selectors

| Partials Name                | Id                                         | Description                            | Tag Type                      |
| ---------------------------- | ------------------------------------------ | -------------------------------------- | ----------------------------- |
| w3m-account-button           | `partial-account-avatar`                   | Account avatar                         | `<w3m-avatar>`                |
| w3m-account-button           | `partial-account-address`                  | Account address                        | `<w3m-address-text>`          |
| w3m-account-button           | `partial-account-balance`                  | Account balance                        | `<w3m-balance>`               |
| w3m-account-button           | `partial-account-open-button`              | Open account details button            | `<button>`                    |
| w3m-account-network-button   | `partial-account-network-button`           | Select network to use                  | `<button`                     |
| w3m-address-text             | `partial-account-text`                     | Account text                           | `<w3m-text>`                  |
| w3m-android-wallet-selection | `partial-android-wallet-button`            | Select wallet button                   | `<w3m-button-big>`            |
| w3m-android-wallet-selection | `partial-android-footer`                   | Footer with wallet grid                | `<w3m-modal-footer`           |
| w3m-android-wallet-selection | `partial-android-nowallet-button`          | "I dont have a..." button              | `<w3m-button>`                |
| w3m-avatar                   | `partial-avatar-image`                     | Accound avatar image                   | `<img>`                       |
| w3m-balance                  | `partial-balance-token-image`              | Current token image display            | `<w3m-token-image>`           |
| w3m-balance                  | `partial-balance-token-text`               | Current token amount display           | `<w3m-text>`                  |
| w3m-connect-button           | `partial-connect-button`                   | Connect button                         | `<w3m-button-big`             |
| w3m-connect-button           | `partial-connect-spinner`                  | Connect button spinner                 | `<w3m-spinner>`               |
| w3m-connect-button           | `partial-connect-text`                     | Connect button text                    | `<w3m-text>`                  |
| w3m-connector-waiting        | `partial-connector-wallet-image`           | Image on connect attemp                | `<w3m-wallet-iamge`           |
| w3m-connector-waiting        | `partial-connector-error-text`             | Error on connect text                  | `<w3m-text>`                  |
| w3m-core-button              | `partial-core-connect-button`              | Dis/Connect button                     | `<w3m-connect-button>`        |
| w3m-core-button              | `partial-core-account-button`              | Account details button                 | `<w3m-account-button>`        |
| w3m-desktop-wallet-selection | `partial-desktop-wallet-selection-header`  | DT select wallet header                | `<w3m-modal-header>`          |
| w3m-desktop-wallet-selection | `partial-desktop-wallet-selection-content` | Conect on DT select wallet             | `<w3m-modal-content>`         |
| w3m-desktop-wallet-selection | `partial-desktop-wallet-selection-footer`  | DT select wallet footer                | `<w3m-modal-footer>`          |
| w3m-mobile-wallet-selection  | `partial-mobile-wallet-selection-header`   | Mobile select wallet header            | `<w3m-modal-header>`          |
| w3m-mobile-wallet-selection  | `partial-mobile-wallet-selection-content`  | Mobile select wallet content           | `<w3m-modal-content>`         |
| w3m-modal                    | `partial-modal-explorer-context`           | Modal explorer context                 | `<w3m-explorer-context>`      |
| w3m-modal                    | `partial-modal-theme-context`              | Modal theme context                    | `<w3m-theme-context>`         |
| w3m-modal                    | `partial-modal-connection-context`         | Modal connection context               | `<w3m-wc-connection-context>` |
| w3m-modal                    | `partial-modal-account-context`            | Modal account context                  | `<w3m-account-context>`       |
| w3m-modal                    | `partial-modal-network-context`            | Modal network context                  | `<w3m-network-context>`       |
| w3m-network-switch           | `partial-network-switch-button`            | Switch networks button                 | `<w3m-button-big>`            |
| w3m-network-switch           | `partial-network-switch-image`             | Logo for switch networks button        | `<w3m-network-image>`         |
| w3m-network-switch           | `partial-network-switch-text`              | Text for switch networks button        | `<w3m-text>`                  |
| w3m-network-waiting          | `partial-network-waiting-image`            | SVG for switch networks loading        | `<svg>`                       |
| w3m-network-waiting          | `partial-network-waiting-svg`              | Image for switch networks loading      | `<w3m-network-image>`         |
| w3m-network-waiting          | `partial-network-waiting-text`             | Error text for switch networks loading | `<w3m-text>`                  |
| w3m-view-all-wallets         | `partial-all-wallets-button`               | Open all wallets display               | `<button>`                    |
| w3m-walletconnect-qr         | `partial-qr-code`                          | Qrcode for connection                  | `<w3m-qrcode>`                |
| w3m-walletconnect-qr         | `partial-qr-spinner`                       | Spinner for qr code loading            | `<w3m-spinner>`               |

<p align="center">
  <img src="./.github/assets/header.png" alt="" border="0">
</p>

## _Component_ selectors

| Component Name     | Id                               | Description           | Tag Type   |
| ------------------ | -------------------------------- | --------------------- | ---------- |
| w3m-button         | `component-button`               | W3M Button            | `<button>` |
| w3m-box-button     | `component-button-box`           | W3M Button Box        | `<button>` |
| w3m-button-big     | `component-button-big`           | W3M Button Big        | `<button>` |
| w3m-network-button | `component-network-button`       | Select network button | `<button>` |
| w3m-modal-header   | `component-header-action-button` | Action button         | `<button>` |
| w3m-modal-header   | `component-header-back-button`   | Back button           | `<button>` |
| w3m-wallet-button  | `component-wallet-button-{name.lowercase}`        | Select wallet button by name  | `<button>` |
| w3m-network-image  | `component-network-logo-svg`     | SVG of network logo   | `<svg>`    |
| w3m-qrcode         | `component-qrcode-svg`           | SVG of connect qrcode | `<svg>`    |
| w3m-spinner        | `component-spinner-svg`          | SVG of spinnger       | `<svg>`    |
| w3m-token-image    | `component-token-image`          | Token logo image      | `<img>`    |
| w3m-modal-toast    | `component-modal-toast`          | W3M Toast             | `<div>`    |
| w3m-text           | `component-text`                 | W3M Text              | `<span>`   |
| w3m-modal-content  | `component-modal-content`        | W3M Content           | `<main>`   |
| w3m-modal-footer   | `component-modal-footer`         | W3M Footer            | `<footer>` |
| w3m-modal-backcard   | `component-modal-backcard`         | W3M Backcard            | `<div>` |
| w3m-modal-backcard   | `backcard-help`         | Help Button on Backcard | `<button>` |
| w3m-modal-backcard   | `backcard-close`         | Close Button on Backcard           | `<buttong>` |