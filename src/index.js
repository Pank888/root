import express from 'express';
import {page} from 'magic-view';

var router = express.Router();

router.get('/', function (req, res, next) {
  res.locals.page = 'index';
  page(req, res, next);
});

router.get('/:page', page);

export default router;
