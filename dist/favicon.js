'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.favicon = undefined;

var _fs = require('fs');

var _path = require('path');

var _serveFavicon = require('serve-favicon');

var _serveFavicon2 = _interopRequireDefault(_serveFavicon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var favicon = exports.favicon = function favicon(app) {
  var dirs = app.get('dirs');
  var faviconPath = (0, _path.join)(dirs.public, 'favicon.ico');

  // fs.existsSync only gets called once on first request
  if (faviconPath && !app.get('faviconChecked') && !app.get('faviconExists')) {
    app.set('faviconChecked', true);
    app.set('faviconExists', (0, _fs.existsSync)(faviconPath));
  }

  if (app.get('faviconExists')) {
    app.use((0, _serveFavicon2.default)(faviconPath));
  }
};

exports.default = favicon;
//# sourceMappingURL=favicon.js.map