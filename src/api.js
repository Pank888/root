import { Router } from 'express'
import { renderPage } from './pages'
import { isFunction } from 'magic-types'

const router = Router()

const apiCb =
  (err, req, res, next) => {
    if (err) {
      res.locals.errors.apiError = err
    }
    else {
      res.locals.success = true
    }

    renderPage(req, res, next)
  }

export const initApi =
  (apiOptions) => {
    Object.keys(apiOptions).forEach(
      (routeName) => {
        console.log(`rendering route ${routeName}`)
        router.post(
          `/${routeName}`,
          (req, res, next) => {
            const { body = {}, app } = req
            const { handler, model } = apiOptions[routeName]

            const db = app.get('db')
            if (!db || !isFunction(db.find)) {
              throw new Error(`
                magic-api handler called with invalid db: ${db}
                please use app.set('dbFile') or app.set('db')
              `)
            }

            if (isFunction(model)) {
              res.locals.errors = {
                ...res.locals.errors,
                ...model(body),
              }
            }

            res.locals = {
              ...res.locals,
              ...body,
              page: routeName,
            }

            const hasErrored = Object.values(res.locals.errors).some(err => err)

            if (hasErrored) {
              // catch request errors in the response before touching the api
              return apiCb(null, req, res, next)
            }

            handler(
              { ...req, db },
              (err) => apiCb(err, req, res, next)
            )
          }
        )
      }
    )

    return router
  }

export default initApi
