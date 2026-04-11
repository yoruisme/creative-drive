document.addEventListener("DOMContentLoaded", () => {
  let folders = [];

  // ===== 数据初始化 =====
  try {
    const stored = localStorage.getItem("folders");
    if (!stored) {
      folders = [
        { id: crypto.randomUUID(), name: "UI Design", starred: false, files: [] },
        { id: crypto.randomUUID(), name: "Coding", starred: true, files: [] }
      ];
      localStorage.setItem("folders", JSON.stringify(folders));
    } else {
      folders = JSON.parse(stored);
    }
  } catch (e) {
    folders = [];
  }

  // 保证每个文件夹对象完整
  folders.forEach(f => { if (!f.files) f.files = []; });

  // ===== DOM 元素 =====
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

  // ===== 渲染逻辑 =====
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
        <p class="folder-title">📁 <span>${folder.name}</span></p>
        <p style="font-size:12px;color:#999;margin:4px 0 12px;">${folder.files.length} file${folder.files.length !== 1 ? "s" : ""}</p>
        <div class="card-actions">
          <button class="star-btn" data-star="${folder.id}">
            ${folder.starred ? "⭐" : "☆"}
          </button>
          <button class="delete-btn" data-delete="${folder.id}">🗑</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // ===== 操作函数 =====
  const toggleStar = (id) => {
    const folder = folders.find(f => f.id === id);
    if (folder) {
      folder.starred = !folder.starred;
      save();
      render(searchInput.value);
    }
  };

  const deleteFolder = (id) => {
    if (confirm("确定删除这个文件夹吗？")) {
      folders = folders.filter(f => f.id !== id);
      save();
      render(searchInput.value);
    }
  };

  const renameFolder = (id, textSpan) => {
    const folder = folders.find(f => f.id === id);
    const input = document.createElement("input");
    input.value = folder.name;
    input.className = "rename-input";

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

  // ===== 事件委托 =====
  grid.addEventListener("click", (e) => {
    const starBtn = e.target.closest("[data-star]");
    const deleteBtn = e.target.closest("[data-delete]");
    const card = e.target.closest(".card");

    if (starBtn) {
      toggleStar(starBtn.dataset.star);
      return;
    }

    if (deleteBtn) {
      deleteFolder(deleteBtn.dataset.delete);
      return;
    }

    if (card) {
      window.location.href = `folder.html?id=${card.dataset.id}`;
    }
  });

  // 双击重命名
  grid.addEventListener("dblclick", (e) => {
    const card = e.target.closest(".card");
    const textSpan = e.target.closest(".folder-title span");
    if (card && textSpan) {
      renameFolder(card.dataset.id, textSpan);
    }
  });

  // ===== Modal 逻辑 =====
  const openModal = () => {
    modal.style.display = "flex";
    folderInput.focus();
    folderInput.style.border = "1px solid #ddd"; // 重置红框
  };

  const closeModal = () => {
    modal.style.display = "none";
    folderInput.value = "";
    folderInput.style.border = "1px solid #ddd";
  };

  addBtn.onclick = openModal;
  cancelBtn.onclick = closeModal;

  // Escape 键关闭 modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") closeModal();
  });

  saveBtn.onclick = () => {
    const name = folderInput.value.trim();
    if (!name) {
      // 空名称时给红框提示
      folderInput.style.border = "1px solid #e24b4a";
      folderInput.focus();
      return;
    }
    folders.push({ id: crypto.randomUUID(), name, starred: false, files: [] });
    save();
    render();
    closeModal();
  };

  // 搜索逻辑
  if (searchInput) {
    searchInput.oninput = () => render(searchInput.value);
  }

  render();
});