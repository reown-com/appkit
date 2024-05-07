import {
  CloudWatch,
  type MetricDatum,
  type PutMetricDataCommandInput
} from '@aws-sdk/client-cloudwatch'
import type { TimingRecords } from '../fixtures/timing-fixture'

// eslint-disable-next-line func-style
export const uploadCanaryResultsToCloudWatch = async (
  env: string,
  region: string,
  target: string,
  metricsPrefix: string,
  isTestPassed: boolean,
  testDurationMs: number,
  timingRecords: TimingRecords
  // eslint-disable-next-line max-params
) => {
  const cloudwatch = new CloudWatch({ region: 'eu-central-1' })
  const Dimensions = [
    {
      Name: 'Target',
      Value: target
    },
    {
      Name: 'Region',
      Value: region
    }
  ]
  const Timestamp = new Date()
  const metrics: MetricDatum[] = [
    {
      MetricName: `${metricsPrefix}.success`,
      Dimensions,
      Unit: 'Count',
      Value: isTestPassed ? 1 : 0,
      Timestamp
    },
    {
      MetricName: `${metricsPrefix}.failure`,
      Dimensions,
      Unit: 'Count',
      Value: isTestPassed ? 0 : 1,
      Timestamp
    }
  ]

  if (isTestPassed) {
    metrics.push({
      MetricName: `${metricsPrefix}.latency`,
      Dimensions,
      Unit: 'Milliseconds',
      Value: testDurationMs,
      Timestamp
    })

    for (const record of timingRecords) {
      metrics.push({
        MetricName: `${metricsPrefix}.timing.${record.item}`,
        Dimensions,
        Unit: 'Milliseconds',
        Value: record.timeMs,
        Timestamp
      })
    }
  }

  const params: PutMetricDataCommandInput = {
    MetricData: metrics,
    Namespace: `${env}_Canary_Web3Modal`
  }

  await new Promise<void>(resolve => {
    cloudwatch.putMetricData(params, (err: Error) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to upload metrics to CloudWatch', err, err.stack)
      }
      resolve()
    })
  })
}
