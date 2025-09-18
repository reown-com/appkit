// -- Types ----------------------------------------------------------------------
interface Options {
  baseUrl: string
  clientId: string | null
}

export interface RequestArguments {
  path: string
  headers?: HeadersInit
  params?: Record<string, string | undefined>
  cache?: RequestCache
  signal?: AbortSignal
}

interface PostArguments extends RequestArguments {
  body?: Record<string, unknown> | Record<string, unknown>[]
}

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

// -- Utility --------------------------------------------------------------------
export class FetchUtil {
  public baseUrl: Options['baseUrl']
  public clientId: Options['clientId']

  public constructor({ baseUrl, clientId }: Options) {
    this.baseUrl = baseUrl
    this.clientId = clientId
  }

  public async get<T>({ headers, signal, cache, ...args }: RequestArguments) {
    const url = this.createUrl(args)
    const response = await fetchData(url, { method: 'GET', headers, signal, cache })

    return response.json() as T
  }

  public async getBlob({ headers, signal, ...args }: RequestArguments) {
    const url = this.createUrl(args)
    const response = await fetchData(url, { method: 'GET', headers, signal })

    return response.blob()
  }

  public async post<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetchData(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  public async put<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetchData(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  public async delete<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetchData(url, {
      method: 'DELETE',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  private createUrl({ path, params }: RequestArguments) {
    const url = new URL(path, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value)
        }
      })
    }
    if (this.clientId) {
      url.searchParams.append('clientId', this.clientId)
    }

    return url
  }

  public sendBeacon({ body, ...args }: PostArguments) {
    const url = this.createUrl(args)

    return navigator.sendBeacon(url.toString(), body ? JSON.stringify(body) : undefined)
  }
}
