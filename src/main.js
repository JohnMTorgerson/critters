const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const rw = require('./readwrite.js')

async function createWindow () {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        // preload: path.join(__dirname, 'preload.js')
    }
  })

  win.webContents.openDevTools();
  await win.loadFile('src/index.html');
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


ipcMain.handle('write-file', async (event, stuff) => {
  const {data, filename, folder} = stuff;
  return rw.write(data,filename,folder);
});
