// Starts a local PostgreSQL server for development using `embedded-postgres`,
// so no system-wide PostgreSQL install (or admin rights) is needed.
// Credentials/port/database are read from DATABASE_URL in backend/.env.
import 'dotenv/config'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import EmbeddedPostgres from 'embedded-postgres'

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(backendDir, '.pgdata')

const url = new URL(process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/lifequest')
const user = decodeURIComponent(url.username || 'postgres')
const password = decodeURIComponent(url.password || 'postgres')
const port = Number(url.port || 5432)
const database = url.pathname.replace(/^\//, '') || 'lifequest'

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user,
  password,
  port,
  persistent: true,
  onLog: () => {},
  onError: (msg) => console.error(String(msg)),
})

const firstRun = !existsSync(path.join(dataDir, 'PG_VERSION'))
if (firstRun) {
  console.log(`Initialising PostgreSQL data directory at ${dataDir} ...`)
  await pg.initialise()
}

await pg.start()
if (firstRun) await pg.createDatabase(database)
console.log(`PostgreSQL ready on localhost:${port} (database "${database}", user "${user}"). Press Ctrl+C to stop.`)

const shutdown = async () => {
  console.log('\nStopping PostgreSQL ...')
  await pg.stop()
  process.exit(0)
}
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
