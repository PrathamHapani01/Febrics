document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("bestsellers-grid");
  if (!grid) return;

  try {
    const fabrics = await fetchFabrics();
    const top = fabrics.slice(0, 4);
    grid.innerHTML = top.map(productCardHtml).join("");
  } catch {
    grid.innerHTML = '<p class="empty-state">Start the Python server to see fabrics.</p>';
  }
});
