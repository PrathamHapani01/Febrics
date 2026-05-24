document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const main = document.getElementById("product-main");
  const related = document.getElementById("related-grid");

  if (!slug) {
    main.innerHTML = '<p class="empty-state">Product not specified.</p>';
    return;
  }

  try {
    const fabric = await fetchFabric(slug);
    document.title = fabric.name + " — Sky Tex";

    main.innerHTML = `
      <nav class="breadcrumb">
        <a href="index.html">Home</a> / <a href="shop.html">Shop</a> / ${fabric.name}
      </nav>
      <div class="product-detail">
        <div class="product-detail__image">
          <img src="${fabric.image_url}" alt="${fabric.name}" />
        </div>
        <div class="product-detail__info">
          <span class="tag">${fabric.material}</span>
          <h1>${fabric.name}</h1>
          <p class="product-detail__reviews">(${fabric.reviews_count} reviews)</p>
          <p class="product-detail__price">${formatPrice(fabric.price_inr)}</p>
          <p class="product-detail__desc">${fabric.description}</p>
          <dl class="spec-list">
            <div><dt>Material</dt><dd>${fabric.material}</dd></div>
            <div><dt>Color</dt><dd>${fabric.color}</dd></div>
            <div><dt>Weight</dt><dd>${fabric.weight}</dd></div>
            <div><dt>Best for</dt><dd>${fabric.use_case}</dd></div>
            <div><dt>Sustainability</dt><dd>${fabric.sustainability}</dd></div>
          </dl>
          <button class="btn btn--primary btn--block" type="button">Add to Cart — ${formatPrice(fabric.price_inr).replace("/yd", "")}</button>
          <ul class="trust-badges">
            <li>Free shipping over ₹6,500</li>
            <li>Eco-friendly fibers</li>
            <li>Quality guaranteed</li>
          </ul>
        </div>
      </div>
    `;

    const all = await fetchFabrics();
    const others = all.filter((f) => f.slug !== slug).slice(0, 4);
    related.innerHTML = others.map(productCardHtml).join("");
  } catch {
    main.innerHTML = '<p class="empty-state">Fabric not found.</p>';
  }
});
