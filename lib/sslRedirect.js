'use strict';

module.exports = function sslRedirect(req, res, next) {
  if ( ! req.secure ) {
    return res.redirect('https://' + req.hostname + req.path);
  }
  next();
}
