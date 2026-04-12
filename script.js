
  // ══════════════════════════════════════════
//  STORAGE（最终稳定版）
// ══════════════════════════════════════════
async function sset(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch (e) {
    console.error("保存失败:", e);
  }
}

async function sget(k) {
  try {
    const r = localStorage.getItem(k);
    return r ? JSON.parse(r) : null;
  } catch (e) {
    console.error("读取失败:", e);
    return null;
  }
}


  folders.forEach(f => { if (!f.files) f.files = []; });

  const grid = document.getElementById("folderGrid");
  const addBtn = document.getElementById("addBtn");
  const modal = document.getElementById("modal");
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const folderInput = document.getElementById("folderInput");
  const searchInput = document.getElementById("searchInput");

  let currentPage = window.location.pathname.includes("starred") ? "starred" : "all";

  function save() {
    localStorage.setItem("folders", JSON.stringify(folders));
  }

  // Folder emojis for variety
  const folderEmojis = ["\uD83D\uDCC2", "\uD83C\uDF38", "\uD83C\uDF1F", "\uD83C\uDF08", "\uD83C\uDF3F", "\uD83D\uDC9C", "\uD83D\uDCAB", "\uD83C\uDF80"];

  function getFolderEmoji(name) {
    let hash = 0;
    for (let c of name) hash += c.charCodeAt(0);
    return folderEmojis[hash % folderEmojis.length];
  }

  function render(search = "") {
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = folders.filter(f => {
      const matchPage = (currentPage === "starred") ? f.starred : true;
      const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
      return matchPage && matchSearch;
    });

    filtered.forEach(folder => {
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.id = folder.id;

      card.innerHTML = `
        <div style="font-size:32px;margin-bottom:10px;animation:float 3s ease-in-out infinite;">${getFolderEmoji(folder.name)}</div>
        <p class="folder-title"><span>${folder.name}</span></p>
        <p style="font-size:11px;color:#c9a0c9;margin:4px 0 12px;font-weight:600;">${folder.files.length} file${folder.files.length !== 1 ? "s" : ""}</p>
        <div class="card-actions">
          <button class="star-btn" data-star="${folder.id}">${folder.starred ? "\u2B50" : "\u2606"}</button>
          <button class="delete-btn" data-delete="${folder.id}">Delete</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  const toggleStar = (id) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      folder.starred = !folder.starred;
      save();
      render(searchInput.value);
    }
  };

  const deleteFolder = (id) => {
    if (confirm("Delete this folder?")) {
      folders = folders.filter(f => f.id !== id);
      save();
      render(searchInput.value);
    }
  };

  const renameFolder = (id, textSpan) => {
    const folder = folders.find(f => f.id === id);
    const input = document.createElement("input");
    input.type = "text";
    input.value = folder.name;
    input.className = "rename-input";
    input.style.cssText = "width:100%;border-radius:10px;padding:4px 8px;border:2px solid #ffb3d1;font-family:Nunito,sans-serif;font-size:14px;";

    textSpan.replaceWith(input);
    input.focus();

    const finishRename = () => {
      const newName = input.value.trim();
      if (newName) folder.name = newName;
      save();
      render(searchInput.value);
    };

    input.onblur = finishRename;
    input.onkeydown = (e) => { if (e.key === "Enter") input.blur(); };
  };

  grid.addEventListener("click", (e) => {
    const starBtn = e.target.closest("[data-star]");
    const deleteBtn = e.target.closest("[data-delete]");
    const card = e.target.closest(".card");

    if (starBtn) { toggleStar(starBtn.dataset.star); return; }
    if (deleteBtn) { deleteFolder(deleteBtn.dataset.delete); return; }
    if (card) { window.location.href = `folder.html?id=${card.dataset.id}`; }
  });

  grid.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".card");
    const textSpan = e.target.closest(".folder-title span");
    if (card && textSpan) renameFolder(card.dataset.id, textSpan);
  });

  const openModal = () => {
    modal.style.display = "flex";
    folderInput.focus();
    folderInput.style.border = "2px solid #ffb3d1";
  };

  const closeModal = () => {
    modal.style.display = "none";
    folderInput.value = "";
    folderInput.style.border = "2px solid #ffb3d1";
  };

  addBtn.onclick = openModal;
  cancelBtn.onclick = closeModal;

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });

  saveBtn.onclick = async () => {
    const name = folderInput.value.trim();
    if (!name) {
      folderInput.style.border = "2px solid #e05a5a";
      folderInput.focus();
      return;
    }
    folders.push({ id: crypto.randomUUID(), name, starred: false, files: [] });
    save();
    render();
    closeModal();
    await syncSave();
  };

  if (searchInput) searchInput.oninput = () => render(searchInput.value);

  render();
;