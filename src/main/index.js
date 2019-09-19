import electron, { app, BrowserWindow,ipcMain } from 'electron'
const fs = require('fs'); // 引入fs模块
const path = require('path');
// import { autoUpdater } from 'electron-updater'
import './app'
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow, webContents;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

const icoUrl = process.env.NODE_ENV === 'development'
  ? '../../static/logo.ico'
  : `/static/logo.ico`;


const Menu = electron.Menu
function createWindow () {
  /**
   * Initial window options
   */

  Menu.setApplicationMenu(null);
  mainWindow = new BrowserWindow({
    height: 562.5,
    useContentSize: true,
    width: 1000,
    // autoHideMenuBar: true,
    frame: true,
    // transparent: true,
    icon: require('path').join(__dirname, icoUrl),
    backgroundColor: '#fff'
    // alwaysOnTop: true,
    // resizable: false,
    // webPreferences: {webSecurity: false}
  })
  console.log(mainWindow.removeMenu)
  console.log(mainWindow);

  mainWindow.loadURL(winURL)

  // 打开dev工具
  process.env.NODE_ENV === 'development' && mainWindow.openDevTools()


  mainWindow.on('closed', () => {
    mainWindow = null
  })

  webContents = mainWindow.webContents;
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
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

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

import { autoUpdater } from 'electron-updater'

// autoUpdater.on('update-downloaded', () => {
//   autoUpdater.quitAndInstall()
// })
//
// app.on('ready', () => {
//   if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
// })
const feedUrl = `https://raw.githubusercontent.com/cker321/electron-ftp-app/master`; // 更新包位置
// 主进程监听渲染进程传来的信息
ipcMain.on('update', (e, arg) => {
  console.log("update");
  checkForUpdates();
});




let checkForUpdates = () => {
  if (process.env.NODE_ENV === 'development') {
    console.log(__dirname)
    autoUpdater.updateConfigPath = path.join(__dirname, '../../latest.yml')
  } else {
    autoUpdater.updateConfigPath = path.join(__dirname, '../../../app-update.yml')
  }
  // 配置安装包远端服务器
  autoUpdater.setFeedURL(feedUrl);

  // 下面是自动更新的整个生命周期所发生的事件
  autoUpdater.on('error', function(message) {
    sendUpdateMessage('error', message);
  });
  autoUpdater.on('checking-for-update', function(message) {
    sendUpdateMessage('checking-for-update', message);
  });
  autoUpdater.on('update-available', function(message) {
    sendUpdateMessage('update-available', message);
  });
  autoUpdater.on('update-not-available', function(message) {
    sendUpdateMessage('update-not-available', message);
  });

  // 更新下载进度事件
  autoUpdater.on('download-progress', function(progressObj) {
    sendUpdateMessage('downloadProgress', progressObj);
  });
  // 更新下载完成事件
  autoUpdater.on('update-downloaded', function(event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
    sendUpdateMessage('isUpdateNow');
    ipcMain.on('updateNow', (e, arg) => {
      autoUpdater.quitAndInstall();
    });
  });

  //执行自动更新检查
  autoUpdater.checkForUpdates();
};

// 主进程主动发送消息给渲染进程函数
function sendUpdateMessage(message, data) {
  // console.log({ message, data });
  webContents.send('message', { message, data });
}


const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
}
// console.log(process.argv)
const args = [];
if (!app.isPackaged) {
  args.push(path.resolve(process.argv[1]));
}
args.push('--');

// 定义协议名称
const PROTOCOL = process.env.NODE_ENV === 'development' ?  'FBDFtpDev' : 'FBDFtp';
// 写入协议
app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, args);
// 出入参数
let queryParam = {};
let infoEvent = '';

handleArgv(process.argv);

// 第二个实例 focus到窗口
app.on('second-instance', (event, argv) => {
  // fs.writeFile('C:/Users/yckj1041/AppData/Local/Programs/url.txt', JSON.stringify(argv), function(err) {
  //   if (err) {
  //     throw err;
  //   }
  //   console.log('Saved.');
  // });
  if (process.platform === 'win32') {
    // handleArgv(argv);
    mainWindow.focus()
  }
});

// macOS
app.on('open-url', (event, urlStr) => {
  handleUrl(urlStr);
});

function handleArgv(argv) {
  const prefix = `${PROTOCOL}:`;
  const offset = app.isPackaged ? 1 : 2;
  const url = argv.find((arg, i) => {
    return i >= offset && arg.startsWith('fbdftp');
  });
  if (url) handleUrl(url);
}

function handleUrl(urlStr) {
  const urlObj = new URL(urlStr);
  infoEvent = 'infoUpdated'
  queryParam = urlObj.search.replace('?', '')
  // fs.writeFile('C:/Users/yckj1041/AppData/Local/Programs/faceBigData-VideoUploader/url.txt', JSON.stringify(urlObj), function(err) {
  //   if (err) {
  //     throw err;
  //   }
  //   console.log('Saved.');
  // });
  // fs.writeFile('C:/Users/yckj1041/AppData/Local/Programs/faceBigData-VideoUploader/url1.txt', JSON.stringify(queryParam), function(err) {
  //   if (err) {
  //     throw err;
  //   }
  //   console.log('Saved.');
  // });
  // console.log(urlObj.query); // -> host=1&port=2&username=admin&password=123456
  // console.log(searchParams.get('host')); // -> 1
  // console.log(searchParams.get('port')); // -> 1
  // console.log(searchParams.get('username')); // -> 2
  // console.log(searchParams.get('password')); // -> 2
}

function sendUserInfo(message, data) {
  webContents.send('userInfoSend', { message, data });
}

ipcMain.on('userInfoGet', (e, arg) => {
  sendUserInfo(infoEvent, queryParam)
});

