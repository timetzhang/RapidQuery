/**
 * RapidQuery Main
 * by Timet Zhang
 */

module.exports = (req, res) => {
  if (JSON.stringify(req.body) != "{}") {
    this.query(JSON.parse(req.body.query)).then(data => {
      res.send(data);
    });
  }

  if (JSON.stringify(req.query) != "{}") {
    this.query(JSON.parse(req.query.query)).then(data => {
      res.send(data);
    });
  }
};
