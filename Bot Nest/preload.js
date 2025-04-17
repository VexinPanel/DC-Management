const { contextBridge, ipcRenderer } = require("electron")

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  // Bot management
  getBots: () => ipcRenderer.invoke("get-bots"),
  createBot: (botData) => ipcRenderer.invoke("create-bot", botData),
  getBotDetails: (botId) => ipcRenderer.invoke("get-bot-details", botId),
  startBot: (botId) => ipcRenderer.invoke("start-bot", botId),
  stopBot: (botId) => ipcRenderer.invoke("stop-bot", botId),
  updateBotSettings: (data) => ipcRenderer.invoke("update-bot-settings", data),
  deleteBot: (botId) => ipcRenderer.invoke("delete-bot", botId),

  // Command management
  saveCommand: (data) => ipcRenderer.invoke("save-command", data),
  deleteCommand: (data) => ipcRenderer.invoke("delete-command", data),

  // Backup management
  createBackup: (botId) => ipcRenderer.invoke("create-backup", botId),
  downloadBackup: (data) => ipcRenderer.invoke("download-backup", data),
  uploadBackup: (botId) => ipcRenderer.invoke("upload-backup", botId),
  restoreBackup: (data) => ipcRenderer.invoke("restore-backup", data),
  deleteBackup: (data) => ipcRenderer.invoke("delete-backup", data),
})
