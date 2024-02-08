import { CloudWatch, PutMetricDataCommandInput } from '@aws-sdk/client-cloudwatch'

export const uploadCanaryResultsToCloudWatch = async (
  env: string,
  region: string,
  target: string,
  metricsPrefix: string,
  isTestPassed: boolean,
  testDurationMs: number,
  otherLatencies: object[]
) => {
  const cloudwatch = new CloudWatch({ region: 'eu-central-1' })
  const ts = new Date()
  const metrics = [
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

  const latencies = otherLatencies.map(metric => {
    const metricName: string = Object.keys(metric)[0] as string
    return {
      MetricName: `${metricsPrefix}.${metricName}`,
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
      Value: metric[metricName],
      Timestamp: ts
    }
  })

  const params: PutMetricDataCommandInput = {
    MetricData: [...metrics, ...latencies],
    Namespace: `${env}_Canary_Web3Modal`
  }

  await new Promise<void>(resolve => {
    cloudwatch.putMetricData(params, function (err: Error) {
      if (err) {
        console.error('Failed to upload metrics to CloudWatch', err, err.stack)
        // Swallow error as
        // Test shouldn't fail despite CW failing
        // we will report on missing metrics
      }
      resolve()
    })
  })
}
