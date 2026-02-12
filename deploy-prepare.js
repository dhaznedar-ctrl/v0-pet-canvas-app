const fs = require('fs')
const path = require('path')

const standaloneDir = path.join(__dirname, '.next', 'standalone')

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`  [skip] ${src} does not exist`)
    return
  }

  const stat = fs.statSync(src)
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true })
    for (const entry of fs.readdirSync(src)) {
      copyRecursive(path.join(src, entry), path.join(dest, entry))
    }
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  }
}

console.log('[deploy-prepare] Preparing standalone build...\n')

if (!fs.existsSync(standaloneDir)) {
  console.error('[deploy-prepare] ERROR: .next/standalone not found. Run "npm run build" first.')
  process.exit(1)
}

// 1. Copy public/ -> .next/standalone/public/
console.log('[1/4] Copying public/ ...')
copyRecursive(
  path.join(__dirname, 'public'),
  path.join(standaloneDir, 'public')
)

// 2. Copy .next/static/ -> .next/standalone/.next/static/
console.log('[2/4] Copying .next/static/ ...')
copyRecursive(
  path.join(__dirname, '.next', 'static'),
  path.join(standaloneDir, '.next', 'static')
)

// 3. Copy server.js -> .next/standalone/
console.log('[3/4] Copying server.js ...')
fs.copyFileSync(
  path.join(__dirname, 'server.js'),
  path.join(standaloneDir, 'server.js')
)

// 4. Copy .htaccess -> .next/standalone/
console.log('[4/4] Copying .htaccess ...')
fs.copyFileSync(
  path.join(__dirname, '.htaccess'),
  path.join(standaloneDir, '.htaccess')
)

// 5. Copy .env.local if it exists (needed for production env vars)
const envLocal = path.join(__dirname, '.env.local')
if (fs.existsSync(envLocal)) {
  console.log('[5/6] Copying .env.local ...')
  fs.copyFileSync(envLocal, path.join(standaloneDir, '.env.local'))
}

// 6. Copy .env.production if it exists (VPS deployment)
const envProd = path.join(__dirname, '.env.production')
if (fs.existsSync(envProd)) {
  console.log('[6/6] Copying .env.production ...')
  fs.copyFileSync(envProd, path.join(standaloneDir, '.env.production'))
}

console.log('\n[deploy-prepare] Done! Standalone build ready at .next/standalone/')
console.log('[deploy-prepare] Upload the contents of .next/standalone/ to your hosting.')
