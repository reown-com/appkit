// -- Types ----------------------------------------------------------------------
interface Options {
  baseUrl: string
}

interface RequestArguments {
  path: string
  headers?: HeadersInit
  params?: Record<string, string | undefined>
  signal?: AbortSignal
}

interface PostArguments extends RequestArguments {
  body?: Record<string, unknown>
}

// -- Utility --------------------------------------------------------------------
export class FetchUtil {
  public baseUrl: Options['baseUrl']

  public constructor({ baseUrl }: Options) {
    this.baseUrl = baseUrl
  }

  public async get<T>({ headers, signal, ...args }: RequestArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, { method: 'GET', headers, signal, cache: 'no-cache' })

    return response.json() as T
  }

  public async getBlob({ headers, signal, ...args }: RequestArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, { method: 'GET', headers, signal })

    return response.blob()
  }

  public async post<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  public async put<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal
    })

    return response.json() as T
  }

  public async delete<T>({ body, headers, signal, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, {
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

    return url
  }
}
