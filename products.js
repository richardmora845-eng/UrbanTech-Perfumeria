/*
========================================================
URBANTECH PERFUMERÍA
products.js
========================================================
*/

const MARKUPS = {
  disenador: 0.35,
  arabes: 0.45,
  niche: 0.45
};


// ======================================================
// REDONDEO A CENTENAS
// ======================================================

function redondearACentena(valor) {
  return Math.round(valor / 100) * 100;
}


// ======================================================
// PRODUCTOS
// ======================================================

const productosUrbanTech = [

  // =========================
  // DISEÑADOR
  // =========================

  {
    nombre: "Fierce Men",
    marca: "Abercrombie & Fitch",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 30000,
    descripcion: "Fragancia icónica de Abercrombie & Fitch, de perfil fresco, amaderado y aromático. Una opción versátil para el uso diario.",
    notas: "Brisa marina, sándalo, almizcle y maderas.",
    image: "images/fierce-men.webp"
  },

  {
    nombre: "First Instinct Men",
    marca: "Abercrombie & Fitch",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 16100,
    descripcion: "Fragancia masculina de carácter fresco y aromático, pensada para un estilo casual y moderno.",
    notas: "Notas aromáticas, cítricas, especiadas y amaderadas.",
    image: "images/first-instinct-men.webp"
  },

  {
    nombre: "Wanted by Night",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 32600,
    descripcion: "Fragancia masculina cálida y especiada, con un perfil intenso especialmente apropiado para la noche.",
    notas: "Canela, mandarina, lavanda, incienso, tabaco, vainilla y cuero.",
    image: "images/wanted-by-night.webp"
  },

  {
    nombre: "Chrome United",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 12800,
    descripcion: "Fragancia fresca y limpia de estilo masculino, ideal para el uso cotidiano.",
    notas: "Cítricos, notas acuáticas, especias y maderas.",
    image: "images/chrome-united.webp"
  },

  {
    nombre: "Wanted",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 26200,
    descripcion: "Fragancia masculina vibrante y especiada, con una combinación de frescura, dulzor y maderas.",
    notas: "Limón, jengibre, cardamomo, enebro, vetiver y haba tonka.",
    image: "images/wanted.webp"
  },

  {
    nombre: "The Most Wanted Parfum",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 37800,
    descripcion: "Fragancia intensa y cálida con un carácter dulce y amaderado, pensada para ocasiones especiales y nocturnas.",
    notas: "Jengibre rojo, madera incandescente y bourbon vainilla.",
    image: "images/the-most-wanted-parfum.webp"
  },

  {
    nombre: "Chrome Men",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "200 ml",
    costo: 25700,
    descripcion: "Fragancia masculina fresca y luminosa, con un perfil limpio y versátil.",
    notas: "Cítricos, notas acuáticas, almizcle y maderas.",
    image: "images/chrome-men.webp"
  },

  {
    nombre: "Wanted Girl Tonic",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 22300,
    descripcion: "Fragancia femenina fresca, floral y chispeante, con un carácter luminoso y moderno.",
    notas: "Yuzu, granada, jengibre, peonía y haba tonka.",
    image: "images/wanted-girl-tonic.webp"
  },

  {
    nombre: "The Most Wanted Intense",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 31100,
    descripcion: "Fragancia masculina intensa, dulce y especiada, diseñada para destacar especialmente durante la noche.",
    notas: "Cardamomo, caramelo y ámbar amaderado.",
    image: "images/the-most-wanted-intense.webp"
  },

  {
    nombre: "Colors Rose Intense",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 8000,
    descripcion: "Fragancia femenina de perfil floral y frutal, con un carácter juvenil y luminoso.",
    notas: "Frutas, flores y acordes dulces.",
    image: "images/colors-rose-intense.webp"
  },

  {
    nombre: "Sisterland Pink",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 8500,
    descripcion: "Fragancia femenina alegre y floral, con un carácter dulce y moderno.",
    notas: "Frutas, flores blancas y acordes dulces.",
    image: "images/sisterland-pink.webp"
  },

  {
    nombre: "Sisterland Green",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 7200,
    descripcion: "Fragancia femenina fresca y luminosa, con una personalidad floral y frutal.",
    notas: "Frutas frescas, flores y notas verdes.",
    image: "images/sisterland-green.webp"
  },

  {
    nombre: "Sisterland Blue",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 8200,
    descripcion: "Fragancia femenina fresca y delicada, con un perfil limpio y floral.",
    notas: "Acordes frescos, flores y maderas suaves.",
    image: "images/sisterland-blue.webp"
  },

  {
    nombre: "Colors Black",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 8800,
    descripcion: "Fragancia de carácter intenso y moderno, con una combinación aromática pensada para destacar.",
    notas: "Acordes aromáticos, especias y maderas.",
    image: "images/colors-black.webp"
  },

  {
    nombre: "Hot Woman",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 5100,
    descripcion: "Fragancia femenina de perfil juvenil, fresco y floral, ideal para el día a día.",
    notas: "Frutas, flores y notas suaves.",
    image: "images/hot-woman.webp"
  },

  {
    nombre: "Intense Men",
    marca: "Bentley",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 15400,
    descripcion: "Fragancia masculina intensa y elegante, con un carácter cálido, especiado y amaderado.",
    notas: "Especias, maderas, ámbar y acordes cálidos.",
    image: "images/bentley-intense-men.webp"
  },

  {
    nombre: "Men",
    marca: "Bentley",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 11200,
    descripcion: "Fragancia masculina elegante de perfil amaderado y especiado, con una presencia sofisticada.",
    notas: "Pimienta negra, incienso, cuero, madera y almizcle.",
    image: "images/bentley-men.webp"
  },


  // =========================
  // ÁRABES
  // =========================

  {
    nombre: "Hayaati Men",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 8700,
    descripcion: "Fragancia aromática y amaderada de Lattafa, fresca al inicio y cálida en el fondo. Versátil para el uso diario.",
    notas: "Manzana, bergamota, canela, notas amaderadas, almizcle y vainilla.",
    image: "images/hayaati-men.webp"
  },

  {
    nombre: "Yara Elixir",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 16800,
    descripcion: "Fragancia femenina gourmand de carácter cremoso, dulce y envolvente, con una combinación frutal, floral y cálida.",
    notas: "Strawberry s'mores, grosella negra, jazmín, flor de azahar, vainilla, caramelo, ámbar y almizcle.",
    image: "images/yara-elixir.webp"
  },

  {
    nombre: "Asad Elixir",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 16100,
    descripcion: "Fragancia intensa y cálida de perfil especiado y ambarado, con una presencia marcada.",
    notas: "Especias, acordes ambarados, maderas y notas cálidas.",
    image: "images/asad-elixir.webp"
  },

  {
    nombre: "Pride Nebras",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 13500,
    descripcion: "Fragancia dulce y gourmand de Lattafa, con un perfil cremoso y envolvente.",
    notas: "Frutos rojos, vainilla, cacao, azúcar, rosa, ámbar, almizcle y haba tonka.",
    image: "images/pride-nebras.webp"
  }

];


