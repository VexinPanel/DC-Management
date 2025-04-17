// Modal functionality
function setupModals() {
  const modals = document.querySelectorAll(".modal")
  const overlay = document.getElementById("overlay")

  // Close modals when clicking outside
  overlay.addEventListener("click", () => {
    modals.forEach((modal) => {
      modal.style.display = "none"
    })
    overlay.style.display = "none"
  })

  // Close modals with Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      modals.forEach((modal) => {
        modal.style.display = "none"
      })
      overlay.style.display = "none"
    }
  })
}

// Initialize modals
document.addEventListener("DOMContentLoaded", setupModals)
