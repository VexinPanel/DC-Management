// Assuming these are defined elsewhere, likely in main.js or similar
// For the sake of this example, we'll declare them as empty functions.
// In a real application, these would be properly imported or defined.
const state = {}
function showToast(message) {
  console.log("Toast:", message)
}
function loadBot(botId) {
  console.log("Loading bot:", botId)
}
function showConfirmDialog(title, message, callback) {
  if (confirm(message)) {
    callback()
  }
}

// Render backups list
function renderBackups() {
  const backupsList = document.getElementById("backups-list")
  const noBackupsMessage = document.getElementById("no-backups-message")

  // Clear the current list
  backupsList.innerHTML = ""

  if (!state.backups || state.backups.length === 0) {
    // Show the "no backups" message
    backupsList.appendChild(noBackupsMessage)
  } else {
    // Hide the "no backups" message and show the backups
    if (noBackupsMessage.parentNode === backupsList) {
      backupsList.removeChild(noBackupsMessage)
    }

    // Create backup items
    state.backups.forEach((backup, index) => {
      const backupItem = createBackupItem(backup, index)
      backupsList.appendChild(backupItem)
    })
  }
}

// Create a backup item element
function createBackupItem(backupName, index) {
  const item = document.createElement("div")
  item.className = "backup-item stagger-item"

  // Format the date from the backup name if possible
  let displayName = backupName
  if (backupName.startsWith("backup-")) {
    try {
      const dateStr = backupName.replace("backup-", "").replace(".zip", "")
      const date = new Date(dateStr.replace(/-/g, ":"))
      displayName = `Backup from ${date.toLocaleString()}`
    } catch (e) {
      // If parsing fails, just use the original name
      displayName = backupName
    }
  }

  item.innerHTML = `
    <div class="backup-name">${displayName}</div>
    <div class="backup-actions">
      <button class="btn btn-secondary btn-icon download-backup" title="Download Backup">
        <span class="icon">💾</span>
      </button>
      <button class="btn btn-primary btn-icon restore-backup" title="Restore Backup">
        <span class="icon">🔄</span>
      </button>
      <button class="btn btn-danger btn-icon delete-backup" title="Delete Backup">
        <span class="icon">🗑️</span>
      </button>
    </div>
  `

  // Add download event
  item.querySelector(".download-backup").addEventListener("click", () => {
    downloadBackup(backupName)
  })

  // Add restore event
  item.querySelector(".restore-backup").addEventListener("click", () => {
    restoreBackup(backupName)
  })

  // Add delete event
  item.querySelector(".delete-backup").addEventListener("click", () => {
    deleteBackup(backupName)
  })

  // Add animation delay based on index
  item.style.animationDelay = `${index * 0.1}s`

  return item
}

// Create backup
document.getElementById("create-backup-btn").addEventListener("click", async () => {
  if (!state.currentBot) return

  try {
    showToast("Creating backup...")

    const result = await window.api.createBackup(state.currentBot.id)

    if (result.success) {
      // Update backups list
      await loadBot(state.currentBot.id)
      showToast("Backup created successfully")
    } else {
      showToast(`Failed to create backup: ${result.error}`)
    }
  } catch (error) {
    console.error("Error creating backup:", error)
    showToast("Failed to create backup")
  }
})

// Upload backup
document.getElementById("upload-backup-btn").addEventListener("click", async () => {
  if (!state.currentBot) return

  try {
    const result = await window.api.uploadBackup(state.currentBot.id)

    if (result.success) {
      // Update backups list
      await loadBot(state.currentBot.id)
      showToast("Backup uploaded successfully")
    } else {
      showToast(`Failed to upload backup: ${result.error}`)
    }
  } catch (error) {
    console.error("Error uploading backup:", error)
    showToast("Failed to upload backup")
  }
})

// Download backup
async function downloadBackup(backupName) {
  if (!state.currentBot) return

  try {
    const result = await window.api.downloadBackup({
      botId: state.currentBot.id,
      backupName: backupName,
    })

    if (result.success) {
      showToast("Backup downloaded successfully")
    } else {
      showToast(`Failed to download backup: ${result.error}`)
    }
  } catch (error) {
    console.error("Error downloading backup:", error)
    showToast("Failed to download backup")
  }
}

// Restore backup
async function restoreBackup(backupName) {
  if (!state.currentBot) return

  showConfirmDialog(
    "Restore Backup",
    `Are you sure you want to restore from "${backupName}"? This will overwrite your current bot configuration.`,
    async () => {
      try {
        showToast("Restoring backup...")

        const result = await window.api.restoreBackup({
          botId: state.currentBot.id,
          backupName: backupName,
        })

        if (result.success) {
          // Update bot details
          await loadBot(state.currentBot.id)
          showToast("Backup restored successfully")
        } else {
          showToast(`Failed to restore backup: ${result.error}`)
        }
      } catch (error) {
        console.error("Error restoring backup:", error)
        showToast("Failed to restore backup")
      }
    },
  )
}

// Delete backup
async function deleteBackup(backupName) {
  if (!state.currentBot) return

  showConfirmDialog("Delete Backup", `Are you sure you want to delete the backup "${backupName}"?`, async () => {
    try {
      const result = await window.api.deleteBackup({
        botId: state.currentBot.id,
        backupName: backupName,
      })

      if (result.success) {
        // Update backups list
        await loadBot(state.currentBot.id)
        showToast("Backup deleted successfully")
      } else {
        showToast(`Failed to delete backup: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting backup:", error)
      showToast("Failed to delete backup")
    }
  })
}
