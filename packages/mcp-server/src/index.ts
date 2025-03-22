import { createSSEServer } from './createSSEServer.js'
import { server } from './server.js'

const sseServer = createSSEServer(server)

sseServer.listen(3000)
