'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle500 = undefined;

var _magicServerLog = require('magic-server-log');

var _magicServerLog2 = _interopRequireDefault(_magicServerLog);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var handle500 = exports.handle500 = function handle500(err, req, res) {
  _magicServerLog2.default.error('500 called, err: ' + err);
  res.send('500 server error');
};

exports.default = handle500;
//# sourceMappingURL=handle500.js.map