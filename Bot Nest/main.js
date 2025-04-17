const { app, BrowserWindow, ipcMain, dialog } = require("electron")
const path = require("path")
const fs = require("fs")
const { spawn } = require("child_process")

// Store running bot processes
const runningBots = new Map()

// Ensure data directory exists
const dataDir = path.join(app.getPath("userData"), "botData")
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Create the main window
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/icon.png"),
    show: false,
    backgroundColor: "#1a1a2e",
  })

  mainWindow.loadFile("index.html")

  // Show window when ready to avoid flashing
  mainWindow.once("ready-to-show", () => {
    mainWindow.show()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  // Stop all running bots before quitting
  for (const [botId, process] of runningBots.entries()) {
    process.kill()
  }

  if (process.platform !== "darwin") app.quit()
})

// IPC Handlers for bot operations
ipcMain.handle("get-bots", async () => {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
      return []
    }

    const botFolders = fs.readdirSync(dataDir)
    const bots = []

    for (const folder of botFolders) {
      const botPath = path.join(dataDir, folder)
      if (fs.statSync(botPath).isDirectory()) {
        const configPath = path.join(botPath, "config.json")
        if (fs.existsSync(configPath)) {
          const config = JSON.parse(fs.readFileSync(configPath, "utf8"))
          bots.push({
            id: folder,
            name: config.name,
            language: config.language,
            status: runningBots.has(folder) ? "running" : "stopped",
          })
        }
      }
    }

    return bots
  } catch (error) {
    console.error("Error getting bots:", error)
    return []
  }
})

