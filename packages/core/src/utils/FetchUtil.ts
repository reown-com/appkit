// -- Types ----------------------------------------------------------------------
interface Options {
  baseUrl: string
}

interface RequestArguments {
  path: string
  params?: Record<string, unknown>
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

  public async get<T>(args: RequestArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, { method: 'GET' })

    return response.json() as T
  }

  public async post<T>({ body, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    })

    return response.json() as T
  }

  public async put<T>({ body, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })

    return response.json() as T
  }

  public async delete<T>({ body, ...args }: PostArguments) {
    const url = this.createUrl(args)
    const response = await fetch(url, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined
    })

    return response.json() as T
  }

  private createUrl({ path, params }: RequestArguments) {
    const url = new URL(path, this.baseUrl)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    return url
  }
}
