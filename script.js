
/* ======================================================
   URBAN TECH CR02 PERFUMERÍA
   SCRIPT.JS OFICIAL

   CATÁLOGO + SUPABASE
   MÁS VENDIDOS + NOVEDADES
   PROMOCIONES DINÁMICAS
   CARRITO + WHATSAPP
   FILTROS + GALERÍA DE PRODUCTOS
====================================================== */

(() => {
  "use strict";

  const STORE_NAME = "Urban Tech CR02 Perfumería";
  const WHATSAPP_NUMBER = "50670461262";

  const state = {
    client: null,
    products: [],
    categories: [],
    promotions: [],
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

  const $$ = (selector, root = document) =>
    Array.from(root.querySelectorAll(selector));

  /* ==================================================
     FUNCIONES GENERALES
  ================================================== */

  function esc(value) {
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

  function slug(value) {
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

    return [...new Set(
      main ? [main, ...images] : images
    )].slice(0, 5);
  }

  function imageURL(product) {
    return photosOf(product)[0] || "";
  }

  /* ==================================================
     NOTIFICACIONES
  ================================================== */

  let toastTimer;

  function notify(message, cartAction = false) {
    const node = $("#toast-message");

    if (!node) return;

    clearTimeout(toastTimer);

    node.replaceChildren();

    const span = document.createElement("span");
    span.textContent = message;
    node.append(span);

    if (cartAction) {
      const button = document.createElement("button");

      button.type = "button";
      button.dataset.action = "open-cart";
      button.textContent = "Ver carrito →";

      node.append(button);
    }

    node.hidden = false;
    node.classList.add("show");

    toastTimer = setTimeout(() => {
      node.classList.remove("show");
      node.hidden = true;
    }, 5000);
  }

  /* ==================================================
     IMÁGENES DE PRODUCTOS
  ================================================== */

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
        src="${esc(url)}"
        alt="${esc(product.name)}"
        loading="lazy"
        onerror="this.hidden=true;this.nextElementSibling.hidden=false"
      >
      <span class="product-image-placeholder" hidden>
        Imagen no disponible
      </span>
    `;
  }

  /* ==================================================
     TARJETAS DE PRODUCTOS
  ================================================== */

  function card(product) {
    const id = esc(product.id);

    const sold =
      (Number(product.stock) || 0) <= 0;

    const regular =
      Number(product.price) || 0;

    const price = effectivePrice(product);

    return `
      <article
        class="product-card"
        data-product-id="${id}">

        <button
          type="button"
          class="product-card-image"
          data-action="details"
          data-id="${id}"
          aria-label="Ver ${esc(product.name)}">

          ${imageHTML(product)}

          ${
            price < regular
              ? `<span class="product-badge">
                   OFERTA
                 </span>`
              : ""
          }

          ${
            sold
              ? `<span class="product-badge sold-badge">
                   AGOTADO
                 </span>`
              : ""
          }

        </button>

        <div class="product-info">

          <p class="product-brand">
            ${esc(product.brand || "")}
          </p>

          <h3>
            ${esc(product.name)}
          </h3>

          <p class="product-category">
            ${esc(categoryName(product))}
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

  function renderItems(container, products, empty) {
    if (!container) return;

    container.innerHTML = products.length
      ? products.map(card).join("")
      : `<p class="empty-products">
           ${esc(empty)}
         </p>`;
  }

  /* ==================================================
     MÁS VENDIDOS
  ================================================== */

  function renderBestsellers() {
    const featured = state.products.filter(
      product =>
        product.is_bestseller ||
        Number(product.top_women_order) > 0 ||
        Number(product.top_men_order) > 0
    );

    renderItems(
      $("#bestsellers-products"),
      featured,
      "Pronto tendremos nuestros perfumes más vendidos."
    );

    // Compatibilidad con la estructura anterior.
    const women = state.products
      .filter(
        product =>
          Number(product.top_women_order) > 0
      )
      .sort(
        (a, b) =>
          Number(a.top_women_order) -
          Number(b.top_women_order)
      )
      .slice(0, 5);

    const men = state.products
      .filter(
        product =>
          Number(product.top_men_order) > 0
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
      "Todavía no hay perfumes destacados."
    );

    renderItems(
      $("#top-men"),
      men,
      "Todavía no hay perfumes destacados."
    );
  }

  /* ==================================================
     NOVEDADES
  ================================================== */

  function renderNewProducts() {
    const newest = [...state.products]
      .sort((a, b) =>
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      )
      .slice(0, 12);

    renderItems(
      $("#new-products"),
      newest,
      "Pronto tendremos nuevas fragancias."
    );
  }

  /* ==================================================
     PROMOCIONES DINÁMICAS
  ================================================== */

  function renderPromotions() {
    const container = $("#offers-banner-area");

    if (!container) return;

    const promotions = state.promotions.filter(
      promotion =>
        promotion.is_active &&
        byId(promotion.product_id)
    );

    if (!promotions.length) {
      container.innerHTML = `
        <p class="empty-products">
          Pronto tendremos promociones especiales.
        </p>
      `;
      return;
    }

    container.innerHTML = promotions.map(
      promotion => {

        const product = byId(
          promotion.product_id
        );

        const original =
          Number(promotion.original_price) || 0;

        const offer =
          Number(promotion.offer_price) || 0;

        const image = promotion.image_url ||
          imageURL(product);

        const percentage =
          original > 0 && offer < original
            ? Math.round(
                (1 - offer / original) * 100
              )
            : 0;

        return `
          <article class="offer-banner">

            <div class="offer-banner-info">

              <span class="offer-banner-brand">
                ${esc(product.brand || STORE_NAME)}
              </span>

              <strong class="offer-banner-name">
                ${esc(promotion.name)}
              </strong>

              <span class="offer-banner-description">
                Promoción especial por tiempo limitado
              </span>

            </div>

            <div class="offer-banner-image">

              ${
                image
                  ? `<img
                       src="${esc(image)}"
                       alt="${esc(promotion.name)}"
                       loading="lazy">`
                  : `<span class="product-image-placeholder">
                       Imagen próximamente
                     </span>`
              }

            </div>

            <div class="offer-banner-price">

              ${
                percentage > 0
                  ? `<span class="offer-label">
                       ${percentage}% DESCUENTO
                     </span>`
                  : ""
              }

              <del>${money(original)}</del>

              <strong>${money(offer)}</strong>

              <button
                type="button"
                data-action="details"
                data-id="${esc(product.id)}"
                style="
                  display:block;
                  width:100%;
                  margin-top:8px;
                  padding:8px;
                  border:0;
                  border-radius:7px;
                  background:#ffc12b;
                  color:#140a02;
                  font-weight:800;
                  font-size:11px;
                  cursor:pointer;">
                Ver perfume
              </button>

            </div>

          </article>
        `;
      }
    ).join("");
  }

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
      "Pronto tendremos ofertas."
    );
  }

  /* ==================================================
     FILTROS
  ================================================== */

  function filteredProducts() {
    let list = [...state.products];

    if (state.category) {
      list = list.filter(
        product =>
          slug(categorySlug(product)) ===
            slug(state.category) ||
          slug(categoryName(product)) ===
            slug(state.category)
      );
    }

    if (state.gender) {
      list = list.filter(
        product =>
          slug(product.gender) ===
          slug(state.gender)
      );
    }

    if (state.search) {
      const term = slug(state.search);

      list = list.filter(
        product => slug([
          product.name,
          product.brand,
          product.description,
          categoryName(product)
        ].join(" ")).includes(term)
      );
    }

    if (state.sort === "price-asc") {
      list.sort(
        (a, b) =>
          effectivePrice(a) -
          effectivePrice(b)
      );
    }

    if (state.sort === "price-desc") {
      list.sort(
        (a, b) =>
          effectivePrice(b) -
          effectivePrice(a)
      );
    }

    if (state.sort === "name") {
      list.sort(
        (a, b) =>
          String(a.name).localeCompare(
            String(b.name), "es"
          )
      );
    }

    return list;
  }

  function renderCatalog() {
    renderItems(
      $("#catalog-products"),
      filteredProducts(),
      "No encontramos perfumes con esos criterios."
    );
  }

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

  /* ==================================================
     DETALLES DEL PRODUCTO
  ================================================== */

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
    const sold =
      (Number(product.stock) || 0) <= 0;

    state.activePhoto = Math.min(
      state.activePhoto,
      Math.max(photos.length - 1, 0)
    );

    const currentPhoto =
      photos[state.activePhoto];

    const mainImage = currentPhoto
      ? `
        <img
          src="${esc(currentPhoto)}"
          alt="${esc(product.name)}"
          style="
            width:100%;
            height:100%;
            max-height:430px;
            object-fit:contain;"
          onerror="this.hidden=true;this.nextElementSibling.hidden=false">

        <span
          class="product-image-placeholder"
          hidden>
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
        <div class="perfume-gallery-thumbnails"
             style="
               display:flex;
               flex-wrap:wrap;
               justify-content:center;
               gap:9px;
               margin-top:12px;">

          ${photos.map((url, index) => `
            <button
              type="button"
              data-action="select-photo"
              data-photo="${index}"
              aria-label="Fotografía ${index + 1}"
              aria-pressed="${
                index === state.activePhoto
              }"
              style="
                width:65px;
                height:65px;
                border:${
                  index === state.activePhoto
                    ? "2px solid #00dfff"
                    : "1px solid #ddd"
                };
                border-radius:8px;
                background:white;
                cursor:pointer;">

              <img
                src="${esc(url)}"
                alt="Fotografía ${index + 1}"
                style="
                  width:100%;
                  height:100%;
                  object-fit:contain;">

            </button>
          `).join("")}

        </div>
      `
      : "";

    const controls = photos.length > 1
      ? `
        <div style="
          display:flex;
          justify-content:center;
          align-items:center;
          gap:15px;
          margin:12px 0;">

          <button
            type="button"
            data-action="prev-photo">
            ‹
          </button>

          <span style="font-size:12px">
            Foto ${state.activePhoto + 1}
            de ${photos.length}
          </span>

          <button
            type="button"
            data-action="next-photo">
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

          ${controls}
          ${thumbnails}

        </div>

        <div class="viewer-info">

          <p class="viewer-brand">
            ${esc(product.brand || STORE_NAME)}
          </p>

          <h2>${esc(product.name)}</h2>

          <p class="viewer-category">
            ${esc(categoryName(product))}
          </p>

          <p class="viewer-description">
            ${esc(
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
            data-id="${esc(product.id)}"
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

    if (!dialog?.open) return;

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }
  }

  /* ==================================================
     CARRITO
  ================================================== */

  function addToCart(id) {
    const product = byId(id);

    if (!product) return;

    const max = Number(product.stock) || 0;

    if (max < 1) {
      notify("Este perfume está agotado.");
      return;
    }

    let item = state.cart.find(
      entry => String(entry.id) === String(id)
    );

    if (item) {
      if (item.quantity >= max) {
        notify("No hay más unidades disponibles.");
        return;
      }

      item.quantity++;
    } else {
      state.cart.push({
        id: product.id,
        name: product.name,
        price: effectivePrice(product),
        stock: max,
        quantity: 1
      });
    }

    renderCart();

    const count = state.cart.reduce(
      (sum, entry) => sum + entry.quantity,
      0
    );

    notify(
      `¡Agregaste ${count} ${
        count === 1
          ? "producto"
          : "productos"
      } al carrito!`,
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
  }

  function cartTotal() {
    return state.cart.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );
  }

  /* ==================================================
     PEDIDO DE WHATSAPP
  ================================================== */

  function orderText() {
    const total = cartTotal();

    return [
      "Hola, buenas. 👋",
      "",
      `Me gustaría realizar un pedido en ${STORE_NAME}.`,
      "",
      "🛍️ Mi pedido:",
      "",
      ...state.cart.map(item =>
        `• ${item.name} — ${item.quantity} ${
          item.quantity === 1
            ? "unidad"
            : "unidades"
        } × ${money(item.price)} = ${
          money(item.price * item.quantity)
        }`
      ),
      "",
      `💰 Subtotal: ${money(total)}`,
      `💰 Total de productos: ${money(total)}`,
      "",
      "🚚 Deseo coordinar el envío.",
      "¿Me podrían confirmar disponibilidad, costo de envío y tiempo de entrega?",
      "",
      "¡Muchas gracias!"
    ].join("\n");
  }

  function checkout() {
    if (!state.cart.length) {
      notify("Primero agregá un perfume al carrito.");
      return;
    }

    window.location.href =
      `https://wa.me/${WHATSAPP_NUMBER}` +
      `?text=${encodeURIComponent(orderText())}`;
  }

  function renderCart() {
    const node = $("#cart-items");
    const count = $("#cart-count");
    const total = $("#cart-total");
    const link = $("#checkout-whatsapp");

    const units = state.cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    if (count) {
      count.textContent = units;
    }

    if (total) {
      total.textContent = money(cartTotal());
    }

    if (link) {
      link.href = units
        ? `https://wa.me/${WHATSAPP_NUMBER}` +
          `?text=${encodeURIComponent(orderText())}`
        : "#";

      link.setAttribute(
        "aria-disabled",
        String(!units)
      );
    }

    if (!node) return;

    node.innerHTML = units
      ? state.cart.map(item => `
          <div class="cart-item">

            <div class="cart-item-info">

              <strong>
                ${esc(item.name)}
              </strong>

              <span>
                ${money(item.price)} cada uno
              </span>

            </div>

            <div class="cart-item-controls">

              <button
                type="button"
                data-action="quantity"
                data-id="${esc(item.id)}"
                data-amount="-1">
                −
              </button>

              <span>${item.quantity}</span>

              <button
                type="button"
                data-action="quantity"
                data-id="${esc(item.id)}"
                data-amount="1">
                +
              </button>

            </div>

            <strong>
              ${money(item.price * item.quantity)}
            </strong>

            <button
              type="button"
              data-action="remove"
              data-id="${esc(item.id)}"
              aria-label="Eliminar">
              ×
            </button>

          </div>
        `).join("")
      : `<p class="cart-empty">
           Tu carrito está vacío.
         </p>`;
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
  }

  /* ==================================================
     CARRUSELES
  ================================================== */

  function moveCarousel(id, direction) {
    const element = document.getElementById(id);

    if (!element) return;

    const cardElement =
      element.querySelector(".product-card");

    const amount = cardElement
      ? cardElement.getBoundingClientRect().width + 15
      : 250;

    element.scrollBy({
      left: amount * direction,
      behavior: "smooth"
    });
  }

  /* ==================================================
     BUSCADOR
  ================================================== */

  function updateSearch(value) {
    state.search = value.trim();

    const desktop = $("#search-input");
    const mobile = $("#mobile-search-input");

    if (desktop && desktop.value !== value) {
      desktop.value = value;
    }

    if (mobile && mobile.value !== value) {
      mobile.value = value;
    }

    renderCatalog();
  }

  /* ==================================================
     SUSCRIPCIÓN
  ================================================== */

  async function subscribeNewsletter(event) {
    event.preventDefault();

    const input = $("#newsletter-email");
    const message = $("#newsletter-message");

    if (!input || !message) return;

    const email = input.value.trim().toLowerCase();

    if (!email || !input.checkValidity()) {
      message.textContent =
        "Ingresá un correo electrónico válido.";

      message.hidden = false;
      return;
    }

    const button = $("#newsletter-form button");
    if (button) button.disabled = true;

    try {
      const { error } = await state.client
        .from("newsletter_subscribers")
        .insert({ email });

      if (error) throw error;

      message.textContent =
        "¡Gracias! Tu solicitud de suscripción fue recibida.";

      message.hidden = false;
      input.value = "";

    } catch (error) {
      console.error(
        "Suscripción no disponible:",
        error
      );

      message.textContent =
        "No se pudo completar la suscripción en este momento.";

      message.hidden = false;

    } finally {
      if (button) button.disabled = false;
    }
  }

  /* ==================================================
     EVENTOS
  ================================================== */

  function setupEvents() {
    document.addEventListener("click", event => {

      const target = event.target.closest(
        "[data-action]"
      );

      if (target) {
        const { action, id } = target.dataset;

        if (action === "details") {
          openDetails(id);
        } else if (action === "add") {
          addToCart(id);
        } else if (action === "quantity") {
          changeQuantity(
            id,
            Number(target.dataset.amount) || 0
          );
        } else if (action === "remove") {
          removeFromCart(id);
        } else if (action === "open-cart") {
          openCart();
        } else if (action === "prev-product") {
          moveProduct(-1);
        } else if (action === "next-product") {
          moveProduct(1);
        } else if (action === "prev-photo") {
          movePhoto(-1);
        } else if (action === "next-photo") {
          movePhoto(1);
        } else if (action === "select-photo") {
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

      const previous = event.target.closest(
        "[data-carousel-prev]"
      );

      if (previous) {
        moveCarousel(
          previous.dataset.carouselPrev,
          -1
        );
        return;
      }

      const next = event.target.closest(
        "[data-carousel-next]"
      );

      if (next) {
        moveCarousel(
          next.dataset.carouselNext,
          1
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
            $("#mobile-search-input")?.focus();
          }
        }
      }

      if (event.target.closest("#search-close")) {
        const panel = $("#search-panel");

        if (panel) panel.hidden = true;
      }

      if (
        event.target.closest(
          "#mobile-menu-toggle"
        )
      ) {
        const nav = $(".main-nav");

        if (nav) {
          const expanded =
            nav.classList.toggle("mobile-open");

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

    $("#checkout-whatsapp")?.addEventListener(
      "click",
      event => {
        event.preventDefault();
        checkout();
      }
    );

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
        updateSearch(event.target.value);
      }
    );

    $("#mobile-search-input")?.addEventListener(
      "input",
      event => {
        updateSearch(event.target.value);
      }
    );

    $("#category-filter")?.addEventListener(
      "change",
      event => {
        state.category = event.target.value;
        renderCatalog();
      }
    );

    $("#gender-filter")?.addEventListener(
      "change",
      event => {
        state.gender = event.target.value;
        renderCatalog();
      }
    );

    $("#sort-products")?.addEventListener(
      "change",
      event => {
        state.sort = event.target.value;
        renderCatalog();
      }
    );

    $("#newsletter-form")?.addEventListener(
      "submit",
      subscribeNewsletter
    );

    const dialog = $("#product-dialog");

    dialog?.addEventListener(
      "click",
      event => {
        if (event.target === dialog) {
          closeDetails();
        }
      }
    );

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

  /* ==================================================
     INICIALIZAR SUPABASE
  ================================================== */

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
      renderItems(
        $("#catalog-products"),
        [],
        "No se pudo conectar con Supabase. Revisá config.js."
      );

      return;
    }

    try {
      state.client = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
      );

      // Cargar categorías
      const categoriesResult = await state.client
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true
        });

      if (categoriesResult.error) {
        console.warn(
          "Categorías:",
          categoriesResult.error
        );
      } else {
        state.categories =
          categoriesResult.data || [];
      }

      // Cargar productos
      const productsResult = await state.client
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
          created_at,
          categories(name,slug)
        `)
        .eq("is_active", true)
        .order("created_at", {
          ascending: false
        });

      if (productsResult.error) {
        throw productsResult.error;
      }

      state.products =
        productsResult.data || [];

      // Cargar promociones
      const promotionsResult = await state.client
        .from("promotions")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", {
          ascending: true
        });

      if (promotionsResult.error) {
        console.warn(
          "Promociones:",
          promotionsResult.error
        );
      } else {
        state.promotions =
          promotionsResult.data || [];
      }

      renderBestsellers();
      renderNewProducts();
      renderPromotions();
      renderOffers();
      renderCatalog();

      console.log(
        STORE_NAME + ": catálogo cargado."
      );

    } catch (error) {
      console.error(
        "Error cargando la tienda:",
        error
      );

      const message =
        "No se pudieron cargar los perfumes. Revisá Supabase.";

      renderItems(
        $("#catalog-products"),
        [],
        message
      );

      renderItems(
        $("#bestsellers-products"),
        [],
        message
      );

      renderItems(
        $("#new-products"),
        [],
        message
      );

      const offers = $("#offers-banner-area");

      if (offers) {
        offers.innerHTML = `
          <p class="empty-products">
            No se pudieron cargar las promociones.
          </p>
        `;
      }

      notify(message);
    }
  }

  /* ==================================================
     INICIO
  ================================================== */

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      init
    );
  } else {
    init();
  }

})();
