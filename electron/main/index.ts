const electron = require('electron')
const { app, BrowserWindow, shell, ipcMain } = electron
const path = require('path')
const os = require('os')
require('@electron/remote/main').initialize()

process.env.DIST_ELECTRON = path.join(__dirname, '..')
process.env.DIST = path.join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? path.join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

let win = null
const preload = path.join(__dirname, '../preload/index.js')

async function createWindow() {
  win = new BrowserWindow({
    title: 'FTP File Transfer',
    width: 1200,
    height: 800,
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  require('@electron/remote/main').enable(win.webContents)

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    win.loadURL(process.env.VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(process.env.DIST, 'index.html'))
  }

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
}

// Disable GPU Acceleration for Windows 7
if (os.release().startsWith('6.1')) {
  app.disableHardwareAcceleration()
}

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') {
  app.setAppUserModelId(app.getName())
}

app.whenReady().then(() => {
  if (app.requestSingleInstanceLock && !app.requestSingleInstanceLock()) {
    app.quit()
    process.exit(0)
  }

  createWindow()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    childWindow.loadURL(`${process.env.VITE_DEV_SERVER_URL}#${arg}`)
  } else {
    childWindow.loadFile(path.join(process.env.DIST, 'index.html'), {
      hash: arg
    })
  }
})

// Handle window close event
ipcMain.on('window-close', () => {
  if (win) {
    win.close()
  }
})

// Handle window minimize event
ipcMain.on('window-minimize', () => {
  if (win) {
    win.minimize()
  }
})

// Handle window maximize event
ipcMain.on('window-maximize', () => {
  if (win) {
    if (win.isMaximized()) {
      win.unmaximize()
    } else {
      win.maximize()
    }
  }
})
