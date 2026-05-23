const ADMIN_OPTS = { credentials: "include" };

let csrfToken = null;

function escapeHtml(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

function adminHeaders() {
  const headers = { "Content-Type": "application/json" };
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }
  return headers;
}

async function checkAuth() {
  const res = await fetch("/api/admin/me", ADMIN_OPTS);
  const data = await res.json();
  if (data.csrf_token) {
    csrfToken = data.csrf_token;
  }
  return data;
}

async function login(username, password) {
  const res = await fetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Login failed");
  if (data.csrf_token) {
    csrfToken = data.csrf_token;
  }
  return data;
}

async function logout() {
  await fetch("/api/admin/logout", {
    method: "POST",
    headers: adminHeaders(),
    credentials: "include",
  });
  csrfToken = null;
}

async function adminFetchFabrics() {
  const res = await fetch("/api/fabrics", ADMIN_OPTS);
  return res.json();
}

async function createFabric(payload) {
  const res = await fetch("/api/fabrics", {
    method: "POST",
    headers: adminHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Create failed");
  return data;
}

async function updateFabric(id, payload) {
  const res = await fetch("/api/fabrics/" + id, {
    method: "PUT",
    headers: adminHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Update failed");
  return data;
}

async function deleteFabric(id) {
  const res = await fetch("/api/fabrics/" + id, {
    method: "DELETE",
    headers: adminHeaders(),
    credentials: "include",
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || "Delete failed");
  }
}

function show(el) {
  el.classList.remove("hidden");
}
function hide(el) {
  el.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", async () => {
  const loginSection = document.getElementById("login-section");
  const dashboard = document.getElementById("admin-dashboard");
  const loginForm = document.getElementById("login-form");
  const loginError = document.getElementById("login-error");
  const logoutBtn = document.getElementById("logout-btn");
  const fabricForm = document.getElementById("fabric-form");
  const fabricTable = document.getElementById("fabric-table-body");
  const formTitle = document.getElementById("form-title");
  const cancelEdit = document.getElementById("cancel-edit");
  const formError = document.getElementById("form-error");

  let editingId = null;

  async function loadDashboard() {
    const fabrics = await adminFetchFabrics();
    fabricTable.innerHTML = fabrics
      .map(
        (f) => `
      <tr>
        <td><img src="${escapeHtml(f.image_url)}" alt="" class="admin-thumb" /></td>
        <td>${escapeHtml(f.name)}</td>
        <td>${escapeHtml(f.material)}</td>
        <td>${escapeHtml(formatPrice(f.price_inr))}</td>
        <td class="admin-actions">
          <button type="button" class="btn btn--ghost btn--sm" data-edit="${f.id}">Edit</button>
          <button type="button" class="btn btn--danger btn--sm" data-delete="${f.id}">Delete</button>
        </td>
      </tr>
    `
      )
      .join("");

    fabricTable.querySelectorAll("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", () => startEdit(fabrics.find((f) => f.id === Number(btn.dataset.edit))));
    });
    fabricTable.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this fabric?")) return;
        await deleteFabric(btn.dataset.delete);
        await loadDashboard();
      });
    });
  }

  function resetForm() {
    editingId = null;
    fabricForm.reset();
    formTitle.textContent = "Add new fabric";
    cancelEdit.classList.add("hidden");
    formError.textContent = "";
    fabricForm.image_file.value = "";
  }

  function startEdit(fabric) {
    editingId = fabric.id;
    formTitle.textContent = "Edit fabric";
    cancelEdit.classList.remove("hidden");
    fabricForm.name.value = fabric.name;
    fabricForm.slug.value = fabric.slug;
    fabricForm.material.value = fabric.material;
    fabricForm.color.value = fabric.color;
    fabricForm.use_case.value = fabric.use_case;
    fabricForm.price_inr.value = fabric.price_inr;
    fabricForm.image_url.value = fabric.image_url;
    fabricForm.description.value = fabric.description;
    fabricForm.weight.value = fabric.weight;
    fabricForm.sustainability.value = fabric.sustainability;
    fabricForm.reviews_count.value = fabric.reviews_count;
    fabricForm.scrollIntoView({ behavior: "smooth" });
  }

  async function showDashboard() {
    hide(loginSection);
    show(dashboard);
    await loadDashboard();
  }

  const auth = await checkAuth();
  if (auth.authenticated) {
    await showDashboard();
  }

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginError.textContent = "";
    try {
      await login(loginForm.username.value, loginForm.password.value);
      await showDashboard();
    } catch (err) {
      loginError.textContent = err.message;
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await logout();
    resetForm();
    show(loginSection);
    hide(dashboard);
  });

  cancelEdit.addEventListener("click", resetForm);

  fabricForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    formError.textContent = "";

    let imageUrl = fabricForm.image_url.value.trim();
    const imageFile = fabricForm.image_file.files[0];
    if (imageFile) {
      const uploadData = new FormData();
      uploadData.append("image", imageFile);

      const uploadRes = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: csrfToken ? { "X-CSRF-Token": csrfToken } : {},
        credentials: "include",
        body: uploadData,
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        throw new Error(uploadJson.error || "Image upload failed");
      }
      imageUrl = uploadJson.image_url;
    }

    if (!imageUrl) {
      throw new Error("Image URL or image file is required");
    }

    const payload = {
      name: fabricForm.name.value.trim(),
      slug: fabricForm.slug.value.trim() || undefined,
      material: fabricForm.material.value,
      color: fabricForm.color.value.trim(),
      use_case: fabricForm.use_case.value,
      price_inr: fabricForm.price_inr.value,
      image_url: imageUrl,
      description: fabricForm.description.value.trim(),
      weight: fabricForm.weight.value.trim(),
      sustainability: fabricForm.sustainability.value.trim(),
      reviews_count: fabricForm.reviews_count.value || 0,
    };
    try {
      if (editingId) {
        await updateFabric(editingId, payload);
      } else {
        await createFabric(payload);
      }
      resetForm();
      await loadDashboard();
    } catch (err) {
      formError.textContent = err.message;
    }
  });
});
