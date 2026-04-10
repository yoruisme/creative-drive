// 1. 读取数据（没有就给默认）
let folders = JSON.parse(localStorage.getItem("folders")) || [
  { name: "UI Design", starred: false },
  { name: "Coding", starred: true }
];

// 2. 判断当前页面（放在初始化之前）
let currentPage = "all";
if (window.location.pathname.includes("starred")) {
  currentPage = "starred";
}

// 3. 存回 storage
function saveFolders() {
  localStorage.setItem("folders", JSON.stringify(folders));
}

// 4. 渲染函数
function renderFolders(filter = "all", searchText = "") {
  const grid = document.getElementById("folderGrid");
  if (!grid) return; // 安全检查：防止 HTML 还没加载或 ID 写错
  grid.innerHTML = "";

  folders.forEach((folder, index) => {
    // ⭐ 收藏过滤
    if (filter === "starred" && !folder.starred) return;

    // 🔍 搜索过滤
    if (!folder.name.toLowerCase().includes(searchText.toLowerCase().trim())) return;

    let card = document.createElement("div");
    card.classList.add("card");

    // 注意：这里建议保留 ondblclick 调用 editInline 或是 renameFolder
    card.innerHTML = `
      <p ondblclick="editInline(${index}, this)">📁 ${folder.name}</p>
      <button onclick="toggleStar(${index})">
        ${folder.starred ? "⭐" : "☆"}
      </button>
    `;

    grid.appendChild(card);
  });
}

// --- 这里删除了原来多余的 grid.appendChild(card) ---

// 5. 新增 folder
document.getElementById("addBtn")?.addEventListener("click", () => {
  let name = prompt("Enter folder name:");
  if (name && name.trim() !== "") {
    folders.push({ name: name.trim(), starred: false });
    saveFolders();
    renderFolders(currentPage);
  }
});

// 6. 收藏切换
function toggleStar(index) {
  folders[index].starred = !folders[index].starred;
  saveFolders();
  renderFolders(currentPage);
}

// 7. 重命名 (Prompt 方式)
function renameFolder(index) {
  let newName = prompt("Rename your folder:", folders[index].name);
  if (newName && newName.trim() !== "") {
    folders[index].name = newName.trim();
    saveFolders();
    renderFolders(currentPage);
  }
}

// 8. 行内编辑 (更高级的交互)
function editInline(index, element) {
  let currentName = folders[index].name;
  let input = document.createElement("input");
  input.value = currentName;
  input.style.width = "80%"; // 稍微控制一下样式

  element.replaceWith(input);
  input.focus();

  input.addEventListener("blur", () => {
    const finalValue = input.value.trim();
    folders[index].name = finalValue || currentName;
    saveFolders();
    renderFolders(currentPage);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") input.blur();
  });
}

// 9. 搜索监听
const searchInput = document.getElementById("searchInput");
searchInput?.addEventListener("input", () => {
  renderFolders(currentPage, searchInput.value);
});

// 10. 初始化
renderFolders(currentPage, "");