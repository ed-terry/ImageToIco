// State management
const state = {
  files: [],
  selectedFile: null,
  converting: false,
  stats: {
    total: 0,
    converted: 0,
    failed: 0,
  },
};

// DOM Elements
const dropZone = document.getElementById("dropZone");
const browseBtn = document.getElementById("browseBtn");
const filesList = document.getElementById("filesList");
const convertBtn = document.getElementById("convertBtn");
const convertSingleBtn = document.getElementById("convertSingleBtn");
const clearBtn = document.getElementById("clearBtn");
const selectDirBtn = document.getElementById("selectDirBtn");
const outputDir = document.getElementById("outputDir");
const progressSection = document.getElementById("progressSection");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const statusText = document.getElementById("statusText");
const statsFiles = document.getElementById("statsFiles");
const statsConverted = document.getElementById("statsConverted");
const statsFailed = document.getElementById("statsFailed");

// Initialize
document.addEventListener("DOMContentLoaded", () => {
  setupEventListeners();
  updateUI();
});

function setupEventListeners() {
  // Drag and drop
  dropZone.addEventListener("dragover", handleDragOver);
  dropZone.addEventListener("dragleave", handleDragLeave);
  dropZone.addEventListener("drop", handleDrop);
  dropZone.addEventListener("click", () => browseBtn.click());

  // File selection
  browseBtn.addEventListener("click", async (e) => {
    e.stopPropagation();
    const files = await window.electronAPI.selectFiles();
    if (files && files.length > 0) {
      addFiles(files);
    }
  });

  // Convert buttons
  convertBtn.addEventListener("click", handleConvertAll);
  convertSingleBtn.addEventListener("click", handleConvertSelected);

  // Other buttons
  clearBtn.addEventListener("click", clearFiles);
  selectDirBtn.addEventListener("click", selectOutputDirectory);
}

function handleDragOver(e) {
  e.preventDefault();
  dropZone.classList.add("drag-over");
}

function handleDragLeave(e) {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
}

function handleDrop(e) {
  e.preventDefault();
  dropZone.classList.remove("drag-over");

  const files = Array.from(e.dataTransfer.files).map((f) => f.path);
  addFiles(files);
}

function addFiles(filePaths) {
  const newFiles = filePaths.map((path) => ({
    id: Date.now() + Math.random(),
    path: path,
    name: path.split(/[\\/]/).pop(),
    status: "pending", // pending, converting, success, error
    message: "",
  }));

  state.files.push(...newFiles);
  state.stats.total = state.files.length;
  updateUI();
  updateStatus(`Added ${newFiles.length} file(s)`);
}

function removeFile(fileId) {
  state.files = state.files.filter((f) => f.id !== fileId);
  state.stats.total = state.files.length;
  if (state.selectedFile === fileId) {
    state.selectedFile = null;
  }
  updateUI();
}

function selectFile(fileId) {
  state.selectedFile = fileId;
  updateUI();
}

function clearFiles() {
  if (state.converting) return;

  state.files = [];
  state.selectedFile = null;
  state.stats = { total: 0, converted: 0, failed: 0 };
  updateUI();
  updateStatus("All files cleared");
}

async function selectOutputDirectory() {
  const dir = await window.electronAPI.selectDirectory();
  if (dir) {
    outputDir.value = dir;
  }
}

function getSelectedSizes() {
  const checkboxes = document.querySelectorAll(".size-checkbox:checked");
  return Array.from(checkboxes).map((cb) => parseInt(cb.value));
}

async function handleConvertAll() {
  if (state.converting || state.files.length === 0) return;

  state.converting = true;
  state.stats.converted = 0;
  state.stats.failed = 0;

  const sizes = getSelectedSizes();
  if (sizes.length === 0) {
    updateStatus("Please select at least one size");
    state.converting = false;
    return;
  }

  const outputDirectory = outputDir.value || "./output";

  progressSection.classList.remove("hidden");
  updateUI();

  for (let i = 0; i < state.files.length; i++) {
    const file = state.files[i];
    file.status = "converting";
    updateUI();

    const outputPath = `${outputDirectory}/${file.name.replace(
      /\.[^.]+$/,
      ".ico"
    )}`;

    try {
      const result = await window.electronAPI.convertImage({
        inputPath: file.path,
        outputPath: outputPath,
        sizes: sizes,
      });

      if (result.success) {
        file.status = "success";
        file.message = `Saved to ${outputPath}`;
        state.stats.converted++;
      } else {
        file.status = "error";
        file.message = result.error;
        state.stats.failed++;
      }
    } catch (error) {
      file.status = "error";
      file.message = error.message;
      state.stats.failed++;
    }

    const progress = ((i + 1) / state.files.length) * 100;
    updateProgress(progress);
    updateUI();
  }

  state.converting = false;
  updateStatus(
    `Conversion complete • ${state.stats.converted} successful, ${state.stats.failed} failed`
  );

  setTimeout(() => {
    progressSection.classList.add("hidden");
  }, 2000);
}

