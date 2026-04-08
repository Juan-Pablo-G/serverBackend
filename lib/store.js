const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const bcrypt = require("bcryptjs");
const { seedProducts } = require("../seedData");

const dataDir = path.join(__dirname, "..", "data");
const dbPath = path.join(dataDir, "db.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
}

function readDb() {
  ensureDir();
  if (!fs.existsSync(dbPath)) {
    const products = seedProducts();
    const db = { users: [], products };
    writeDb(db);
    return db;
  }
  const raw = fs.readFileSync(dbPath, "utf8");
  return JSON.parse(raw);
}

function writeDb(db) {
  ensureDir();
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
}

/** Deja un único usuario autorizado (mismo correo que ADMIN_EMAIL). Actualiza el hash al arrancar. */
async function ensureAdmin(email, plainPassword) {
  const db = readDb();
  const normalized = email.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(plainPassword, 10);
  const prev = db.users.find((u) => u.email === normalized);
  const id = prev ? prev.id : randomUUID();
  db.users = [{ id, email: normalized, passwordHash }];
  writeDb(db);
}

function findUserByEmail(email) {
  const db = readDb();
  return db.users.find((u) => u.email === email.toLowerCase().trim());
}

function getProducts() {
  return readDb().products;
}

function getProductById(id) {
  return readDb().products.find((p) => p.id === id) || null;
}

function addProduct({ title, image, detailPath, subtitle, description }) {
  const db = readDb();
  const id = randomUUID();
  const rawPath = detailPath && String(detailPath).trim();
  let pathVal = `/obra/${id}`;

  if (rawPath) {
    const normalized = rawPath.startsWith("/") ? rawPath : `/${rawPath}`;
    if (normalized.startsWith("/obra/") || /^https?:\/\//i.test(normalized)) {
      pathVal = normalized;
    }
  }

  const product = {
    id,
    title: String(title).trim(),
    subtitle: String(subtitle || "").trim(),
    image: sanitizeImageName(image),
    detailPath: pathVal,
    description: String(description || "").trim(),
  };
  db.products.push(product);
  writeDb(db);
  return product;
}

function updateProduct(id, { title, subtitle, image, detailPath, description }) {
  const db = readDb();
  const i = db.products.findIndex((p) => p.id === id);
  if (i === -1) return null;
  if (title !== undefined) db.products[i].title = String(title).trim();
  if (image !== undefined && String(image).trim() !== "") {
    db.products[i].image = sanitizeImageName(image);
  }
  if (detailPath !== undefined) {
    const raw = String(detailPath).trim();
    if (!raw) {
      db.products[i].detailPath = `/obra/${id}`;
    } else {
      const normalized = raw.startsWith("/") ? raw : `/${raw}`;
      db.products[i].detailPath = normalized.startsWith("/obra/") || /^https?:\/\//i.test(normalized) ? normalized : `/obra/${id}`;
    }
  }
  if (subtitle !== undefined) {
    db.products[i].subtitle = String(subtitle).trim();
  }
  if (description !== undefined) {
    db.products[i].description = String(description).trim();
  }
  writeDb(db);
  return db.products[i];
}

function deleteProduct(id) {
  const db = readDb();
  const next = db.products.filter((p) => p.id !== id);
  if (next.length === db.products.length) return false;
  db.products = next;
  writeDb(db);
  return true;
}

/** Evita rutas con .. u otros caracteres peligrosos; solo nombre de archivo */
function sanitizeImageName(name) {
  const base = path.basename(String(name || "").trim());
  if (!base || base.includes("..")) throw new Error("Nombre de imagen inválido");
  return base;
}

module.exports = {
  readDb,
  ensureAdmin,
  findUserByEmail,
  getProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
};
