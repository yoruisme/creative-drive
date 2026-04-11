const params = new URLSearchParams(window.location.search);
const id = params.get("id");

let folders = JSON.parse(localStorage.getItem("folders")) || [];
const folder = folders.find(f => f.id === id);

if (!folder) {
  document.body.innerHTML = "<p style='padding:20px'>找不到这个文件夹，请返回首页。</p>";
  throw new Error("Folder not found");
}

const title = document.getElementById("folderTitle");
const grid = document.getElementById("fileGrid");

title.textContent = folder.name;

// ===== 判断是否为图片 =====
function isImage(filename) {
  return /\.(png|jpe?g|gif|webp|svg|bmp)$/i.test(filename);
}

// ===== 文件图标 =====
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  const icons = {
    pdf: "PDF", zip: "ZIP", rar: "ZIP",
    js: "JS", ts: "JS", html: "HTML", css: "CSS",
    py: "PY", java: "JAVA", cpp: "CPP", c: "CPP",
    mp4: "VIDEO", mov: "VIDEO", mp3: "AUDIO",
    doc: "DOC", docx: "DOC", txt: "DOC",
    xls: "XLS", xlsx: "XLS", ppt: "XLS", pptx: "XLS",
  };
  return icons[ext] || "FILE";
}

// ===== 渲染 =====
function render() {
  grid.innerHTML = "";

  folder.files.forEach((file, i) => {
    const card = document.createElement("div");
    card.className = "card file-card";

    if (isImage(file.name)) {
      card.innerHTML = `
        <img src="${file.url}" style="width:100%;border-radius:8px;display:block;margin-bottom:8px;">
        <p class="file-name">${file.name}</p>
        <div class="file-actions">
          <a href="${file.url}" download="${file.name}">
            <button class="download-btn">Download</button>
          </a>
          <button onclick="deleteFile(${i})">Delete</button>
        </div>
      `;
    } else {
      card.innerHTML = `
        <div class="file-icon">${getFileIcon(file.name)}</div>
        <p class="file-name">${file.name}</p>
        <div class="file-actions">
          <a href="${file.url}" download="${file.name}">
            <button class="download-btn">Download</button>
          </a>
          <button onclick="deleteFile(${i})">Delete</button>
        </div>
      `;
    }

    grid.appendChild(card);
  });

  localStorage.setItem("folders", JSON.stringify(folders));
}

// ===== 删除 =====
function deleteFile(i) {
  if (confirm("确定删除这个文件吗？")) {
    folder.files.splice(i, 1);
    render();
  }
}

// ===== 上传（支持所有类型） =====
document.getElementById("addFileBtn").onclick = () => {
  const input = document.createElement("input");
  input.type = "file";

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      folder.files.push({ name: file.name, url: reader.result });
      render();
    };
    reader.readAsDataURL(file);
  };

  input.click();
};

render();