import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'

const versionedWorker: Plugin = {
  name: 'mylifeos-worker-version',
  apply: 'build',
  generateBundle(_options, bundle) {
    const revision = createHash('sha256').update(Object.keys(bundle).sort().join('|')).digest('hex').slice(0, 12)
    const source = readFileSync(new URL('./public/sw.js', import.meta.url), 'utf8')
      .replace('mylifeos-public-v1', `mylifeos-public-${revision}`)
    this.emitFile({ type: 'asset', fileName: 'sw.js', source })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), versionedWorker],
})
