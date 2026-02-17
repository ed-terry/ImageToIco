const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const IcoConverter = require("./converter");

const converter = new IcoConverter();
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    backgroundColor: "#fafafa",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    frame: true,
    titleBarStyle: "default",
    icon: path.join(__dirname, "../assets/icon.png"),
  });

  mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));

  // Open DevTools in development
  if (process.argv.includes("--dev")) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// Convert single file
ipcMain.handle(
  "convert-image",
  async (event, { inputPath, outputPath, sizes }) => {
    try {
      const result = await converter.convert(inputPath, outputPath, sizes);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
);

// Batch convert
ipcMain.handle(
  "batch-convert",
  async (event, { inputPaths, outputDir, sizes }) => {
    try {
      const results = await converter.batchConvert(inputPaths, outputDir, {
        sizes,
      });
      return results;
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
);

// Select files dialog
ipcMain.handle("select-files", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "Images", extensions: converter.getSupportedFormats() },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  return result.filePaths;
});

// Select output directory
ipcMain.handle("select-directory", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory", "createDirectory"],
  });

  return result.filePaths[0];
});

// Get supported formats
ipcMain.handle("get-formats", () => {
  return converter.getSupportedFormats();
});

// Save file dialog
ipcMain.handle("save-file-dialog", async (event, defaultPath) => {
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath,
    filters: [{ name: "Icon Files", extensions: ["ico"] }],
  });

  return result.filePath;
});
