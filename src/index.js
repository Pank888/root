import express from 'express';
import {Router as handler} from 'express';
import {log, warn, error} from 'magic-log';
import { page } from 'magic-pages';

export function handle404(req, res, next) {
  var app  = req.app
    , p404 = app.get('404page') || '404'
    , r404 = app.get('404redirect') || false
  ;
  if ( r404 ) {
    log(`magic-errorHandler r404 was set in host, redirect: ${r404}`);
    return res.redirect(r404);
  }

  warn(`404 error page called, page was: ${req.params.page}`);
  req.params.page = p404;
  res.status(404);
  page(req, res, (err) => {
    if ( err ) {
      error(`404 page template for host: ${req.hostname} not found`);
      return next(err);
    }
  });
}

export function handle500(err, req, res, next) {
  error(`500 called, err: ${err}`);
  res.send('500 server error');
}
