const { createServer } = require('http')
const { parse } = require('url')
const path = require('path')
const fs = require('fs')

// Load env files: .env.local takes priority, then .env.production
function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return false
  const lines = fs.readFileSync(filePath, 'utf8').split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim()
    if (!process.env[key] && value) {
      process.env[key] = value
    }
  }
  return true
}

if (!process.env.DATABASE_URL) {
  const localEnv = path.join(__dirname, '.env.local')
  const prodEnv = path.join(__dirname, '.env.production')
  if (loadEnvFile(localEnv)) {
    console.log('[server] Loaded .env.local')
  }
  if (loadEnvFile(prodEnv)) {
    console.log('[server] Loaded .env.production')
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const next = require('next')
const app = next({ dev: false, dir: __dirname })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Phusion Passenger sends port via process.env.PORT
  // It may also use a Unix socket via process.env.PASSENGER_SOCKET
  const socketPath = process.env.PASSENGER_SOCKET
  const port = process.env.PORT || 3000
  const host = process.env.HOST || '0.0.0.0'

  if (socketPath) {
    // Remove stale socket file if exists
    if (fs.existsSync(socketPath)) {
      fs.unlinkSync(socketPath)
    }
    server.listen(socketPath, () => {
      console.log(`[server] Listening on socket ${socketPath}`)
    })
  } else {
    server.listen(port, host, () => {
      console.log(`[server] Listening on http://${host}:${port}`)
    })
  }

  // Graceful shutdown
  const shutdown = (signal) => {
    console.log(`[server] ${signal} received, shutting down...`)
    server.close(() => {
      console.log('[server] Server closed')
      process.exit(0)
    })
    // Force exit after 10 seconds
    setTimeout(() => {
      console.error('[server] Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
})
