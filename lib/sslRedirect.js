'use strict';

module.exports = function sslRedirect(req, res, next) {
  if ( ! req.secure ) {
    return res.redirect(301, 'https://' + req.headers.host + req.url);
  }
  next();
}
