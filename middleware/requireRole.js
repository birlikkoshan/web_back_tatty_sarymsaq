function requireRole(...allowedRoles) {
  return function (req, res, next) {
    const role = req.session?.role;

    if (allowedRoles.includes(role)) return next();

    return res.status(403).json({ error: "Forbidden" });
  };
}

module.exports = { requireRole };
