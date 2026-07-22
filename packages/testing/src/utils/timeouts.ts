import { MAXIMUM_WAIT_CONNECTIONS } from '../constants/timeouts.js'

export function getMaximumWaitConnections(): number {
  if (process.env['CI']) {
    return MAXIMUM_WAIT_CONNECTIONS * 1.5
  }

  return MAXIMUM_WAIT_CONNECTIONS
}
