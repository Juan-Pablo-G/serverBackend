/** Datos iniciales equivalentes al index.html original (solo título e imagen) */
const { randomUUID } = require("crypto");

function withIds(products) {
  return products.map((p) => {
    const id = randomUUID();
    return {
      id,
      title: p.title,
      image: p.image,
      detailPath: `/obra/${id}`,
    };
  });
}

const raw = [
  { title: "Ejemplo Producto", image: "pla1.png", description: "Descripción de ejemplo 1" },
  { title: "Ejemplo Producto", image: "pla2.png", description: "Descripción de ejemplo 2" },
  { title: "Ejemplo Producto", image: "pla3.png", description: "Descripción de ejemplo 3" },
  { title: "Ejemplo Producto", image: "pla4.png", description: "Descripción de ejemplo 4" },
  { title: "Ejemplo Producto", image: "pla5.png", description: "Descripción de ejemplo 5" },
  { title: "Ejemplo Producto", image: "pla6.png", description: "Descripción de ejemplo 6" },
  { title: "Ejemplo Producto", image: "pla7.png", description: "Descripción de ejemplo 7" },
  { title: "Ejemplo Producto", image: "pla8.png", description: "Descripción de ejemplo 8" },
  { title: "Ejemplo Producto", image: "pla9.png", description: "Descripción de ejemplo 9" },
  { title: "Ejemplo Producto", image: "pla10.png", description: "Descripción de ejemplo 10" },
  { title: "Ejemplo Producto", image: "pla11.png", description: "Descripción de ejemplo 11" },
  { title: "Ejemplo Producto", image: "pla12.png", description: "Descripción de ejemplo 12" },
];

module.exports = {
  seedProducts: () => withIds(raw),
};
