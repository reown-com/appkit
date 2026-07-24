export const QUARANTINE_TAG = '@quarantine'

export function getQuarantineAnnotation(clusterId: string) {
  return {
    tag: QUARANTINE_TAG,
    annotation: { type: 'known-issue-cluster', description: clusterId }
  }
}
