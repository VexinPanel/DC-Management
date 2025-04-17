// Declare state and showToast
const state = {}

function showToast(message) {
  // Implement your toast notification logic here
  // For example, you can use a library like Toastify or create a custom toast element
  console.log("Toast:", message) // Placeholder for toast functionality
}

// Load all bots
async function loadBots() {
  try {
    const bots = await window.api.getBots()
    state.bots = bots

    const botsList = document.getElementById("bots-list")
    const noBotsMessage = document.getElementById("no-bots-message")

    // Clear the current list
    botsList.innerHTML = ""

    if (bots.length === 0) {
      // Show the "no bots" message
      botsList.appendChild(noBotsMessage)
    } else {
      // Hide the "no bots" message and show the bots
      if (noBotsMessage.parentNode === botsList) {
        botsList.removeChild(noBotsMessage)
      }

      // Create bot cards
      bots.forEach((bot, index) => {
        const botCard = createBotCard(bot, index)
        botsList.appendChild(botCard)
      })
    }
  } catch (error) {
    console.error("Error loading bots:", error)
    showToast("Failed to load bots")
  }
}

// Create a bot card element
function createBotCard(bot, index) {
  const card = document.createElement("div")
  card.className = "bot-card stagger-item"
  card.dataset.botId = bot.id

  const statusClass = bot.status === "running" ? "status-running" : "status-stopped"

  card.innerHTML = `
    <h3>${bot.name}</h3>
    <div class="language">${bot.language}</div>
    <div class="status ${statusClass}">${bot.status}</div>
  `

  // Add click event to navigate to bot page
  card.addEventListener("click", () => {
    window.location.hash = `bot/${bot.id}/overview`
  })

  // Add animation delay based on index
  card.style.animationDelay = `${index * 0.1}s`

  return card
}

// Create Bot Modal
const createBotBtn = document.getElementById("create-bot-btn")
const createBotModal = document.getElementById("create-bot-modal")
const createBotForm = document.getElementById("create-bot-form")
const overlay = document.getElementById("overlay")

createBotBtn.addEventListener("click", () => {
  createBotModal.style.display = "block"
  overlay.style.display = "block"
  createBotModal.classList.add("active")
})

// Close modal when clicking the close button or cancel
document.querySelectorAll("#create-bot-modal .close-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    createBotModal.style.display = "none"
    overlay.style.display = "none"
  })
})

// Handle form submission
createBotForm.addEventListener("submit", async (e) => {
  e.preventDefault()

  const formData = new FormData(createBotForm)
  const botData = {
    name: formData.get("name"),
    token: formData.get("token"),
    language: formData.get("language"),
  }

  try {
    const result = await window.api.createBot(botData)

    if (result.success) {
      showToast("Bot created successfully")
      createBotModal.style.display = "none"
      overlay.style.display = "none"
      createBotForm.reset()

      // Reload bots and navigate to the new bot
      await loadBots()
      window.location.hash = `bot/${result.botId}/overview`
    } else {
      showToast(`Failed to create bot: ${result.error}`)
    }
  } catch (error) {
    console.error("Error creating bot:", error)
    showToast("Failed to create bot")
  }
})
