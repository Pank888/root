import { Router } from 'express'
import { isIterable, isString, isFunction } from 'magic-types'
import renderPage from './pages'

const noop = () => {}

const router = Router()

router.get('/', (req, res, next = noop) => {
  res.locals.page = 'index'
  renderPage(req, res, next)
})

router.get('/:page', renderPage)

export default router

export const customRoutes =
  (app) => {
    const routes = app.get('routes')

    // load host specific router
    if (routes) {
      if (isIterable(routes)) {
        Object.keys(routes).forEach(
          key => {
            const route = routes[key]
            const { path, handler, method = 'get' } = route

            const isValidMethod = ['get', 'post'].some(v => v === method)
            if (!isValidMethod) {
              throw new Error(`Route method of type ${method} is not valid`)
            }

            if (!isString(path)) {
              throw new Error(`Route needs a path string to work ${route}`)
            }

            if (!isFunction(handler)) {
              throw new Error(`Route needs a handler function to work ${route}`)
            }

            app[method](path, handler)
          }
        )
      }
      else if (isFunction(routes)) {
        app.use(routes)
      }
    }
  }
