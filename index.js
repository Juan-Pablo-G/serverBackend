require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const { ensureAdmin } = require("./lib/store");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const rootDir = path.join(__dirname, "..");

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(express.json({ limit: "20mb" }));

const imagesPath = path.join(rootDir, "images");
app.use("/images", express.static(imagesPath));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

if (process.env.NODE_ENV === "production") {
  const distPath = path.join(rootDir, "client", "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

async function start() {
  const email = process.env.ADMIN_EMAIL || "solanagranobles39@gmail.com";
  const password = process.env.ADMIN_PASSWORD || "solecito";
  await ensureAdmin(email, password);
  app.listen(PORT, () => {
    console.log(`API en http://localhost:${PORT}`);
    console.log(`Imágenes estáticas: /images → ${imagesPath}`);
    console.log(`Usuario admin por defecto: ${email} (cambia ADMIN_EMAIL / ADMIN_PASSWORD en .env)`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
