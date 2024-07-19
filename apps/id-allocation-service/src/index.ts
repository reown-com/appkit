import { Hono } from 'hono'
import type { KVNamespace } from '@cloudflare/workers-types'

export type Bindings = {
  ID_ALLOCATION: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

type Ids = { [key: number]: number }

app.get('/allocate', async c => {
  const now = Date.now()
  const ids: Ids = JSON.parse((await c.env.ID_ALLOCATION.get('ids')) || '{}')
  for (let id = 0; ; id++) {
    const exp = ids[id]
    const isFree = exp === undefined || exp < now
    if (isFree) {
      ids[id] = now + 1000 * 60
      await c.env.ID_ALLOCATION.put('ids', JSON.stringify(ids))
      return c.json({ id: id })
    }
  }
})

export default app
