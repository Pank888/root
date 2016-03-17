export const handle500 =
  (err, req, res) => {
    log.error(`500 called, err: ${err}`);
    res.send('500 server error');
  };

export default handle500;
