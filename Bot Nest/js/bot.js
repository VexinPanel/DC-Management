// Declare state, elements, renderCommands, renderBackups, and showToast
const state = {}
const elements = {}
function renderCommands() {}
function renderBackups() {}
function showToast(message) {
  console.log(message)
}

// Declare navigateTo function (or import it)
function navigateTo(route) {
  // Replace this with your actual navigation logic
  console.log(`Navigating to: ${route}`)
}

// Load bot details
async function loadBot(botId) {
  try {
    const result = await window.api.getBotDetails(botId)

    if (result.success) {
      const bot = result.bot
      state.currentBot = bot

      // Update UI with bot details
      elements.botName.textContent = bot.name
      updateBotStatus(bot.status)

      // Load commands
      state.commands = bot.commands
      renderCommands()

      // Load backups
      state.backups = bot.backups
      renderBackups()

      // Load settings
      document.getElementById("settings-bot-name").value = bot.name
      document.getElementById("settings-bot-token").value = bot.token
      document.getElementById("settings-bot-description").value = bot.description

      return bot
    } else {
      showToast(`Failed to load bot: ${result.error}`)
      navigateTo("home")
      return null
    }
  } catch (error) {
    console.error("Error loading bot:", error)
    showToast("Failed to load bot")
    navigateTo("home")
    return null
  }
}

// Update bot status display
function updateBotStatus(status) {
  elements.botStatus.textContent = status
  elements.botStatus.className = status === "running" ? "status status-running" : "status status-stopped"

  // Update start button text
  const startBotBtn = document.getElementById("start-bot-btn")
  if (status === "running") {
    startBotBtn.innerHTML = '<span class="icon">⏹️</span> Stop Bot'
    startBotBtn.classList.remove("btn-success")
    startBotBtn.classList.add("btn-danger")
  } else {
    startBotBtn.innerHTML = '<span class="icon">▶️</span> Start Bot'
    startBotBtn.classList.remove("btn-danger")
    startBotBtn.classList.add("btn-success")
  }
}

// Start/Stop bot
document.getElementById("start-bot-btn").addEventListener("click", async () => {
  if (!state.currentBot) return

  try {
    if (state.currentBot.status === "running") {
      // Stop the bot
      const result = await window.api.stopBot(state.currentBot.id)

      if (result.success) {
        state.currentBot.status = "stopped"
        updateBotStatus("stopped")
        showToast("Bot stopped successfully")
      } else {
        showToast(`Failed to stop bot: ${result.error}`)
      }
    } else {
      // Start the bot
      const result = await window.api.startBot(state.currentBot.id)

      if (result.success) {
        state.currentBot.status = "running"
        updateBotStatus("running")
        showToast("Bot started successfully")
      } else {
        showToast(`Failed to start bot: ${result.error}`)
      }
    }
  } catch (error) {
    console.error("Error starting/stopping bot:", error)
    showToast("Failed to start/stop bot")
  }
})

// Restart bot
document.getElementById("restart-bot-btn").addEventListener("click", async () => {
  if (!state.currentBot) return

  try {
    // Stop the bot if it's running
    if (state.currentBot.status === "running") {
      await window.api.stopBot(state.currentBot.id)
    }

    // Start the bot
    const result = await window.api.startBot(state.currentBot.id)

    if (result.success) {
      state.currentBot.status = "running"
      updateBotStatus("running")
      showToast("Bot restarted successfully")
    } else {
      showToast(`Failed to restart bot: ${result.error}`)
    }
  } catch (error) {
    console.error("Error restarting bot:", error)
    showToast("Failed to restart bot")
  }
})
