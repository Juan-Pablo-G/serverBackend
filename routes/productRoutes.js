const express = require("express");
const fs = require("fs");
const path = require("path");
const { requireAuth } = require("../middleware/requireAuth");
const {
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
} = require("../lib/store");

const router = express.Router();

const imagesPath = path.join(__dirname, "..", "..", "images");

router.get("/", (req, res) => {
  res.json(getProducts());
});

router.get("/:id", (req, res) => {
  const p = getProductById(req.params.id);
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(p);
});

router.post("/upload", requireAuth, async (req, res) => {
  try {
    const { filename, data } = req.body || {};
    if (!filename || !data) {
      return res.status(400).json({ error: "Nombre de archivo y datos base64 son requeridos" });
    }

    const rawFilename = path.basename(String(filename).trim());
    if (!rawFilename || rawFilename.includes("..")) {
      return res.status(400).json({ error: "Nombre de archivo inválido" });
    }

    const allowed = [".png", ".jpg", ".jpeg", ".gif", ".webp"];
    const ext = path.extname(rawFilename).toLowerCase();
    if (!allowed.includes(ext)) {
      return res.status(400).json({ error: "Extensión no permitida" });
    }

    const base64Match = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    const base64 = base64Match ? base64Match[2] : data;

    const outName = `${Date.now()}-${rawFilename}`;
    const outPath = path.join(imagesPath, outName);

    fs.writeFileSync(outPath, Buffer.from(base64, "base64"));
    res.json({ filename: outName });
  } catch (e) {
    res.status(500).json({ error: e.message || "Error al subir imagen" });
  }
});

router.post("/", requireAuth, (req, res) => {
  try {
    const { title, image, detailPath, subtitle, description } = req.body || {};
    if (!title || !image) {
      return res.status(400).json({ error: "Título e imagen (archivo) son obligatorios" });
    }
    const product = addProduct({ title, image, detailPath, subtitle, description });
    res.status(201).json(product);
  } catch (e) {
    res.status(400).json({ error: e.message || "Error al crear" });
  }
});

router.put("/:id", requireAuth, (req, res) => {
  try {
    const updated = updateProduct(req.params.id, req.body || {});
    if (!updated) return res.status(404).json({ error: "Producto no encontrado" });
    res.json(updated);
  } catch (e) {
    res.status(400).json({ error: e.message || "Error al actualizar" });
  }
});

router.delete("/:id", requireAuth, (req, res) => {
  const ok = deleteProduct(req.params.id);
  if (!ok) return res.status(404).json({ error: "Producto no encontrado" });
  res.status(204).send();
});

module.exports = router;
