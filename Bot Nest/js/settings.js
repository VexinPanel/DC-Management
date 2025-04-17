// Assuming these are defined elsewhere, let's declare them for this context.
// In a real application, these would likely be imported or defined in a higher scope.
const state = {}
async function loadBot(botId) {
  console.log("loadBot called with id:", botId)
}
function showToast(message) {
  console.log("Toast:", message)
}
function showConfirmDialog(title, message, callback) {
  console.log("Confirm:", title, message)
  callback()
}
function navigateTo(route) {
  console.log("Navigating to:", route)
}
async function loadBots() {
  console.log("Loading bots...")
}

// Update bot settings
document.getElementById("bot-settings-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  if (!state.currentBot) return

  const formData = new FormData(e.target)
  const settings = {
    botId: state.currentBot.id,
    name: formData.get("name"),
    token: formData.get("token"),
    description: formData.get("description"),
  }

  try {
    const result = await window.api.updateBotSettings(settings)

    if (result.success) {
      // Update bot details
      await loadBot(state.currentBot.id)
      showToast("Settings updated successfully")
    } else {
      showToast(`Failed to update settings: ${result.error}`)
    }
  } catch (error) {
    console.error("Error updating settings:", error)
    showToast("Failed to update settings")
  }
})

// Delete bot
document.getElementById("delete-bot-btn").addEventListener("click", () => {
  if (!state.currentBot) return

  showConfirmDialog(
    "Delete Bot",
    `Are you sure you want to delete the bot "${state.currentBot.name}"? This action cannot be undone.`,
    async () => {
      try {
        const result = await window.api.deleteBot(state.currentBot.id)

        if (result.success) {
          showToast("Bot deleted successfully")
          navigateTo("home")
          loadBots()
        } else {
          showToast(`Failed to delete bot: ${result.error}`)
        }
      } catch (error) {
        console.error("Error deleting bot:", error)
        showToast("Failed to delete bot")
      }
    },
  )
})
