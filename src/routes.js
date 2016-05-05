import { Router } from 'express'
import renderPage from './pages'

const noop = () => {}

const router = Router()

router.get('/', (req, res, next = noop) => {
  res.locals.page = 'index'
  renderPage(req, res, next)
})

router.get('/:page', renderPage)

export default router
