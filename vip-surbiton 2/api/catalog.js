const c = require("./_catalog");
module.exports = (req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({ confirmed: c.confirmed, pricesAreFrom: !!c.pricesAreFrom, items: c.items });
};
