import { Router } from 'express';
import { page } from './pages';

const noop = () => {};

var router = Router();

router.get('/', (req, res, next = noop) => {
  res.locals.page = 'index';
  page(req, res, next);
});

router.get('/:page', page);

export default router;
