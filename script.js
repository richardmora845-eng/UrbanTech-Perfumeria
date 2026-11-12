
/* =====================================================
   URBAN TECH CR02 PERFUMERÍA
   SCRIPT.JS COMPLETO
   Catálogo, filtros, galería, ofertas,
   TOP 5 y carrito con pedidos por WhatsApp.
===================================================== */

(() => {
  "use strict";

  const WHATSAPP_NUMBER = "50670461262";

  const STORE_NAME = "Urban Tech CR02 Perfumería";

  const state = {
    client: null,
    products: [],
    categories: [],
    cart: [],
    search: "",
    category: "",
    gender: "",
    sort: "default",
    activeProduct: 0,
    activePhoto: 0,
    viewing: []
  };

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  function escapeHTML(value = "") {
    return String(value ?? "").replace(
      /[&<>"']/g,
      character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      })[character]
    );
  }

  function money(value) {
    return "₡" + Math.round(
      Number(value) || 0
    ).toLocaleString("es-CR");
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function byId(id) {
    return state.products.find(
      product => String(product.id) === String(id)
    );
  }

  function effectivePrice(product) {
    const regular = Number(product.price) || 0;
    const offer = Number(product.offer_price);

    if (
      product.is_offer &&
      offer > 0 &&
      offer < regular
    ) {
      return offer;
    }

    return regular;
  }

  function categoryName(product) {
    return product.categories?.name ||
      state.categories.find(
        category =>
          String(category.id) ===
          String(product.category_id)
      )?.name || "";
  }

  function categorySlug(product) {
    return product.categories?.slug ||
      state.categories.find(
        category =>
          String(category.id) ===
          String(product.category_id)
      )?.slug || "";
  }

  /* ================================================
     FOTOGRAFÍAS DEL PRODUCTO
  ================================================ */

  function photosOf(product) {
    const images = Array.isArray(product.images)
      ? product.images.filter(
          image =>
            typeof image === "string" &&
            image.trim()
        )
      : [];

    const main = String(
      product.image_url || ""
    ).trim();

    const all = main
      ? [main, ...images]
      : images;

    return [...new Set(all)].slice(0, 5);
  }

  function imageURL(product) {
    return photosOf(product)[0] || "";
  }

  function imageHTML(product) {
    const url = imageURL(product);

    if (!url) {
      return `
        <span class="product-image-placeholder">
          Imagen próximamente
        </span>
      `;
    }

    return `
      <img
        src="${escapeHTML(url)}"
        alt="${escapeHTML(product.name)}"
        loading="lazy"
        onerror="this.hidden=true;this.nextElementSibling.hidden=false"
      >
      <span class="product-image-placeholder" hidden>
        Imagen no disponible
      </span>
    `;
  }

  /* ================================================
     NOTIFICACIONES
  ================================================ */

  let toastTimer;

  function notify(message, cartAction = false) {
    const element = $("#toast-message");

    if (!element) return;

    clearTimeout(toastTimer);

    element.innerHTML = `
      <span>${escapeHTML(message)}</span>
      ${
        cartAction
          ? `<button
              type="button"
              data-action="open-cart">
              Ver carrito →
            </button>`
          : ""
      }
    `;

    element.hidden = false;
    element.classList.add("show");

    toastTimer = setTimeout(() => {
      element.classList.remove("show");
      element.hidden = true;
    }, 5200);
  }

  /* ================================================
     TARJETAS DE PRODUCTOS
  ================================================ */

  function productCard(product) {
    const id = escapeHTML(product.id);
    const sold = (Number(product.stock) || 0) <= 0;

    const regular = Number(product.price) || 0;
    const price = effectivePrice(product);

    return `
      <article
        class="product-card"
        data-product-id="${id}">

        <button
          class="product-card-image"
          type="button"
          data-action="details"
          data-id="${id}"
          aria-label="Ver ${escapeHTML(product.name)}">

          ${imageHTML(product)}

          ${
            price < regular
              ? `<span class="product-badge">
                   Oferta
                 </span>`
              : ""
          }

          ${
            sold
              ? `<span class="product-badge sold-badge">
                   Agotado
                 </span>`
              : ""
          }

        </button>

        <div class="product-info">

          <p class="product-brand">
            ${escapeHTML(product.brand || "")}
          </p>

          <h3>${escapeHTML(product.name)}</h3>

          <p class="product-category">
            ${escapeHTML(categoryName(product))}
          </p>

          <p class="product-prices">

            ${
              price < regular
                ? `<span class="product-old-price">
                     ${money(regular)}
                   </span>`
                : ""
            }

            <strong class="product-price">
              ${money(price)}
            </strong>

          </p>

          <button
            type="button"
            class="product-buy-button"
            data-action="add"
            data-id="${id}"
            ${sold ? "disabled" : ""}>

            ${
              sold
                ? "Agotado"
                : "Agregar al carrito"
            }

          </button>

        </div>

      </article>
    `;
  }

  function renderItems(container, products, message) {
    if (!container) return;

    container.innerHTML = products.length
      ? products.map(productCard).join("")
      : `<p class="empty-products">
           ${escapeHTML(message)}
         </p>`;
  }

  /* ================================================
     TOP 5 DAMA Y CABALLERO
  ================================================ */

  function renderTop() {
    const women = state.products
      .filter(
        product => Number(product.top_women_order) > 0
      )
      .sort(
        (a, b) =>
          Number(a.top_women_order) -
          Number(b.top_women_order)
      )
      .slice(0, 5);

    const men = state.products
      .filter(
        product => Number(product.top_men_order) > 0
      )
      .sort(
        (a, b) =>
          Number(a.top_men_order) -
          Number(b.top_men_order)
      )
      .slice(0, 5);

    renderItems(
      $("#top-women"),
      women,
      "Pronto tendremos nuestros favoritos para dama."
    );

    renderItems(
      $("#top-men"),
      men,
      "Pronto tendremos nuestros favoritos para caballero."
    );
  }

  /* ================================================
     OFERTAS
  ================================================ */

  function renderOffers() {
    const offers = state.products.filter(
      product =>
        product.is_offer &&
        effectivePrice(product) <
          Number(product.price)
    );

    renderItems(
      $("#offers-products"),
      offers,
      "Pronto tendremos nuevas ofertas."
    );
  }

  /* ================================================
     FILTROS DEL CATÁLOGO
  ================================================ */

  function filteredProducts() {
    let products = [...state.products];

    if (state.category) {
      products = products.filter(product => {
        return (
          normalize(categorySlug(product)) ===
            normalize(state.category) ||
          normalize(categoryName(product)) ===
            normalize(state.category)
        );
      });
    }

    if (state.gender) {
      products = products.filter(
        product =>
          normalize(product.gender) ===
          normalize(state.gender)
      );
    }

    if (state.search) {
      const term = normalize(state.search);

      products = products.filter(product => {
        const searchable = [
          product.name,
          product.brand,
          product.description,
          categoryName(product)
        ].join(" ");

        return normalize(searchable).includes(term);
      });
    }

    if (state.sort === "price-asc") {
      products.sort(
        (a, b) =>
          effectivePrice(a) - effectivePrice(b)
      );
    }

    if (state.sort === "price-desc") {
      products.sort(
        (a, b) =>
          effectivePrice(b) - effectivePrice(a)
      );
    }

    if (state.sort === "name") {
      products.sort(
        (a, b) =>
          String(a.name).localeCompare(
            String(b.name), "es"
          )
      );
    }

    return products;
  }

  function renderCatalog() {
    renderItems(
      $("#catalog-products"),
      filteredProducts(),
      "No encontramos perfumes con esos criterios."
    );
  }

  /* ================================================
     VISUALIZADOR DE PRODUCTOS
  ================================================ */

  function openDetails(id) {
    const product = byId(id);

    const dialog = $("#product-dialog");
    const content = $("#product-dialog-content");

    if (!product || !dialog || !content) return;

    state.viewing = filteredProducts();

    if (
      !state.viewing.some(
        item => String(item.id) === String(id)
      )
    ) {
      state.viewing = [...state.products];
    }

    state.activeProduct = Math.max(
      0,
      state.viewing.findIndex(
        item => String(item.id) === String(id)
      )
    );

    state.activePhoto = 0;

    renderDetails();

    if (!dialog.open) {
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        dialog.setAttribute("open", "");
      }
    }
  }

  function renderDetails() {
    const content = $("#product-dialog-content");

    const product =
      state.viewing[state.activeProduct];

    if (!content || !product) return;

    const photos = photosOf(product);
    const sold = (Number(product.stock) || 0) <= 0;

    state.activePhoto = Math.min(
      state.activePhoto,
      Math.max(photos.length - 1, 0)
    );

    const currentPhoto = photos[state.activePhoto];

    const mainImage = currentPhoto
      ? `
        <img
          src="${escapeHTML(currentPhoto)}"
          alt="${escapeHTML(product.name)}"
          style="width:100%;height:100%;max-height:430px;object-fit:contain"
          onerror="this.hidden=true;this.nextElementSibling.hidden=false"
        >
        <span class="product-image-placeholder" hidden>
          Imagen no disponible
        </span>
      `
      : `
        <span class="product-image-placeholder">
          Imagen próximamente
        </span>
      `;

    const thumbnails = photos.length > 1
      ? `
        <div class="perfume-gallery-thumbnails">

          ${photos.map((url, index) => `
            <button
              type="button"
              data-action="select-photo"
              data-photo="${index}"
              aria-label="Ver fotografía ${index + 1}"
              aria-pressed="${
                index === state.activePhoto
              }"
              style="
                width:65px;
                height:65px;
                padding:4px;
                background:#fff;
                cursor:pointer;
                border:${
                  index === state.activePhoto
                    ? "2px solid #00d9ff"
                    : "1px solid #ddd"
                };
              ">

              <img
                src="${escapeHTML(url)}"
                alt="Fotografía ${index + 1}"
                loading="lazy"
                style="width:100%;height:100%;object-fit:contain">

            </button>
          `).join("")}

        </div>
      `
      : "";

    const photoControls = photos.length > 1
      ? `
        <div style="
          display:flex;
          align-items:center;
          justify-content:center;
          gap:15px;
          margin:8px 0 12px;
        ">

          <button
            type="button"
            data-action="prev-photo"
            aria-label="Fotografía anterior">
            ‹
          </button>

          <span style="font-size:13px">
            Foto ${state.activePhoto + 1}
            de ${photos.length}
          </span>

          <button
            type="button"
            data-action="next-photo"
            aria-label="Fotografía siguiente">
            ›
          </button>

        </div>
      `
      : "";

    content.innerHTML = `
      <div class="viewer-layout">

        <div>

          <div class="viewer-photo">
            ${mainImage}
          </div>

          ${photoControls}
          ${thumbnails}

        </div>

        <div class="viewer-info">

          <p class="viewer-brand">
            ${escapeHTML(
              product.brand || STORE_NAME
            )}
          </p>

          <h2>
            ${escapeHTML(product.name)}
          </h2>

          <p class="viewer-category">
            ${escapeHTML(categoryName(product))}
          </p>

          <p class="viewer-description">
            ${escapeHTML(
              product.description ||
              "Descubrí esta fragancia y consultá su disponibilidad."
            )}
          </p>

          <p class="viewer-price">
            ${money(effectivePrice(product))}
          </p>

          <button
            type="button"
            class="viewer-buy"
            data-action="add"
            data-id="${escapeHTML(product.id)}"
            ${sold ? "disabled" : ""}>

            ${
              sold
                ? "Agotado"
                : "Agregar al carrito"
            }

          </button>

        </div>

      </div>

      <div class="viewer-navigation">

        <button
          type="button"
          data-action="prev-product">
          ‹ Anterior
        </button>

        <span>
          ${state.activeProduct + 1}
          de ${state.viewing.length}
        </span>

        <button
          type="button"
          data-action="next-product">
          Siguiente ›
        </button>

      </div>
    `;
  }

  function moveProduct(step) {
    if (!state.viewing.length) return;

    state.activeProduct = (
      state.activeProduct +
      step +
      state.viewing.length
    ) % state.viewing.length;

    state.activePhoto = 0;

    renderDetails();
  }

  function movePhoto(step) {
    const product =
      state.viewing[state.activeProduct];

    if (!product) return;

    const photos = photosOf(product);

    if (photos.length < 2) return;

    state.activePhoto = (
      state.activePhoto +
      step +
      photos.length
    ) % photos.length;

    renderDetails();
  }

  function selectPhoto(index) {
    const product =
      state.viewing[state.activeProduct];

    if (!product) return;

    const photos = photosOf(product);

    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < photos.length
    ) {
      state.activePhoto = index;
      renderDetails();
    }
  }

  function closeDetails() {
    const dialog = $("#product-dialog");

    if (!dialog || !dialog.open) return;

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  /* ================================================
     CARRITO DE COMPRAS
  ================================================ */

  function addToCart(id) {
    const product = byId(id);

    if (!product) return;

    const stock = Number(product.stock) || 0;

    if (stock < 1) {
      notify("Este perfume está agotado.");
      return;
    }

    let item = state.cart.find(
      entry => String(entry.id) === String(id)
    );

    if (item) {
      if (item.quantity >= stock) {
        notify("No hay más unidades disponibles.");
        return;
      }

      item.quantity++;
    } else {
      item = {
        id: product.id,
        name: product.name,
        price: effectivePrice(product),
        stock,
        quantity: 1
      };

      state.cart.push(item);
    }

    renderCart();

    const count = state.cart.reduce(
      (total, entry) =>
        total + entry.quantity,
      0
    );

    notify(
      `¡Agregaste ${count} ${
        count === 1
          ? "producto"
          : "productos"
      } al carrito! Ya podés verlo en nuestro carrito.`,
      true
    );
  }

  function changeQuantity(id, delta) {
    const item = state.cart.find(
      entry => String(entry.id) === String(id)
    );

    if (!item) return;

    const next = item.quantity + delta;

    if (next <= 0) {
      state.cart = state.cart.filter(
        entry => String(entry.id) !== String(id)
      );
    } else if (next > item.stock) {
      notify("No hay más unidades disponibles.");
      return;
    } else {
      item.quantity = next;
    }

    renderCart();
  }

  function removeFromCart(id) {
    state.cart = state.cart.filter(
      entry => String(entry.id) !== String(id)
    );

    renderCart();
    notify("Producto eliminado del carrito.");
  }

  function cartTotal() {
    return state.cart.reduce(
      (total, item) =>
        total + item.price * item.quantity,
      0
    );
  }

  /* ================================================
     MENSAJE DE PEDIDO POR WHATSAPP
  ================================================ */

  function orderText() {
    const total = cartTotal();

    const lines = [
      "Hola, buenas. 👋",
      "",
      "Me gustaría realizar un pedido en Urban Tech CR02 Perfumería.",
      "",
      "🛍️ Mi pedido:",
      "",
      ...state.cart.map(item => {
        return (
          `• ${item.name} — ` +
          `${item.quantity} ${
            item.quantity === 1
              ? "unidad"
              : "unidades"
          } × ${money(item.price)} = ` +
          money(item.price * item.quantity)
        );
      }),
      "",
      `💰 Subtotal: ${money(total)}`,
      `💰 Total de productos: ${money(total)}`,
      "",
      "🚚 Deseo coordinar el envío de mi pedido.",
      "",
      "¿Podrían confirmarme la disponibilidad, el costo de envío y el tiempo estimado de entrega?",
      "",
      "¡Muchas gracias!"
    ];

    return lines.join("\n");
  }

  function checkout() {
    if (!state.cart.length) {
      notify("Primero agregá un perfume al carrito.");
      return;
    }

    const url =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(orderText())}`;

    window.location.href = url;
  }

  /* ================================================
     MOSTRAR CARRITO
  ================================================ */

  function renderCart() {
    const list = $("#cart-items");
    const count = $("#cart-count");
    const total = $("#cart-total");
    const checkoutLink = $("#checkout-whatsapp");

    const units = state.cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    const amount = cartTotal();

    if (count) {
      count.textContent = units;
    }

    if (total) {
      total.textContent = money(amount);
    }

    if (checkoutLink) {
      checkoutLink.href = units
        ? `https://wa.me/${WHATSAPP_NUMBER}` +
          `?text=${encodeURIComponent(orderText())}`
        : "#";

      checkoutLink.setAttribute(
        "aria-disabled",
        String(!units)
      );
    }

    if (!list) return;

    if (!units) {
      list.innerHTML = `
        <p class="cart-empty">
          Tu carrito está vacío.
        </p>
      `;

      return;
    }

    list.innerHTML = state.cart.map(item => `
      <div class="cart-item">

        <div class="cart-item-info">

          <strong>
            ${escapeHTML(item.name)}
          </strong>

          <span>
            ${money(item.price)} cada uno
          </span>

        </div>

        <div class="cart-item-controls">

          <button
            type="button"
            data-action="quantity"
            data-id="${escapeHTML(item.id)}"
            data-amount="-1"
            aria-label="Restar cantidad">
            −
          </button>

          <span>${item.quantity}</span>

          <button
            type="button"
            data-action="quantity"
            data-id="${escapeHTML(item.id)}"
            data-amount="1"
            aria-label="Sumar cantidad">
            +
          </button>

        </div>

        <strong>
          ${money(item.price * item.quantity)}
        </strong>

        <button
          type="button"
          data-action="remove"
          data-id="${escapeHTML(item.id)}"
          aria-label="Eliminar producto">
          ×
        </button>

      </div>
    `).join("");
  }

  function openCart() {
    const panel = $("#cart-panel");

    if (!panel) return;

    panel.hidden = false;
    panel.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");

    $("#cart-close")?.focus();
  }

  function closeCart() {
    const panel = $("#cart-panel");

    if (!panel) return;

    panel.classList.remove("is-open");
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");

    $("#cart-toggle")?.focus();
  }

  /* ================================================
     APLICAR CATEGORÍAS
  ================================================ */

  function applyCategory(category = "", gender = "") {
    state.category = category;
    state.gender = gender;

    const categorySelect = $("#category-filter");
    const genderSelect = $("#gender-filter");

    if (categorySelect) {
      categorySelect.value = category;
    }

    if (genderSelect) {
      genderSelect.value = gender;
    }

    renderCatalog();

    $("#catalogo")?.scrollIntoView({
      behavior: "smooth"
    });
  }

  /* ================================================
     EVENTOS Y BOTONES
  ================================================ */

  function setupEvents() {
    document.addEventListener("click", event => {
      const target = event.target.closest(
        "[data-action]"
      );

      if (target) {
        const { action, id } = target.dataset;

        if (action === "details") {
          openDetails(id);
        }

        if (action === "add") {
          addToCart(id);
        }

        if (action === "quantity") {
          changeQuantity(
            id,
            Number(target.dataset.amount) || 0
          );
        }

        if (action === "remove") {
          removeFromCart(id);
        }

        if (action === "open-cart") {
          openCart();
        }

        if (action === "prev-product") {
          moveProduct(-1);
        }

        if (action === "next-product") {
          moveProduct(1);
        }

        if (action === "prev-photo") {
          movePhoto(-1);
        }

        if (action === "next-photo") {
          movePhoto(1);
        }

        if (action === "select-photo") {
          selectPhoto(Number(target.dataset.photo));
        }

        return;
      }

      const category = event.target.closest(
        "[data-category]"
      );

      if (category) {
        event.preventDefault();

        const value = category.dataset.category;

        if (
          ["dama", "caballero", "unisex"]
            .includes(value)
        ) {
          applyCategory("", value);
        } else {
          applyCategory(value, "");
        }

        return;
      }

      const gender = event.target.closest(
        "[data-filter-gender]"
      );

      if (gender) {
        event.preventDefault();

        applyCategory(
          "",
          gender.dataset.filterGender
        );

        return;
      }

      if (event.target.closest("#cart-toggle")) {
        openCart();
      }

      if (event.target.closest("#cart-close")) {
        closeCart();
      }

      if (
        event.target.closest(
          "#product-dialog-close"
        )
      ) {
        closeDetails();
      }

      if (event.target.closest("#search-toggle")) {
        const panel = $("#search-panel");

        if (panel) {
          panel.hidden = !panel.hidden;

          if (!panel.hidden) {
            $("#search-input")?.focus();
          }
        }
      }

      if (event.target.closest("#search-close")) {
        const panel = $("#search-panel");

        if (panel) {
          panel.hidden = true;
        }
      }

      if (
        event.target.closest(
          "#mobile-menu-toggle"
        )
      ) {
        const navigation = $(".main-nav");

        if (navigation) {
          const expanded =
            navigation.classList.toggle(
              "mobile-open"
            );

          $("#mobile-menu-toggle")?.setAttribute(
            "aria-expanded",
            String(expanded)
          );
        }
      }

      if (
        event.target.closest(
          ".main-nav .nav-link"
        )
      ) {
        $(".main-nav")?.classList.remove(
          "mobile-open"
        );

        $("#mobile-menu-toggle")?.setAttribute(
          "aria-expanded",
          "false"
        );
      }
    });

    /* PEDIDO POR WHATSAPP */

    $("#checkout-whatsapp")?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        checkout();
      }
    );

    /* BUSCADOR */

    $("#search-form")?.addEventListener(
      "submit",
      event => {
        event.preventDefault();

        $("#catalogo")?.scrollIntoView({
          behavior: "smooth"
        });
      }
    );

    $("#search-input")?.addEventListener(
      "input",
      event => {
        state.search = event.target.value.trim();
        renderCatalog();
      }
    );

    /* FILTRO DE CATEGORÍAS */

    $("#category-filter")?.addEventListener(
      "change",
      event => {
        state.category = event.target.value;
        renderCatalog();
      }
    );

    /* FILTRO DE PÚBLICO */

    $("#gender-filter")?.addEventListener(
      "change",
      event => {
        state.gender = event.target.value;
        renderCatalog();
      }
    );

    /* ORDENAR PRODUCTOS */

    $("#sort-products")?.addEventListener(
      "change",
      event => {
        state.sort = event.target.value;
        renderCatalog();
      }
    );

    /* CERRAR MODAL */

    const dialog = $("#product-dialog");

    dialog?.addEventListener(
      "click",
      event => {
        if (event.target === dialog) {
          closeDetails();
        }
      }
    );

    /* NAVEGACIÓN CON TECLADO */

    document.addEventListener(
      "keydown",
      event => {
        if (event.key === "Escape") {
          closeCart();
          closeDetails();
        }

        if (
          dialog?.open &&
          ["ArrowRight", "ArrowLeft"]
            .includes(event.key)
        ) {
          event.preventDefault();

          const step =
            event.key === "ArrowRight"
              ? 1
              : -1;

          if (
            event.target.closest?.(
              ".perfume-gallery-thumbnails"
            )
          ) {
            movePhoto(step);
          } else {
            moveProduct(step);
          }
        }
      }
    );

    /* DESLIZAMIENTO EN CELULAR */

    let startX = null;

    dialog?.addEventListener(
      "touchstart",
      event => {
        startX =
          event.touches[0]?.clientX ?? null;
      },
      { passive: true }
    );

    dialog?.addEventListener(
      "touchend",
      event => {
        if (startX === null) return;

        const diff =
          (event.changedTouches[0]?.clientX ??
            startX) -
          startX;

        if (Math.abs(diff) > 65) {
          const photoArea =
            event.target.closest?.(
              ".viewer-photo, .perfume-gallery-thumbnails"
            );

          if (photoArea) {
            movePhoto(diff < 0 ? 1 : -1);
          } else {
            moveProduct(diff < 0 ? 1 : -1);
          }
        }

        startX = null;
      },
      { passive: true }
    );
  }

  /* ================================================
     CONEXIÓN CON SUPABASE
  ================================================ */

  async function init() {
    const toast = $("#toast-message");
    const cartPanel = $("#cart-panel");

    if (toast) toast.hidden = true;
    if (cartPanel) cartPanel.hidden = true;

    setupEvents();
    renderCart();

    if ($("#current-year")) {
      $("#current-year").textContent =
        new Date().getFullYear();
    }

    if (
      !window.supabase?.createClient ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_ANON_KEY
    ) {
      const catalog = $("#catalog-products");

      if (catalog) {
        catalog.innerHTML = `
          <p class="empty-products">
            No se pudo conectar con Supabase.
            Revisá config.js.
          </p>
        `;
      }

      return;
    }

    try {
      state.client =
        window.supabase.createClient(
          window.SUPABASE_URL,
          window.SUPABASE_ANON_KEY
        );

      /* CARGAR CATEGORÍAS */

      const categoryResult = await state.client
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order(
          "sort_order",
          { ascending: true }
        );

      if (categoryResult.error) {
        console.warn(
          "Error cargando categorías:",
          categoryResult.error
        );
      } else {
        state.categories =
          categoryResult.data || [];
      }

      /* CARGAR PRODUCTOS */

      const productResult = await state.client
        .from("products")
        .select(`
          id,
          name,
          brand,
          description,
          category_id,
          gender,
          price,
          offer_price,
          image_url,
          images,
          stock,
          is_active,
          is_offer,
          is_bestseller,
          top_women_order,
          top_men_order,
          categories(name,slug)
        `)
        .eq("is_active", true)
        .order(
          "created_at",
          { ascending: false }
        );

      if (productResult.error) {
        throw productResult.error;
      }

      state.products =
        productResult.data || [];

      renderTop();
      renderOffers();
      renderCatalog();

      console.log(
        STORE_NAME +
        ": catálogo cargado correctamente."
      );

    } catch (error) {
      console.error(
        "Error cargando productos:",
        error
      );

      const catalog = $("#catalog-products");

      if (catalog) {
        catalog.innerHTML = `
          <p class="empty-products">
            No pudimos cargar los perfumes.
            Verificá la conexión y los permisos
            de Supabase.
          </p>
        `;
      }

      renderItems(
        $("#top-women"),
        [],
        "No se pudieron cargar los productos."
      );

      renderItems(
        $("#top-men"),
        [],
        "No se pudieron cargar los productos."
      );

      renderItems(
        $("#offers-products"),
        [],
        "No se pudieron cargar las ofertas."
      );

      notify(
        "No se pudieron cargar los perfumes."
      );
    }
  }

  /* ================================================
     INICIALIZACIÓN
  ================================================ */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
