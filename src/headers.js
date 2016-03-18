const noop = () => {};

// http header middleware function
export const headers =
  (req, res, next = noop) => {
    const app = req.app;
    const env = app.get('env') || 'production';
    const poweredBy = app.get('X-Powered-By') || 'Magic';
    const maxAge = app.get('maxAge') || 60 * 60 * 24 * 7; // default to 7 days

    if (env !== 'development') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('Expires', new Date(Date.now() + (maxAge * 1000)).toUTCString());
    }

    res.set('X-Powered-By', poweredBy);
    next();
  };

export default headers;
