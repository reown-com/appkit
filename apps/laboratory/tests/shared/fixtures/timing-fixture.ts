import { test as base } from '@playwright/test'

export type TimingRecords = { item: string; timeMs: number }[]

export interface TimingFixture {
  timingRecords: TimingRecords
}

export const timingFixture = base.extend<TimingFixture>({
  /*
   * Fixes intermittent timingRecords.push is not a function error by properly defining
   * the timingRecords fixture using a fixture function. Ensures each test gets a fresh
   * array instance.
   */
  // eslint-disable-next-line no-empty-pattern
  timingRecords: async ({}, use) => {
    await use([])
  }
})
