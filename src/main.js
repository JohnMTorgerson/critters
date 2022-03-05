const { app, BrowserWindow, ipcMain, dialog } = require('electron')
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

ipcMain.handle('select-sim', async (event) => {
  let options = {
    title: 'Open Saved Simulation',
    filters: {json:['json']},
    defaultPath: path.join(app.getPath('userData'),'saved_sims'),
    properties: ['openFile']
  };
  let result;
  try {
    result = await dialog.showOpenDialog(null, options);
    if (!result.canceled) {
      return rw.read(result.filePaths[0]);
    } else {
      return 'Canceled'
    }
  } catch(err) {
    console.log(err);
    return err.toString();
  }
});
