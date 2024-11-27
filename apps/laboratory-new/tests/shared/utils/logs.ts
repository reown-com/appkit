/* eslint no-console: 0 */

const TIMING_LOGS_ENABLED = process.env['TIMING_LOGS'] === 'true' || false

export function timeStart(label?: string | undefined) {
  if (!TIMING_LOGS_ENABLED) {
    return
  }
  console.time(label)
}

export function timeEnd(label?: string | undefined) {
  if (!TIMING_LOGS_ENABLED) {
    return
  }
  console.timeEnd(label)
}
