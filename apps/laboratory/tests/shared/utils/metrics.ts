import {
  CloudWatch,
  type MetricDatum,
  type PutMetricDataCommandInput
} from '@aws-sdk/client-cloudwatch'

// eslint-disable-next-line func-style
export const uploadCanaryResultsToCloudWatch = async (
  env: string,
  region: string,
  target: string,
  metricsPrefix: string,
  isTestPassed: boolean,
  testDurationMs: number
  // eslint-disable-next-line max-params
) => {
  const cloudwatch = new CloudWatch({ region: 'eu-central-1' })
  const ts = new Date()
  const metrics: MetricDatum[] = [
    {
      MetricName: `${metricsPrefix}.success`,
      Dimensions: [
        {
          Name: 'Target',
          Value: target
        },
        {
          Name: 'Region',
          Value: region
        }
      ],
      Unit: 'Count',
      Value: isTestPassed ? 1 : 0,
      Timestamp: ts
    },
    {
      MetricName: `${metricsPrefix}.failure`,
      Dimensions: [
        {
          Name: 'Target',
          Value: target
        },
        {
          Name: 'Region',
          Value: region
        }
      ],
      Unit: 'Count',
      Value: isTestPassed ? 0 : 1,
      Timestamp: ts
    }
  ]

  if (isTestPassed) {
    metrics.push({
      MetricName: `${metricsPrefix}.latency`,
      Dimensions: [
        {
          Name: 'Target',
          Value: target
        },
        {
          Name: 'Region',
          Value: region
        }
      ],
      Unit: 'Milliseconds',
      Value: testDurationMs,
      Timestamp: ts
    })
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
