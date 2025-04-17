# Discord Bot Manager

A powerful local Discord bot management application built with Electron, Node.js, and Express. The app allows you to create, manage, and backup Discord bots locally without relying on online databases. It includes an integrated plugin system, console logs, and a backup mechanism for bot configurations.

## Features

- **Create and Manage Discord Bots**: Easily create and manage Discord bots by inputting tokens, names, and bot languages (Python or JavaScript).
- **Start/Stop Bots**: Start and stop bots directly from the app. The bots remain online as long as the app is running.
- **Manage Commands**: View, create, edit, and delete bot commands directly from the dashboard.
- **Backup System**: Create and restore backups for your bot configurations to ensure you never lose your setup.
- **Plugin System**: Add, remove, and manage custom commands with the built-in plugin system.
- **Console Logs**: View real-time logs from your bots directly from the app's interface for easy debugging and monitoring.

---

## Prerequisites

Before getting started, ensure you have the following software installed on your system based on your operating system:

### Operating System Compatibility

This application supports the following operating systems:

- **Windows**: Version 7 or later
- **macOS**: Version 10.12 (Sierra) or later
- **Linux**: Any modern distribution (Ubuntu 20.04 or later recommended)

Ensure you are using a supported OS for optimal performance.

### Software Requirements

- **Node.js**: Version 16.0.0 or later
  - [Download Node.js](https://nodejs.org/)
- **npm**: Node Package Manager (automatically installed with Node.js)
- **Electron**: A framework for building cross-platform desktop apps with web technologies
- **Express.js**: A minimal and flexible Node.js web application framework

---

## Installation

Follow the steps below to install the app, set it up, and get started on your local machine.

### Step 1: Clone the Repository

First, clone this repository to your local machine using Git:

```
git clone https://github.com/your-username/discord-bot-manager.git
```
Step 2: Navigate to the Project Folder
Change your working directory to the project folder:
```
cd discord-bot-manager
```
**Step 3:** Install Dependencies
Install the necessary dependencies using npm:
```
npm install
```
This command will install all required libraries, including Electron, Express, and others specified in the package.json file.
---

**Step 4:** Choose Your Operating System
Make sure you have the right version of Node.js and Electron based on your operating system.

**Windows**
If you're on Windows, you'll need to have Windows 7 or later. You can check your version by pressing Win + R, typing winver, and pressing Enter.

If you are using a 32-bit version of Windows, you might encounter issues with Electron. Ensure you're running a 64-bit version of Windows for the best experience.

**macOS**
For macOS users, make sure you're running macOS 10.12 Sierra or later. To check your macOS version, click the Apple logo at the top-left corner of your screen and select "About This Mac."

**Linux**
Linux users should be running a distribution released after Ubuntu 20.04 or a similar modern distribution. For installation of dependencies like libgconf-2-4, make sure your system has the proper libraries. You can install missing libraries using the following commands:

```
sudo apt-get install libgconf-2-4
```
**Step 5**: Start the Application
Once the dependencies are installed, you can start the app by running:
```
npm start
```
This will launch the app and open a new window that you can interact with.

Usage
Interface Overview
Once the application is running, you'll see a main interface with the following features:
---

**Bot Management Dashboard:**

-Create New Bot: Allows you to create new bots by providing their token, name, and language.

-Bot List: A list of all your bots with their statuses (Running/Stopped) and options to manage them.

-Bot Settings: Edit bot configurations, change tokens, and modify names and descriptions.

-Plugins: Manage bot plugins like music or moderation commands.

-Console: View logs and outputs related to bot activities for debugging and monitoring.

-Backup: Download and upload backups of your bot configurations for easy restoration.

**Managing Bots**
-Create a Bot: To create a new bot, click "Create Bot" and provide the necessary details like the bot's token, name, and language (Python or JavaScript).

-Start/Stop Bot: You can start or stop your bot by clicking the respective buttons. Remember, bots only run when the app is open.

*Command Management:Add new commands to your bot, modify existing ones, and delete them when no longer needed.

**Backups**
The application allows you to create backups of bot configurations. You can download a backup at any time and restore it later.

-Backup Creation: Click "Create Backup" from the bot's settings page to download a .json file with all the bot's settings.

-Restore Backup: To restore a bot, simply upload the .json backup file using the restore option.

**Troubleshooting**
Issues with Electron or Node.js
Ensure you have the correct version of Node.js installed. You can verify your Node.js version with:
```
node -v
```
If you experience crashes or issues with Electron, make sure your graphics drivers and dependencies are up-to-date.

Permissions Issues (Linux)
If you're using Linux and encounter permission issues when running the app, you may need to grant execute permissions to the Electron binary:
```
chmod +x node_modules/.bin/electron
```
**Error Logs**
If the application crashes or you encounter any issues, check the console output in the terminal or Electron's built-in developer tools for more details.

**Contributing**
We welcome contributions to improve this project. Here’s how you can help:

**Fork the repository.**

Create a new branch for your changes (git checkout -b feature/your-feature).

Make your changes.

Commit your changes (git commit -m 'Add new feature').

Push to the branch (git push origin feature/your-feature).

Open a pull request to merge your changes into the main repository.

License
This project is licensed under the MIT License - see the LICENSE file for details.

Acknowledgments
Electron: For making it possible to create cross-platform desktop applications with web technologies.

Node.js: For enabling the backend functionalities of this app.

Express.js: For providing a minimal framework to handle server requests.

FAQ
1. How do I install the app on Windows?
Simply follow the steps in the installation section. The only requirement is that you have Node.js installed.

2. Can I run the bot manager without the internet?
Yes! This application is fully offline, and all your data is stored locally on your machine.

3. How can I backup my bots?
Navigate to the bot's settings, and you'll find the option to create a backup. You can download and save it for future use.

4. How can I restore a backup?
To restore a bot, click "Restore Backup" in the bot's settings page and upload the .json backup file.

We hope you enjoy using the Discord Bot Manager. If you have any questions or feedback, feel free to reach out through the Issues tab or contribute to the project!

