import { MAXIMUM_WAIT_CONNECTIONS } from '../constants/timeouts'

export function getMaximumWaitConnections(): number {
  if (process.env['CI']) {
    return MAXIMUM_WAIT_CONNECTIONS
  }

  return MAXIMUM_WAIT_CONNECTIONS * 2
}
