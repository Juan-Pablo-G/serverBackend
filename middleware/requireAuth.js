const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: "No autorizado" });
  }
  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    req.user = jwt.verify(token, secret);
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido o expirado" });
  }
}

module.exports = { requireAuth };
