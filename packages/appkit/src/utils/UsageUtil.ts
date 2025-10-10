import { ApiController } from '@reown/appkit-controllers'

interface FetchUsageParameters {
  projectId: string
}
export const UsageUtil = {
  async fetchUsage({ projectId }: FetchUsageParameters) {
    try {
      const apiProjectConfig = await ApiController.fetchUsage()
    } catch (e) {
      console.warn(
        '[Reown Config] Failed to fetch remote project configuration. Using local/default values.',
        e
      )
    }
  }
}
