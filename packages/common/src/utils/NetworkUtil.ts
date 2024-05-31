export const NetworkUtil = {
  caipNetworkIdToNumber(caipnetworkId?: `${string}:${string}`) {
    return caipnetworkId ? Number(caipnetworkId.split(':')[1]) : undefined
  }
}
