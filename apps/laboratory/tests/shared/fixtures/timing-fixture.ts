import { test as base } from '@playwright/test'

export type TimingRecords = { item: string; timeMs: number }[]

export interface TimingFixture {
  timingRecords: TimingRecords
}

export const timingFixture = base.extend<TimingFixture>({
  timingRecords: []
})
