'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initApi = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require('express');

var _pages = require('./pages');

var _magicTypes = require('magic-types');

var router = (0, _express.Router)();

var apiCb = function apiCb(err, req, res, next) {
  if (err) {
    res.locals.errors.apiError = err;
  } else {
    res.locals.success = true;
  }

  (0, _pages.renderPage)(req, res, next);
};

var initApi = exports.initApi = function initApi(apiOptions) {
  Object.keys(apiOptions).forEach(function (routeName) {
    console.log('rendering route ' + routeName);
    router.post('/' + routeName, function (req, res, next) {
      var _req$body = req.body;
      var body = _req$body === undefined ? {} : _req$body;
      var app = req.app;
      var _apiOptions$routeName = apiOptions[routeName];
      var handler = _apiOptions$routeName.handler;
      var model = _apiOptions$routeName.model;


      var db = app.get('db');
      if (!db || !(0, _magicTypes.isFunction)(db.find)) {
        throw new Error('\n                magic-api handler called with invalid db: ' + db + '\n                please use app.set(\'dbFile\') or app.set(\'db\')\n              ');
      }

      if ((0, _magicTypes.isFunction)(model)) {
        res.locals.errors = _extends({}, res.locals.errors, model(body));
      }

      res.locals = _extends({}, res.locals, body, {
        page: routeName
      });

      var hasErrored = Object.values(res.locals.errors).some(function (err) {
        return err;
      });

      if (hasErrored) {
        // catch request errors in the response before touching the api
        return apiCb(null, req, res, next);
      }

      handler(_extends({}, req, { db: db }), function (err) {
        return apiCb(err, req, res, next);
      });
    });
  });

  return router;
};

exports.default = initApi;
//# sourceMappingURL=api.js.map