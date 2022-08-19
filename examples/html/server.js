import express from 'express'
import path from 'path'

const __dirname = path.resolve()
const app = express()

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/packages/core/index.umd.js', (_req, res) => {
  res.sendFile(path.join(__dirname, '../../packages/core/dist/index.umd.js'))
})

app.listen(8080)
console.log(`👏 Server started on  http://localhost:8080`)
