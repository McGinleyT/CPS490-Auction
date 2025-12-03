import express from 'express'
import { postsRoutes } from './routes/posts.js'
import { userRoutes } from './routes/users.js'
import bodyParser from 'body-parser'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import { handleSocket } from './socket.js'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()

// Simple request logger to help diagnose 404/Not Found requests during development
app.use((req, res, next) => {
  try {
    console.info(`[backend] ${req.method} ${req.originalUrl}`)
  } catch (e) {
    // ignore logging errors
  }
  next()
})
app.use(bodyParser.json({ limit: '50mb', extended: true }))
app.use(
  bodyParser.urlencoded({
    limit: '50mb',
    extended: true,
    parameterLimit: 50000,
  }),
)
app.use(bodyParser.text({ limit: '200mb' }))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173')
  // Allow PATCH for partial updates and include common headers
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  )
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept',
  )
  // Allow credentials if frontend sends cookies/auth (optional)
  res.header('Access-Control-Allow-Credentials', 'true')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  next()
})

postsRoutes(app)
userRoutes(app)

const clientDist = path.resolve(__dirname, '../..', 'frontend', 'dist')
app.use(express.static(clientDist))

app.get('*', (req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'))
})

const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
  },
})
handleSocket(io)

export { server as app }
