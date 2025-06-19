import { AddressPurpose as SatsConnectAddressPurpose } from 'sats-connect'

// eslint-disable-next-line no-shadow
export enum AddressPurpose {
  Ordinal = 'ordinal',
  Payment = 'payment',
  Stacks = 'stx'
}
export function mapSatsConnectAddressPurpose(
  purpose: SatsConnectAddressPurpose
): AddressPurpose | undefined {
  switch (purpose) {
    case SatsConnectAddressPurpose.Payment:
      return AddressPurpose.Payment
    case SatsConnectAddressPurpose.Ordinals:
      return AddressPurpose.Ordinal
    case SatsConnectAddressPurpose.Stacks:
      return AddressPurpose.Stacks
    default:
      return undefined
  }
}
