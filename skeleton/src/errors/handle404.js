import log from 'magic-server-log';
import { page } from './pages';

const noop = () => {};

export const handle404 =
  (req, res, next = noop) => {
    const app = req.app;
    const p404 = app.get('404page') || '404';
    const r404 = app.get('404redirect') || false;

    log.warn(`404 error page called, page was: ${req.params.page}`);

    if (r404) {
      log(`magic-errorHandler r404 was set in host, redirect: ${r404}`);
      return res.redirect(r404);
    }

    req.params.page = p404;
    res.status(404);

    page(req, res, err => {
      if (err) {
        log.error(`404 page template for host: ${req.hostname} not found`);
        return next(err);
      }
    });
  };

export default handle404;
