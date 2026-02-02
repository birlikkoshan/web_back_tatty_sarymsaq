function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();

  // API requests get JSON
  if (req.path.startsWith("/api/") || req.originalUrl.startsWith("/api/")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  // pages redirect to login
  return res.redirect("/login");
}

module.exports = { requireAuth };
