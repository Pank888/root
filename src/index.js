import express from 'express'
import basicAuth from 'node-basicauth'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import babelify from 'express-babelify-middleware'
import { join } from 'path'
import favicon from './favicon'
import stylus from 'stylus'
import nib from 'nib'
import Nedb from 'nedb'
import { Mailgun } from 'mailgun'

import { isArray, isString } from 'magic-types'

import appRoutes, { customRoutes } from './routes'
import initApi from './api'
import initiateLogging from './logging'
import headers from './headers'
import handle404 from './errors/handle404'
import handle500 from './errors/handle500'

// import { init as initAdmin } from 'magic-admin';
// import blog from 'magic-blog';

export { renderPage } from './pages'

export const conjure =
  () =>
    express()

export const Express = express

export const Router = express.Router

const start =
  ({ app, port }) => {
    app.listen(port, err => {
      const log = app.get('logger')
      if (err) {
        log.error(err)
      }

      log.info(`app listening to port ${port}`)
    })
  }

export const Magic = app => {
  const dir = app.get('cwd') || join(process.cwd(), 'src')
  const env = app.get('env') || 'production'
  const publicDir = app.get('publicDir') || join('client', 'public')
  const viewDir = app.get('viewDir') || join('client', 'views')
  const logDir = app.get('logDir') || join('..', 'logs')
  const appDirs = app.get('dirs')
  const basicAuthConfig = app.get('basicAuth')
  const port = app.get('port') || 1337
  const viewEngine = app.get('view engine') || 'pug'
  const babelifyFiles = app.get('babelifyFiles')
  const dirs = {
    root: dir,
    public: join(dir, publicDir),
    views: join(dir, viewDir),
    logs: join(dir, logDir),
    ...appDirs,
  }

  // set req.app and req.db to use in middleware
  app.use(
    (req, res, next) => {
      req.app = app
      req.db = db

      next()
    }
  )

  const dbFile = app.get('dbFile') || false
  const mailgunApiKey = app.get('mailgunApiKey') || false

  app.set('dirs', dirs)

  favicon(app)

  app.set('views', dirs.views)
  app.set('view engine', viewEngine)

  app.use(compression({ threshold: 128 }))

  // initiate nedb if defined
  let db
  if (dbFile) {
    db = new Nedb({
      filename: dbFile,
      autoload: true,
    })
    app.set('db', db)
  }

  // initiate mailgun if defined
  if (mailgunApiKey) {
    app.set('mg', new Mailgun(mailgunApiKey))
  }

  // set expiry and custom headers
  app.use(headers)

  // enable http basicAuth
  if (basicAuthConfig) {
    app.use(basicAuth(basicAuthConfig))
  }

  const css = app.get('css') || stylus
  app.set('css', css)

  const cssMiddleware =
    (str, path) =>
      css(str)
        .set('filename', path)
        .set('compress', env === 'production')
        .use(nib())
        .import('nib')

  app.use(css.middleware({
    src: dirs.public,
    maxage: '1d',
    compile: cssMiddleware,
  }))

  if (isString(babelifyFiles) || isArray(babelifyFiles)) {
    [].concat(babelifyFiles).forEach(
      f => {
        // Precompile a browserified file at a path
        const fileUrl = `/js/${f}.js`
        const bundleUrl = `${dirs.public}/js/${f}/index.js`

        app.use(fileUrl, babelify(bundleUrl))
      }
    )
  }

  app.use(express.static(join(__dirname, 'public'), { maxAge: '1w' }))

  app.use(express.static(dirs.public, { maxAge: '1d' }))

  // if (app.enabled('admin')) {
  //   app.use(initAdmin);
  // }

  /*
  // Blog Middleware
  if (app.get('blogRoot')) {
    let blogRoot = app.get('blogRoot');
    if (typeof blogRoot !== 'string' && typeof blogRoot !== 'number') {
      blogRoot = 'blog';
    }
    if (blogRoot.charAt(0) !== '/') {
      blogRoot = '/' + blogRoot;
    } else {
      app.set('blogRoot', blogRoot.substr(1));
    }
    app.use(blogRoot, blog);
  }
  */

  initiateLogging(app)

  // if host sets bodyparser to true, init it
  if (app.enabled('bodyParser')) {
    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
  }

  // if host sets cookieparser to true, init it:
  if (app.enabled('cookieParser')) {
    app.use(cookieParser())
  }

  // initiate api if defined
  const apiRoutes = app.get('api')
  if (apiRoutes) {
    app.use(initApi(apiRoutes))
  }

  customRoutes(app)

  // default router
  app.use(appRoutes)

  // we are in a 404 error
  app.use(handle404)

  // oops, worst case fallback, 500 server error.
  app.use(handle500)

  start({ app, port })

  return app
}

export default Magic
