/* eslint no-console: 0 */

const isTimingLogsEnabled = process.env['TIMING_LOGS'] === 'true' || false

export function timeStart(label?: string | undefined) {
  if (!isTimingLogsEnabled) {
    return
  }
  console.time(label)
}

export function timeEnd(label?: string | undefined) {
  if (!isTimingLogsEnabled) {
    return
  }
  console.timeEnd(label)
}
