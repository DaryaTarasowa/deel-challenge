const isAdmin = async (req, res, next) => {
  if (!req.get('is_admin')) return res.status(403).end();
  return next();
};
module.exports = { isAdmin };
