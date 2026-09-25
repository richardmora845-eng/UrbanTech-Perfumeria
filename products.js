/*
========================================================
URBANTECH PERFUMERÍA
products.js
========================================================

PRECIOS DE VENTA:

Diseñador → costo + 35%
Árabes    → costo + 45%
Niche     → preparado para agregar posteriormente

El catálogo utiliza:

PRODUCTS

y cada producto contiene:

id
name
brand
category
presentation
cost
price
image

Las imágenes se pueden agregar posteriormente.
========================================================
*/


// ======================================================
// CONFIGURACIÓN DE MÁRGENES
// ======================================================

const MARKUPS = {

  disenador: 0.35,

  arabes: 0.45,

  niche: 0.45

};



// ======================================================
// PRODUCTOS BASE
// ======================================================

const productosUrbanTech = [

  // ====================================================
  // DISEÑADORES — +35%
  // ====================================================

  {
    nombre: "Fierce Men",
    marca: "Abercrombie & Fitch",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 30000
  },

  {
    nombre: "First Instinct Men",
    marca: "Abercrombie & Fitch",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 16100
  },

  {
    nombre: "Wanted by Night",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 32600
  },

  {
    nombre: "Chrome United",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 12800
  },

  {
    nombre: "Wanted",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 26200
  },

  {
    nombre: "The Most Wanted Parfum",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 37800
  },

  {
    nombre: "Chrome Men",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "200 ml",
    costo: 25700
  },

  {
    nombre: "Wanted Girl Tonic",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 22300
  },

  {
    nombre: "The Most Wanted Intense",
    marca: "Azzaro",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 31100
  },

  {
    nombre: "Colors Rose Intense",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 8000
  },

  {
    nombre: "Sisterland Pink",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 8500
  },

  {
    nombre: "Sisterland Green",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 7200
  },

  {
    nombre: "Sisterland Blue",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "80 ml",
    costo: 8200
  },

  {
    nombre: "Colors Black",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 8800
  },

  {
    nombre: "Hot Woman",
    marca: "Benetton",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 5100
  },

  {
    nombre: "Intense Men",
    marca: "Bentley",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 15400
  },

  {
    nombre: "Men",
    marca: "Bentley",
    categoria: "diseñador",
    presentacion: "100 ml",
    costo: 11200
  },


  // ====================================================
  // ÁRABES — +45%
  // ====================================================

  {
    nombre: "Hayaati Men",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 8700
  },

  {
    nombre: "Yara Elixir",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 16800
  },

  {
    nombre: "Asad Elixir",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 16100
  },

  {
    nombre: "Pride Nebras",
    marca: "Lattafa",
    categoria: "arabes",
    presentacion: "100 ml",
    costo: 13500
  }

];



// ======================================================
// NORMALIZAR CATEGORÍA
// ======================================================

function normalizarCategoria(categoria) {

  let categoriaNormalizada =
    String(categoria || "")
      .toLowerCase()
      .trim();


  categoriaNormalizada =
    categoriaNormalizada
      .normalize("NFD")
      .replace(
        /[\u0300-\u036f]/g,
        ""
      );


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
// CALCULAR PRECIO DE VENTA
// ======================================================

function calcularPrecio(costo, categoria) {

  const costoNumerico =
    Number(costo) || 0;


  const categoriaNormalizada =
    normalizarCategoria(categoria);


  const markup =
    MARKUPS[categoriaNormalizada] ?? 0.35;


  return Math.round(
    costoNumerico *
    (1 + markup)
  );

}



// ======================================================
// CREAR ID
// ======================================================

function crearId(producto, index) {

  const nombre =
    String(
      producto.nombre || "producto"
    )
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    );


  return (
    nombre +
    "-" +
    index
  );

}



// ======================================================
// CONSTRUIR CATÁLOGO
// ======================================================

const PRODUCTS =
  productosUrbanTech.map(
    (producto, index) => {

      const categoria =
        normalizarCategoria(
          producto.categoria
        );


      const costo =
        Number(
          producto.costo
        ) || 0;


      const precio =
        calcularPrecio(
          costo,
          categoria
        );


      return {

        id:
          crearId(
            producto,
            index
          ),

        name:
          producto.nombre || "",

        brand:
          producto.marca || "",

        category:
          categoria,

        presentation:
          producto.presentacion || "",

        cost:
          costo,

        price:
          precio,

        /*
         * Imagen.
         *
         * Déjala vacía por ahora.
         * Posteriormente podemos poner aquí
         * la URL de cada perfume.
         */

        image:
          producto.image || "",

        description:
          producto.descripcion || ""

      };

    }
  );



// ======================================================
// COMPATIBILIDAD
// ======================================================
//
// Dejamos también disponible como:
// window.PRODUCTS
//
// para que index.html pueda leerlo.
// ======================================================

window.PRODUCTS =
  PRODUCTS;



// ======================================================
// COMPATIBILIDAD CON EL NOMBRE ANTERIOR
// ======================================================

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
  "Catálogo:",
  PRODUCTS
);
