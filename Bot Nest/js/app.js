// Global state
const state = {
  currentPage: "home",
  currentBot: null,
  currentSection: "overview",
  bots: [],
  commands: [],
  backups: [],
}

// DOM Elements
const elements = {
  pages: {
    home: document.getElementById("home-page"),
    bot: document.getElementById("bot-page"),
  },
  sections: {
    overview: document.getElementById("overview-section"),
    commands: document.getElementById("commands-section"),
    backups: document.getElementById("backups-section"),
    settings: document.getElementById("settings-section"),
  },
  navLinks: document.querySelectorAll(".nav-links li"),
  botName: document.getElementById("bot-name"),
  botStatus: document.getElementById("bot-status"),
  backToHome: document.getElementById("back-to-home"),
  toast: document.getElementById("toast"),
  toastMessage: document.getElementById("toast-message"),
}

// Navigation
function navigateTo(page) {
  // Hide all pages
  Object.values(elements.pages).forEach((pageEl) => {
    pageEl.classList.remove("active")
  })

  // Show the selected page
  elements.pages[page].classList.add("active")
  state.currentPage = page
}

function navigateToSection(section) {
  // Hide all sections
  Object.values(elements.sections).forEach((sectionEl) => {
    sectionEl.classList.remove("active")
  })

  // Show the selected section
  elements.sections[section].classList.add("active")
  state.currentSection = section

  // Update active nav link
  elements.navLinks.forEach((link) => {
    if (link.dataset.section === section) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
}

// Toast Notifications
function showToast(message, duration = 3000) {
  elements.toastMessage.textContent = message
  elements.toast.classList.add("show")

  setTimeout(() => {
    elements.toast.classList.remove("show")
  }, duration)
}

// Confirmation Dialog
function showConfirmDialog(title, message, onConfirm) {
  const confirmModal = document.getElementById("confirm-modal")
  const confirmTitle = document.getElementById("confirm-title")
  const confirmMessage = document.getElementById("confirm-message")
  const confirmYes = document.getElementById("confirm-yes")
  const confirmNo = document.getElementById("confirm-no")
  const overlay = document.getElementById("overlay")

  confirmTitle.textContent = title
  confirmMessage.textContent = message

  confirmYes.onclick = () => {
    onConfirm()
    confirmModal.style.display = "none"
    overlay.style.display = "none"
  }

  confirmNo.onclick = () => {
    confirmModal.style.display = "none"
    overlay.style.display = "none"
  }

  document.querySelectorAll("#confirm-modal .close-modal").forEach((btn) => {
    btn.onclick = () => {
      confirmModal.style.display = "none"
      overlay.style.display = "none"
    }
  })

  confirmModal.style.display = "block"
  overlay.style.display = "block"
  confirmModal.classList.add("active")
}

// Load bots from API (example implementation)
async function loadBots() {
  // Replace with your actual API endpoint
  const response = await fetch("/api/bots")
  state.bots = await response.json()
  // Update the UI with the loaded bots (example)
  // ...
}

// Load a specific bot from API (example implementation)
async function loadBot(botId) {
  // Replace with your actual API endpoint
  const response = await fetch(`/api/bots/${botId}`)
  state.currentBot = await response.json()
  // Update the UI with the loaded bot details (example)
  // ...
}

// Event Listeners
elements.backToHome.addEventListener("click", () => {
  navigateTo("home")
  loadBots() // Refresh the bots list
})

elements.navLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault()
    const section = link.dataset.section
    navigateToSection(section)
  })
})

// Initialize the app
async function initApp() {
  // Load bots on startup
  await loadBots()

  // Set up event listeners for navigation
  window.addEventListener("hashchange", handleHashChange)
  handleHashChange()
}

// Handle hash-based navigation
function handleHashChange() {
  const hash = window.location.hash.substring(1)

  if (hash.startsWith("bot/")) {
    const parts = hash.split("/")
    const botId = parts[1]
    const section = parts[2] || "overview"

    loadBot(botId).then(() => {
      navigateTo("bot")
      navigateToSection(section)
    })
  } else {
    navigateTo("home")
  }
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)
