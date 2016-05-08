import { existsSync } from 'fs'
import { join } from 'path'
import serveFavicon from 'serve-favicon'

export const favicon =
  (app) => {
    const dirs = app.get('dirs')
    const faviconPath = join(dirs.public, 'favicon.ico')

    // fs.existsSync only gets called once on first request
    if (faviconPath && !app.get('faviconChecked') && !app.get('faviconExists')) {
      app.set('faviconChecked', true)
      app.set('faviconExists', existsSync(faviconPath))
    }

    if (app.get('faviconExists')) {
      app.use(serveFavicon(faviconPath))
    }
  }

export default favicon
