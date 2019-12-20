const args = process.argv.slice(2)
let mode = args.length ? args[0] : ''
mode = mode.trim().toLocaleLowerCase()

// determine path to .env file
let envPath
if (mode) {
  if (mode === 'prod' || mode === 'one') {
    envPath = '.env.production'
  } else if (mode === 'dev') {
    envPath = '.env.development'
  } else {
    envPath = mode
  }
} else {
  envPath = '.env'
}

module.exports = { mode, envPath }