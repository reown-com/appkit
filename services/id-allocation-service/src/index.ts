import { Hono } from 'hono'
import type { DurableObjectNamespace } from '@cloudflare/workers-types'
import { DurableObject } from 'cloudflare:workers'

export type Bindings = {
  ID_ALLOCATION: DurableObjectNamespace<IdAllocation>
}

const app = new Hono<{ Bindings: Bindings }>()

type Ids = { [key: number]: number }

export class IdAllocation extends DurableObject {
  async allocateId(): Promise<number> {
    const now = Date.now()
    const ids: Ids = JSON.parse((await this.ctx.storage.get('ids')) || '{}')
    for (let id = 0; ; id++) {
      const exp = ids[id]
      const isFree = exp === undefined || exp < now
      if (isFree) {
        ids[id] = now + 1000 * 60 * 5
        await this.ctx.storage.put('ids', JSON.stringify(ids))
        return id
      }
    }
  }
}

app.get('/allocate', async c => {
  const objId = c.env.ID_ALLOCATION.idFromName('id-allocation')
  const obj = c.env.ID_ALLOCATION.get(objId)
  const id = await obj.allocateId()
  return c.json({ id: id })
})

export default app
