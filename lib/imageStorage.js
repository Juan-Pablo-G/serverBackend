const fs = require("fs");
const path = require("path");

const serverRoot = path.join(__dirname, "..");
const projectRoot = path.join(serverRoot, "..");
const primaryImagesPath = path.join(serverRoot, "images");
const legacyImagesPath = path.join(projectRoot, "images");

function ensureImagesDir() {
  if (!fs.existsSync(primaryImagesPath)) {
    fs.mkdirSync(primaryImagesPath, { recursive: true });
  }
}

function getStaticImageDirs() {
  ensureImagesDir();
  const dirs = [primaryImagesPath];
  if (legacyImagesPath !== primaryImagesPath && fs.existsSync(legacyImagesPath)) {
    dirs.push(legacyImagesPath);
  }
  return dirs;
}

module.exports = {
  ensureImagesDir,
  getStaticImageDirs,
  primaryImagesPath,
  legacyImagesPath,
};