ipcMain.handle("create-bot", async (event, botData) => {
  try {
    const botId = Date.now().toString()
    const botDir = path.join(dataDir, botId)

    fs.mkdirSync(botDir)
    fs.mkdirSync(path.join(botDir, "commands"))
    fs.mkdirSync(path.join(botDir, "backups"))

    // Create config file
    fs.writeFileSync(
      path.join(botDir, "config.json"),
      JSON.stringify(
        {
          name: botData.name,
          token: botData.token,
          language: botData.language,
          description: "",
        },
        null,
        2,
      ),
    )

    // Create main bot file based on language
    if (botData.language === "JavaScript") {
      fs.writeFileSync(
        path.join(botDir, "bot.js"),
        `const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ] 
});

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands = client.commands || new Map();
  client.commands.set(command.name, command);
}

client.on('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  
  const prefix = '!';
  if (!message.content.startsWith(prefix)) return;
  
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  
  if (!client.commands.has(commandName)) return;
  
  try {
    client.commands.get(commandName).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing that command!');
  }
});

client.login('${botData.token}');`,
      )
    } else if (botData.language === "Python") {
      fs.writeFileSync(
        path.join(botDir, "bot.py"),
        `import discord
import os
import importlib.util

intents = discord.Intents.default()
intents.message_content = True
client = discord.Client(intents=intents)

commands = {}

# Load commands
commands_dir = os.path.join(os.path.dirname(__file__), 'commands')
for filename in os.listdir(commands_dir):
    if filename.endswith('.py'):
        module_path = os.path.join(commands_dir, filename)
        spec = importlib.util.spec_from_file_location(filename[:-3], module_path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if hasattr(module, 'name') and hasattr(module, 'execute'):
            commands[module.name] = module.execute

@client.event
async def on_ready():
    print(f'Logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return
        
    prefix = '!'
    if not message.content.startswith(prefix):
        return
        
    args = message.content[len(prefix):].strip().split()
    command_name = args.pop(0).lower() if args else ''
    
    if command_name in commands:
        try:
            await commands[command_name](message, args)
        except Exception as e:
            print(f'Error executing command: {e}')
            await message.channel.send('There was an error executing that command!')

client.run('${botData.token}')`,
      )
    }

    // Create package.json for JavaScript bots
    if (botData.language === "JavaScript") {
      fs.writeFileSync(
        path.join(botDir, "package.json"),
        JSON.stringify(
          {
            name: botData.name.toLowerCase().replace(/\s+/g, "-"),
            version: "1.0.0",
            description: "Discord bot created with Discord Bot Manager",
            main: "bot.js",
            dependencies: {
              "discord.js": "^14.11.0",
            },
          },
          null,
          2,
        ),
      )
    }

    // Create requirements.txt for Python bots
    if (botData.language === "Python") {
      fs.writeFileSync(path.join(botDir, "requirements.txt"), "discord.py==2.3.1")
    }

    return { success: true, botId }
  } catch (error) {
    console.error("Error creating bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("get-bot-details", async (event, botId) => {
  try {
    const botDir = path.join(dataDir, botId)
    const configPath = path.join(botDir, "config.json")

    if (!fs.existsSync(configPath)) {
      return { success: false, error: "Bot not found" }
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"))

    // Get commands
    const commandsDir = path.join(botDir, "commands")
    const commandFiles = fs.readdirSync(commandsDir)
    const commands = []

    for (const file of commandFiles) {
      const commandPath = path.join(commandsDir, file)
      const content = fs.readFileSync(commandPath, "utf8")
      commands.push({
        name: file,
        content,
      })
    }

    // Get backups
    const backupsDir = path.join(botDir, "backups")
    const backups = fs.readdirSync(backupsDir)

    return {
      success: true,
      bot: {
        id: botId,
        name: config.name,
        token: config.token,
        language: config.language,
        description: config.description || "",
        status: runningBots.has(botId) ? "running" : "stopped",
        commands,
        backups,
      },
    }
  } catch (error) {
    console.error("Error getting bot details:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("start-bot", async (event, botId) => {
  try {
    // Stop the bot if it's already running
    if (runningBots.has(botId)) {
      runningBots.get(botId).kill()
      runningBots.delete(botId)
    }

    const botDir = path.join(dataDir, botId)
    const configPath = path.join(botDir, "config.json")

    if (!fs.existsSync(configPath)) {
      return { success: false, error: "Bot not found" }
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"))

    let botProcess
    if (config.language === "JavaScript") {
      // Install dependencies if needed
      if (!fs.existsSync(path.join(botDir, "node_modules"))) {
        const npmInstall = spawn("npm", ["install"], { cwd: botDir })
        await new Promise((resolve, reject) => {
          npmInstall.on("close", (code) => {
            if (code === 0) resolve()
            else reject(new Error(`npm install failed with code ${code}`))
          })
        })
      }

      botProcess = spawn("node", ["bot.js"], { cwd: botDir })
    } else if (config.language === "Python") {
      // Install dependencies if needed
      const pipInstall = spawn("pip", ["install", "-r", "requirements.txt"], { cwd: botDir })
      await new Promise((resolve) => {
        pipInstall.on("close", resolve)
      })

      botProcess = spawn("python", ["bot.py"], { cwd: botDir })
    }

    runningBots.set(botId, botProcess)

    botProcess.stdout.on("data", (data) => {
      console.log(`Bot ${botId} stdout: ${data}`)
    })

    botProcess.stderr.on("data", (data) => {
      console.error(`Bot ${botId} stderr: ${data}`)
    })

    botProcess.on("close", (code) => {
      console.log(`Bot ${botId} process exited with code ${code}`)
      runningBots.delete(botId)
    })

    return { success: true }
  } catch (error) {
    console.error("Error starting bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("stop-bot", async (event, botId) => {
  try {
    if (runningBots.has(botId)) {
      runningBots.get(botId).kill()
      runningBots.delete(botId)
      return { success: true }
    } else {
      return { success: false, error: "Bot is not running" }
    }
  } catch (error) {
    console.error("Error stopping bot:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("save-command", async (event, { botId, commandName, commandContent, language }) => {
  try {
    const botDir = path.join(dataDir, botId)
    const commandsDir = path.join(botDir, "commands")

    // Determine file extension based on language
    const extension = language === "JavaScript" ? ".js" : ".py"
    const fileName = commandName.endsWith(extension) ? commandName : `${commandName}${extension}`

    fs.writeFileSync(path.join(commandsDir, fileName), commandContent)

    return { success: true, fileName }
  } catch (error) {
    console.error("Error saving command:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("delete-command", async (event, { botId, commandName }) => {
  try {
    const botDir = path.join(dataDir, botId)
    const commandPath = path.join(botDir, "commands", commandName)

    if (fs.existsSync(commandPath)) {
      fs.unlinkSync(commandPath)
      return { success: true }
    } else {
      return { success: false, error: "Command not found" }
    }
  } catch (error) {
    console.error("Error deleting command:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("update-bot-settings", async (event, { botId, name, token, description }) => {
  try {
    const botDir = path.join(dataDir, botId)
    const configPath = path.join(botDir, "config.json")

    if (!fs.existsSync(configPath)) {
      return { success: false, error: "Bot not found" }
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"))

    config.name = name
    config.token = token
    config.description = description

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

    // Update bot file with new token
    if (config.language === "JavaScript") {
      let botFile = fs.readFileSync(path.join(botDir, "bot.js"), "utf8")
      botFile = botFile.replace(/client\.login$$['"](.*)['"]$$/, `client.login('${token}')`)
      fs.writeFileSync(path.join(botDir, "bot.js"), botFile)
    } else if (config.language === "Python") {
      let botFile = fs.readFileSync(path.join(botDir, "bot.py"), "utf8")
      botFile = botFile.replace(/client\.run$$['"](.*)['"]$$/, `client.run('${token}')`)
      fs.writeFileSync(path.join(botDir, "bot.py"), botFile)
    }

    return { success: true }
  } catch (error) {
    console.error("Error updating bot settings:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("create-backup", async (event, botId) => {
  try {
    const botDir = path.join(dataDir, botId)
    const backupsDir = path.join(botDir, "backups")
    const timestamp = new Date().toISOString().replace(/:/g, "-")
    const backupName = `backup-${timestamp}.zip`
    const backupPath = path.join(backupsDir, backupName)

    // Create a zip file with the bot files
    const archiver = require("archiver")
    const output = fs.createWriteStream(backupPath)
    const archive = archiver("zip", { zlib: { level: 9 } })

    output.on("close", () => {
      console.log(`Backup created: ${backupPath}`)
    })

    archive.pipe(output)

    // Add bot files to the archive
    archive.file(path.join(botDir, "config.json"), { name: "config.json" })

    if (fs.existsSync(path.join(botDir, "bot.js"))) {
      archive.file(path.join(botDir, "bot.js"), { name: "bot.js" })
    }

    if (fs.existsSync(path.join(botDir, "bot.py"))) {
      archive.file(path.join(botDir, "bot.py"), { name: "bot.py" })
    }

    // Add commands directory
    archive.directory(path.join(botDir, "commands"), "commands")

    await archive.finalize()

    return { success: true, backupName }
  } catch (error) {
    console.error("Error creating backup:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("download-backup", async (event, { botId, backupName }) => {
  try {
    const botDir = path.join(dataDir, botId)
    const backupPath = path.join(botDir, "backups", backupName)

    const saveDialog = await dialog.showSaveDialog({
      title: "Save Backup",
      defaultPath: path.join(app.getPath("downloads"), backupName),
      filters: [{ name: "Zip Files", extensions: ["zip"] }],
    })

    if (!saveDialog.canceled) {
      fs.copyFileSync(backupPath, saveDialog.filePath)
      return { success: true }
    } else {
      return { success: false, error: "Save dialog canceled" }
    }
  } catch (error) {
    console.error("Error downloading backup:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("upload-backup", async (event, botId) => {
  try {
    const openDialog = await dialog.showOpenDialog({
      title: "Upload Backup",
      filters: [{ name: "Zip Files", extensions: ["zip"] }],
      properties: ["openFile"],
    })

    if (openDialog.canceled || openDialog.filePaths.length === 0) {
      return { success: false, error: "Open dialog canceled" }
    }

    const backupPath = openDialog.filePaths[0]
    const botDir = path.join(dataDir, botId)
    const backupsDir = path.join(botDir, "backups")
    const backupName = `uploaded-${path.basename(backupPath)}`
    const destPath = path.join(backupsDir, backupName)

    fs.copyFileSync(backupPath, destPath)

    return { success: true, backupName }
  } catch (error) {
    console.error("Error uploading backup:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("restore-backup", async (event, { botId, backupName }) => {
  try {
    const botDir = path.join(dataDir, botId)
    const backupPath = path.join(botDir, "backups", backupName)

    // Extract the backup
    const extract = require("extract-zip")
    const tempDir = path.join(app.getPath("temp"), `bot-backup-${Date.now()}`)

    fs.mkdirSync(tempDir, { recursive: true })
    await extract(backupPath, { dir: tempDir })

    // Copy files from the backup
    if (fs.existsSync(path.join(tempDir, "config.json"))) {
      const backupConfig = JSON.parse(fs.readFileSync(path.join(tempDir, "config.json"), "utf8"))
      const currentConfig = JSON.parse(fs.readFileSync(path.join(botDir, "config.json"), "utf8"))

      // Preserve the bot ID and update other settings
      backupConfig.id = currentConfig.id
      fs.writeFileSync(path.join(botDir, "config.json"), JSON.stringify(backupConfig, null, 2))
    }

    if (fs.existsSync(path.join(tempDir, "bot.js"))) {
      fs.copyFileSync(path.join(tempDir, "bot.js"), path.join(botDir, "bot.js"))
    }

    if (fs.existsSync(path.join(tempDir, "bot.py"))) {
      fs.copyFileSync(path.join(tempDir, "bot.py"), path.join(botDir, "bot.py"))
    }

    // Copy commands
    if (fs.existsSync(path.join(tempDir, "commands"))) {
      const commandsDir = path.join(botDir, "commands")

      // Clear existing commands
      fs.readdirSync(commandsDir).forEach((file) => {
        fs.unlinkSync(path.join(commandsDir, file))
      })

      // Copy commands from backup
      fs.readdirSync(path.join(tempDir, "commands")).forEach((file) => {
        fs.copyFileSync(path.join(tempDir, "commands", file), path.join(commandsDir, file))
      })
    }

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })

    return { success: true }
  } catch (error) {
    console.error("Error restoring backup:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("delete-backup", async (event, { botId, backupName }) => {
  try {
    const botDir = path.join(dataDir, botId)
    const backupPath = path.join(botDir, "backups", backupName)

    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath)
      return { success: true }
    } else {
      return { success: false, error: "Backup not found" }
    }
  } catch (error) {
    console.error("Error deleting backup:", error)
    return { success: false, error: error.message }
  }
})

ipcMain.handle("delete-bot", async (event, botId) => {
  try {
    // Stop the bot if it's running
    if (runningBots.has(botId)) {
      runningBots.get(botId).kill()
      runningBots.delete(botId)
    }

    const botDir = path.join(dataDir, botId)

    if (fs.existsSync(botDir)) {
      fs.rmSync(botDir, { recursive: true, force: true })
      return { success: true }
    } else {
      return { success: false, error: "Bot not found" }
    }
  } catch (error) {
    console.error("Error deleting bot:", error)
    return { success: false, error: error.message }
  }
})
