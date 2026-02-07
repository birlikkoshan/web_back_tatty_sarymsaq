function requireRole(...allowedRoles) {
  return function (req, res, next) {
    const role = req.session?.role;

    if (allowedRoles.includes(role)) return next();

    return res.status(403).json({ error: "Not accessible for your role" });
  };
}

module.exports = { requireRole };
