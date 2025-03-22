import { createSSEServer } from './src/createSSEServer.js'
import { server } from './src/server.js'

const sseServer = createSSEServer(server)

sseServer.listen(8081, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:8081`)
  /* eslint-enable no-console */
})
