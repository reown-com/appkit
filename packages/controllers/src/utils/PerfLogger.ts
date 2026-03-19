/* eslint-disable no-console */
/**
 * Lightweight performance logger for diagnosing AppKit initialization timing.
 * Gated behind `localStorage.getItem('appkit:perf') === 'true'` so it's zero-cost in production.
 */

type TimingEntry = {
  label: string
  startMs: number
  endMs?: number
  durationMs?: number
}

const enabled = true

const marks = new Map<string, number>()
const timings: TimingEntry[] = []

function now(): number {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now()
  }

  return Date.now()
}

export const PerfLogger = {
  get enabled() {
    return enabled
  },

  /** Record a named timestamp */
  mark(label: string) {
    if (!enabled) {
      return
    }
    const t = now()
    marks.set(label, t)
    console.log(`[perf] ⏱ ${label} @ ${t.toFixed(1)}ms`)
  },

  /** Measure elapsed time between two marks */
  measure(label: string, startLabel: string): number {
    if (!enabled) {
      return 0
    }
    const start = marks.get(startLabel)
    const end = now()
    if (start === undefined) {
      console.warn(`[perf] missing start mark: ${startLabel}`)

      return 0
    }
    const duration = end - start
    timings.push({ label, startMs: start, endMs: end, durationMs: duration })
    console.log(`[perf] 📊 ${label}: ${duration.toFixed(1)}ms`)

    return duration
  },

  /** Wrap an async function with automatic timing */
  async wrapAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!enabled) {
      return fn()
    }
    const start = now()
    console.log(`[perf] ▶ ${label} started`)
    try {
      const result = await fn()
      const duration = now() - start
      timings.push({ label, startMs: start, endMs: start + duration, durationMs: duration })
      console.log(`[perf] ✅ ${label}: ${duration.toFixed(1)}ms`)

      return result
    } catch (error) {
      const duration = now() - start
      timings.push({ label, startMs: start, endMs: start + duration, durationMs: duration })
      console.log(`[perf] ❌ ${label}: ${duration.toFixed(1)}ms (error)`)
      throw error
    }
  },

  /** Print a summary table of all collected timings */
  summary(groupName: string) {
    if (!enabled || timings.length === 0) {
      return
    }

    console.group(`[perf] 📋 ${groupName} — Performance Summary`)
    console.table(
      timings.map(t => ({
        Step: t.label,
        'Duration (ms)': t.durationMs?.toFixed(1) ?? '—',
        'Start (ms)': t.startMs.toFixed(1),
        'End (ms)': t.endMs?.toFixed(1) ?? '—'
      }))
    )

    const total = timings.reduce((sum, t) => sum + (t.durationMs || 0), 0)
    console.log(`Total measured time: ${total.toFixed(1)}ms`)
    console.groupEnd()
  },

  /** Clear all marks and timings (useful between runs) */
  reset() {
    marks.clear()
    timings.length = 0
  }
}
