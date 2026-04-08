const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { findUserByEmail } = require("../lib/store");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }
  const allowed = (process.env.ADMIN_EMAIL || "solanagranobles39@gmail.com").toLowerCase().trim();
  if (email.toLowerCase().trim() !== allowed) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const user = findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "Credenciales incorrectas" });
  }
  const secret = process.env.JWT_SECRET || "dev-secret-change-me";
  const token = jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email } });
});

module.exports = router;