// ======================================================
// NORMALIZAR CATEGORÍA
// ======================================================

function normalizarCategoria(categoria) {

  let categoriaNormalizada = String(categoria || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    categoriaNormalizada === "arabe" ||
    categoriaNormalizada === "arabes"
  ) {
    return "arabes";
  }

  if (
    categoriaNormalizada === "disenador" ||
    categoriaNormalizada === "disenadores"
  ) {
    return "disenador";
  }

  if (
    categoriaNormalizada === "niche" ||
    categoriaNormalizada === "nicho"
  ) {
    return "niche";
  }

  return categoriaNormalizada;
}


// ======================================================
// CALCULAR PRECIO
// ======================================================

function calcularPrecio(costo, categoria) {

  const costoNumerico = Number(costo) || 0;

  const categoriaNormalizada =
    normalizarCategoria(categoria);

  const markup =
    MARKUPS[categoriaNormalizada] ?? 0.35;

  const precioCalculado =
    costoNumerico * (1 + markup);

  return redondearACentena(precioCalculado);
}


// ======================================================
// CREAR ID
// ======================================================

function crearId(producto, index) {

  const nombre = String(
    producto.nombre || "producto"
  )
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${nombre}-${index}`;
}


// ======================================================
// CONSTRUIR PRODUCTOS PARA EL CATÁLOGO
// ======================================================

const PRODUCTS = productosUrbanTech.map(
  (producto, index) => {

    const categoria =
      normalizarCategoria(producto.categoria);

    const costo =
      Number(producto.costo) || 0;

    const precio =
      calcularPrecio(costo, categoria);

    return {

      id: crearId(producto, index),

      name: producto.nombre || "",

      brand: producto.marca || "",

      category: categoria,

      presentation:
        producto.presentacion || "",

      cost: costo,

      price: precio,

      image:
        producto.image || "",

      description:
        producto.descripcion || "",

      notes:
        producto.notas || ""

    };

  }
);


// ======================================================
// COMPATIBILIDAD CON INDEX.HTML
// ======================================================

window.PRODUCTS = PRODUCTS;

window.productosUrbanTech =
  productosUrbanTech;


// ======================================================
// INFORMACIÓN EN CONSOLA
// ======================================================

console.log(
  "UrbanTech Perfumería:",
  PRODUCTS.length,
  "productos cargados."
);

console.log(
  "Catálogo UrbanTech:",
  PRODUCTS
);
