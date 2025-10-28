import { CoreHelperUtil } from './CoreHelperUtil'

// -- Types --------------------------------------------- //
interface CreateTransakUrlParams {
  environment: string
  paymentMethod: string
  walletAddress: string
  exchangeScreenTitle: string
  disableWalletAddressForm: string
  cryptoCurrencyCode: string
  network: string
  colorMode: string
  fiatCurrencyCode: string
  fiatAmount: string
  productsAvailed: string
  widgetHeight: string
  widgetWidth: string
}

// -- Constants --------------------------------------------- //
const TRANSAK_URL = 'https://global-stg.transak.com/'

// -- Utils --------------------------------------------- //
export const OnRampUtil = {
  createTransakUrl({
    paymentMethod,
    walletAddress,
    exchangeScreenTitle,
    disableWalletAddressForm,
    cryptoCurrencyCode,
    network,
    colorMode,
    fiatCurrencyCode,
    fiatAmount,
    productsAvailed,
    widgetHeight,
    widgetWidth
  }: CreateTransakUrlParams) {
    const apiKey = '' // TODO: Handle this on API level

    const url =
      `${TRANSAK_URL}?` +
      `apiKey=${apiKey}` +
      `&paymentMethod=${paymentMethod}` +
      `&walletAddress=${walletAddress}` +
      `&exchangeScreenTitle=${exchangeScreenTitle}` +
      `&disableWalletAddressForm=${disableWalletAddressForm}` +
      `&network=${network}` +
      `&cryptoCurrencyCode=${cryptoCurrencyCode}` +
      `&countryCode=${'US'}` +
      `&colorMode=${colorMode}` +
      `&fiatCurrencyCode=${fiatCurrencyCode}` +
      `&fiatAmount=${fiatAmount}` +
      `&productsAvailed=${productsAvailed}` +
      `&widgetHeight=${widgetHeight}` +
      `&widgetWidth=${widgetWidth}` +
      `&defaultFiatAmount=${fiatAmount}` +
      `hideExchangeScreen=true`

    return url
  },
  openTransak(url: string) {
    CoreHelperUtil.returnOpenHref(url, 'popupWindow', 'width=600,height=800,scrollbars=yes')
  }
}
