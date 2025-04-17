// Assuming these are defined elsewhere, but declaring them here to resolve errors
const state = {}
async function loadBot(botId) {}
function showToast(message) {}
function showConfirmDialog(title, message, callback) {}

// Render commands list
function renderCommands() {
  const commandsList = document.getElementById("commands-list")
  const noCommandsMessage = document.getElementById("no-commands-message")

  // Clear the current list
  commandsList.innerHTML = ""

  if (!state.commands || state.commands.length === 0) {
    // Show the "no commands" message
    commandsList.appendChild(noCommandsMessage)
  } else {
    // Hide the "no commands" message and show the commands
    if (noCommandsMessage.parentNode === commandsList) {
      commandsList.removeChild(noCommandsMessage)
    }

    // Create command items
    state.commands.forEach((command, index) => {
      const commandItem = createCommandItem(command, index)
      commandsList.appendChild(commandItem)
    })
  }
}

// Create a command item element
function createCommandItem(command, index) {
  const item = document.createElement("div")
  item.className = "command-item stagger-item"

  item.innerHTML = `
    <div class="command-name">${command.name}</div>
    <div class="command-actions">
      <button class="btn btn-secondary btn-icon edit-command" title="Edit Command">
        <span class="icon">✏️</span>
      </button>
      <button class="btn btn-danger btn-icon delete-command" title="Delete Command">
        <span class="icon">🗑️</span>
      </button>
    </div>
  `

  // Add edit event
  item.querySelector(".edit-command").addEventListener("click", () => {
    openCommandModal(command)
  })

  // Add delete event
  item.querySelector(".delete-command").addEventListener("click", () => {
    deleteCommand(command.name)
  })

  // Add animation delay based on index
  item.style.animationDelay = `${index * 0.1}s`

  return item
}

// Open command modal for create/edit
function openCommandModal(command = null) {
  const commandModal = document.getElementById("create-command-modal")
  const commandForm = document.getElementById("command-form")
  const commandModalTitle = document.getElementById("command-modal-title")
  const commandName = document.getElementById("command-name")
  const commandCode = document.getElementById("command-code")
  const commandId = document.getElementById("command-id")
  const overlay = document.getElementById("overlay")

  // Set modal title and form values
  if (command) {
    commandModalTitle.textContent = "Edit Command"
    commandName.value = command.name
    commandCode.value = command.content
    commandId.value = command.name

    // Disable name field for edit
    commandName.disabled = true
  } else {
    commandModalTitle.textContent = "Create Command"
    commandForm.reset()
    commandId.value = ""

    // Enable name field for create
    commandName.disabled = false
  }

  // Set appropriate code template based on bot language
  if (!command && state.currentBot) {
    if (state.currentBot.language === "JavaScript") {
      commandCode.value = `// Command: example
// Usage: !example <args>
module.exports = {
  name: 'example',
  execute(message, args) {
    message.channel.send('Hello, world!');
  }
};`
    } else if (state.currentBot.language === "Python") {
      commandCode.value = `# Command: example
# Usage: !example <args>
name = 'example'

async def execute(message, args):
    await message.channel.send('Hello, world!')`
    }
  }

  commandModal.style.display = "block"
  overlay.style.display = "block"
  commandModal.classList.add("active")
}

// Close command modal
document.querySelectorAll("#create-command-modal .close-modal").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.getElementById("create-command-modal").style.display = "none"
    document.getElementById("overlay").style.display = "none"
  })
})

// Create/Edit command
document.getElementById("command-form").addEventListener("submit", async (e) => {
  e.preventDefault()

  if (!state.currentBot) return

  const formData = new FormData(e.target)
  const commandName = formData.get("name")
  const commandCode = formData.get("code")
  const commandId = formData.get("id")

  try {
    const result = await window.api.saveCommand({
      botId: state.currentBot.id,
      commandName: commandName,
      commandContent: commandCode,
      language: state.currentBot.language,
    })

    if (result.success) {
      // Update commands list
      await loadBot(state.currentBot.id)

      // Close modal
      document.getElementById("create-command-modal").style.display = "none"
      document.getElementById("overlay").style.display = "none"

      showToast(`Command ${commandId ? "updated" : "created"} successfully`)
    } else {
      showToast(`Failed to ${commandId ? "update" : "create"} command: ${result.error}`)
    }
  } catch (error) {
    console.error(`Error ${commandId ? "updating" : "creating"} command:`, error)
    showToast(`Failed to ${commandId ? "update" : "create"} command`)
  }
})

// Delete command
async function deleteCommand(commandName) {
  if (!state.currentBot) return

  showConfirmDialog("Delete Command", `Are you sure you want to delete the command "${commandName}"?`, async () => {
    try {
      const result = await window.api.deleteCommand({
        botId: state.currentBot.id,
        commandName: commandName,
      })

      if (result.success) {
        // Update commands list
        await loadBot(state.currentBot.id)
        showToast("Command deleted successfully")
      } else {
        showToast(`Failed to delete command: ${result.error}`)
      }
    } catch (error) {
      console.error("Error deleting command:", error)
      showToast("Failed to delete command")
    }
  })
}

// Create command button
document.getElementById("create-command-btn").addEventListener("click", () => {
  openCommandModal()
})
