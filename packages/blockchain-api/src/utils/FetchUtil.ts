import type { SdkVersion } from '@reown/appkit-common'

import type { PostRequestArgs, RequestArgs } from '../types/index.js'

// -- Helper Functions ------------------------------------------
async function fetchData(...args: Parameters<typeof fetch>) {
  const response = await fetch(...args)
  if (!response.ok) {
    // Create error object and reject if not a 2xx response code
    const err = new Error(`HTTP status code: ${response.status}`, {
      cause: response
    })
    throw err
  }

  return response
}

// -- FetchUtil Class ------------------------------------------
export class FetchUtil {
  public baseUrl: string
  public clientId?: string
  public projectId?: string
  public sdkType?: string
  public sdkVersion?: string

  constructor({
    baseUrl,
    clientId,
    projectId,
    sdkType,
    sdkVersion
  }: {
    baseUrl: string
    clientId?: string
    projectId?: string
    sdkType?: string
    sdkVersion?: string
  }) {
    this.baseUrl = baseUrl
    this.clientId = clientId
    this.projectId = projectId
    this.sdkType = sdkType
    this.sdkVersion = sdkVersion
  }

  public setSdkParams(sdkType: string, sdkVersion: SdkVersion): void {
    this.sdkType = sdkType
    this.sdkVersion = sdkVersion
  }

  public async get<T>(args: RequestArgs): Promise<T> {
    const url = this.createUrl(args)
    const { headers, signal, cache } = args
    const response = await fetchData(url, { method: 'GET', headers, signal, cache })

    return response.json() as T
  }

  public async getBlob(args: RequestArgs): Promise<Blob> {
    const url = this.createUrl(args)
    const { headers, signal } = args
    const response = await fetchData(url, { method: 'GET', headers, signal })

    return response.blob()
  }

  public async post<T>(args: PostRequestArgs): Promise<T> {
    const url = this.createUrl(args)
    const { headers, signal, body } = args
    const response = await fetchData(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  public async put<T>(args: PostRequestArgs): Promise<T> {
    const url = this.createUrl(args)
    const { headers, signal, body } = args
    const response = await fetchData(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  public async delete<T>(args: PostRequestArgs): Promise<T> {
    const url = this.createUrl(args)
    const { headers, signal, body } = args
    const response = await fetchData(url, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  private createUrl(args: RequestArgs): URL {
    const { path, params = {} } = args
    const url = new URL(path, this.baseUrl)

    // Add any parameters provided
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, value)
      }
    })

    // Add client ID if available
    if (this.clientId && !url.searchParams.has('clientId')) {
      url.searchParams.append('clientId', this.clientId)
    }

    // Add project ID if available and not already in params
    if (this.projectId && !url.searchParams.has('projectId')) {
      url.searchParams.append('projectId', this.projectId)
    }

    return url
  }
}
