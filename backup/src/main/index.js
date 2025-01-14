import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import './app';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:9080'
  : `file://${__dirname}/index.html`;

function createWindow() {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Auto updater
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

autoUpdater.on('checking-for-update', () => {
  log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  if (typeof info === 'object') {
    log.info('Update available:', info);
  }
});

autoUpdater.on('update-not-available', (info) => {
  if (typeof info === 'object') {
    log.info('Update not available:', info);
  }
});

autoUpdater.on('error', (err) => {
  if (err instanceof Error) {
    log.error('Error in auto-updater:', err);
  }
});

autoUpdater.on('download-progress', (progressObj) => {
  if (typeof progressObj === 'object' && typeof progressObj.percent === 'number') {
    let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
    logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
    logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
    log.info(logMessage);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  if (typeof info === 'object') {
    log.info('Update downloaded:', info);
    autoUpdater.quitAndInstall();
  }
});

// Check for updates
app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdates();
  }
});

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
      if (process.platform === 'win32') {
        const deeplinkingUrl = commandLine.slice(1)
        if (deeplinkingUrl.length > 0) {
          handleArgv(deeplinkingUrl)
        }
      }
    }
  })
}

app.on('will-finish-launching', () => {
  app.on('open-url', (event, url) => {
    handleUrl(url)
  })
})

function handleArgv(argv) {
  const prefix = 'myapp://'
  const offset = argv.indexOf(prefix)
  if (offset === -1) {
    return
  }
  handleUrl(argv.substring(offset))
}

function handleUrl(urlStr) {
  if (typeof urlStr !== 'string') return
  
  const urlObj = new URL(urlStr)
  const { searchParams } = urlObj
  const info = {}
  
  for (let [key, value] of searchParams) {
    info[key] = value
  }
  
  if (mainWindow) {
    mainWindow.webContents.send('userInfo', info)
  } else {
    saveInfo(info)
    infoEvent = 'userInfo'
  }
}

function saveInfo(info) {
  queryParam = info;
}

let queryParam = null;
let infoEvent = null;

function sendUserInfo(message, data) {
  mainWindow.webContents.send(message, data)
}

ipcMain.on('userInfoGet', (e, arg) => {
  sendUserInfo(infoEvent, queryParam)
})

ipcMain.on('close', () => {
  mainWindow.close()
});

ipcMain.on('minimize', () => {
  mainWindow.minimize()
});

ipcMain.on('maximize', () => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
});

ipcMain.on('update', (e, arg) => {
  console.log("update");
  autoUpdater.checkForUpdates();
});
