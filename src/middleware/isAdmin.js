const isAdmin = async (req, res, next) => {
  if (req.get('is_admin') > 0) {
    return next();
  }
  return res.status(403).send({ message: 'This route is accessible only by admins' });
};
module.exports = { isAdmin };
