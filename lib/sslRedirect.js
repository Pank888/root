'use strict';

module.exports = function sslRedirect(req, res, next) {
  if ( req.protocol !== 'https') {
    return res.redirect('https://' + req.hostname + req.path);
  }
  next();
}
