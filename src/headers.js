const noop = () => {}

// http header middleware function
export const headers =
  ({ app = {}}, res, next = noop) => {
    const env = app.get('env') || 'production'
    const poweredBy = app.get('X-Powered-By') || 'Magic'
    const maxAge = app.get('maxAge') || 60 * 60 * 24 * 7 // default to 7 days
    const appHeaders = app.get('headers') || {}

    let headers = {}

    if (env !== 'development') {
      headers['Expires'] = new Date(Date.now() + (maxAge * 1000)).toUTCString()
      headers['Cache-Control'] = `public, max-age=${maxAge}`
    }

    headers['X-Powered-By'] = poweredBy
    headers['server'] = poweredBy

    headers = {
      ...headers,
      ...appHeaders,
    }

    Object.keys(headers).forEach(
      key =>
        res.set(key, headers[key])
    )

    next()
  }

export default headers