async function handleConvertSelected() {
  if (state.converting || !state.selectedFile) return;

  const file = state.files.find((f) => f.id === state.selectedFile);
  if (!file) return;

  state.converting = true;
  const sizes = getSelectedSizes();

  if (sizes.length === 0) {
    updateStatus("Please select at least one size");
    state.converting = false;
    return;
  }

  const outputPath = await window.electronAPI.saveFileDialog(
    file.name.replace(/\.[^.]+$/, ".ico")
  );

  if (!outputPath) {
    state.converting = false;
    return;
  }

  file.status = "converting";
  updateUI();

  try {
    const result = await window.electronAPI.convertImage({
      inputPath: file.path,
      outputPath: outputPath,
      sizes: sizes,
    });

    if (result.success) {
      file.status = "success";
      file.message = `Saved to ${outputPath}`;
      state.stats.converted++;
      updateStatus(`Conversion successful`);
    } else {
      file.status = "error";
      file.message = result.error;
      state.stats.failed++;
      updateStatus(`Conversion failed: ${result.error}`);
    }
  } catch (error) {
    file.status = "error";
    file.message = error.message;
    state.stats.failed++;
    updateStatus(`Error: ${error.message}`);
  }

  state.converting = false;
  updateUI();
}

function updateProgress(percent) {
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${Math.round(percent)}%`;
}

function updateUI() {
  // Update file list
  filesList.innerHTML = "";

  if (state.files.length === 0) {
    filesList.innerHTML = `
      <div class="card rounded-xl p-12 text-center">
        <div class="text-4xl mb-3 opacity-30">📭</div>
        <p class="text-sm text-gray-400">No files yet</p>
      </div>
    `;
  } else {
    state.files.forEach((file) => {
      const fileItem = createFileItem(file);
      filesList.appendChild(fileItem);
    });
  }

  // Update statistics
  statsFiles.textContent = state.stats.total;
  statsConverted.textContent = state.stats.converted;
  statsFailed.textContent = state.stats.failed;

  // Update buttons
  convertBtn.disabled = state.converting || state.files.length === 0;
  convertSingleBtn.disabled = state.converting || !state.selectedFile;
  clearBtn.disabled = state.converting;

  if (convertBtn.disabled) {
    convertBtn.classList.add("opacity-40", "cursor-not-allowed");
  } else {
    convertBtn.classList.remove("opacity-40", "cursor-not-allowed");
  }

  if (convertSingleBtn.disabled) {
    convertSingleBtn.classList.add("opacity-40", "cursor-not-allowed");
  } else {
    convertSingleBtn.classList.remove("opacity-40", "cursor-not-allowed");
  }
}

function createFileItem(file) {
  const div = document.createElement("div");
  div.className = `file-item card card-hover rounded-xl p-4 cursor-pointer transition ${
    state.selectedFile === file.id ? "ring-2 ring-indigo-500 bg-indigo-50" : ""
  }`;

  div.addEventListener("click", () => selectFile(file.id));

  let statusIcon = "⏳";
  let statusColor = "text-gray-400";

  if (file.status === "converting") {
    statusIcon = "🔄";
    statusColor = "text-indigo-500";
  } else if (file.status === "success") {
    statusIcon = "✅";
    statusColor = "text-green-500";
  } else if (file.status === "error") {
    statusIcon = "❌";
    statusColor = "text-red-500";
  }

  div.innerHTML = `
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3 flex-1 min-w-0">
        <div class="text-xl flex-shrink-0">${statusIcon}</div>
        <div class="flex-1 min-w-0">
          <div class="text-sm font-medium text-gray-900 truncate">${file.name}</div>
          <div class="text-xs text-gray-400 truncate mt-0.5">${file.path}</div>
          ${
            file.message
              ? `<div class="text-xs ${
                  file.status === "error" ? "text-red-500" : "text-green-500"
                } mt-1">${file.message}</div>`
              : ""
          }
        </div>
      </div>
      <button class="remove-btn ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0">
        ✕
      </button>
    </div>
  `;

  const removeBtn = div.querySelector(".remove-btn");
  removeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    removeFile(file.id);
  });

  return div;
}

function updateStatus(message) {
  statusText.textContent = message;
}
