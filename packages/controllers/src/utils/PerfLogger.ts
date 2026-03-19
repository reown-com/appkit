/* eslint-disable no-console */
/**
 * Performance logger using the native User Timing API (performance.mark / performance.measure).
 * These entries are visible in Lighthouse, Chrome DevTools Performance tab, and PerformanceObserver.
 * All marks are prefixed with "appkit:" for easy filtering.
 */

const PREFIX = 'appkit:'

function hasPerformanceApi(): boolean {
  return (
    typeof performance !== 'undefined' &&
    typeof performance.mark === 'function' &&
    typeof performance.measure === 'function'
  )
}

export const PerfLogger = {
  get enabled() {
    return hasPerformanceApi()
  },

  /** Record a named performance.mark */
  mark(label: string) {
    if (!hasPerformanceApi()) {
      return
    }
    const name = `${PREFIX}${label}`
    performance.mark(name)
    console.log(`[perf] ⏱ ${label}`)
  },

  /** Create a performance.measure between a start mark and now */
  measure(label: string, startLabel: string): number {
    if (!hasPerformanceApi()) {
      return 0
    }
    const startName = `${PREFIX}${startLabel}`
    const endName = `${PREFIX}${label}:end`
    const measureName = `${PREFIX}${label}`

    try {
      performance.mark(endName)
      const entry = performance.measure(measureName, startName, endName)
      console.log(`[perf] 📊 ${label}: ${entry.duration.toFixed(1)}ms`)

      return entry.duration
    } catch {
      console.warn(`[perf] measure failed: ${label} (missing start mark "${startLabel}")`)

      return 0
    }
  },

  /** Wrap an async function with automatic performance.mark + performance.measure */
  async wrapAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!hasPerformanceApi()) {
      return fn()
    }
    const startName = `${PREFIX}${label}:start`
    const endName = `${PREFIX}${label}:end`
    const measureName = `${PREFIX}${label}`

    performance.mark(startName)
    console.log(`[perf] ▶ ${label} started`)
    try {
      const result = await fn()
      performance.mark(endName)
      const entry = performance.measure(measureName, startName, endName)
      console.log(`[perf] ✅ ${label}: ${entry.duration.toFixed(1)}ms`)

      return result
    } catch (error) {
      performance.mark(endName)
      const entry = performance.measure(measureName, startName, endName)
      console.log(`[perf] ❌ ${label}: ${entry.duration.toFixed(1)}ms (error)`)
      throw error
    }
  },

  /** Print a summary table from all appkit: performance.measure entries */
  summary(groupName: string) {
    if (!hasPerformanceApi()) {
      return
    }

    const entries = performance.getEntriesByType('measure').filter(e => e.name.startsWith(PREFIX))

    if (entries.length === 0) {
      return
    }

    console.group(`[perf] 📋 ${groupName} — Performance Summary`)
    console.table(
      entries.map(e => ({
        Step: e.name.replace(PREFIX, ''),
        'Duration (ms)': e.duration.toFixed(1),
        'Start (ms)': e.startTime.toFixed(1)
      }))
    )

    const total = entries.reduce((sum, e) => sum + e.duration, 0)
    console.log(`Total measured time: ${total.toFixed(1)}ms`)
    console.groupEnd()
  },

  /** Clear all appkit: marks and measures */
  reset() {
    if (!hasPerformanceApi()) {
      return
    }
    performance.getEntriesByType('mark').forEach(e => {
      if (e.name.startsWith(PREFIX)) {
        performance.clearMarks(e.name)
      }
    })
    performance.getEntriesByType('measure').forEach(e => {
      if (e.name.startsWith(PREFIX)) {
        performance.clearMeasures(e.name)
      }
    })
  }
}
