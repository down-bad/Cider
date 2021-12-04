const {app, BrowserWindow, ipcMain} = require("electron")
const {join, resolve} = require("path")
const getPort = require("get-port");
const express = require("express");
const path = require("path");
const windowStateKeeper = require("electron-window-state");

const CiderBase = {

    CreateBrowserWindow() {
        // Set default window sizes
        const mainWindowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600
        });

        let win = null
        const options = {
            icon: join(__dirname, `../icons/icon.ico`),
            width: mainWindowState.width,
            height: mainWindowState.height,
            x: mainWindowState.x,
            y: mainWindowState.y,
            minWidth: 844,
            minHeight: 410,
            frame: false,
            title: "Cider",
            vibrancy: 'dark',
            hasShadow: false,
            webPreferences: {
                plugins: true,
                nodeIntegration: true,
                nodeIntegrationInWorker: false,
                webSecurity: false,
                allowRunningInsecureContent: true,
                enableRemoteModule: true,
                sandbox: true,
                nativeWindowOpen: true,
                contextIsolation: false,
                preload: join(__dirname, '../preload/cider-preload.js')
            }

        }
        CiderBase.InitWebServer()
        if (process.platform === "darwin" || process.platform === "linux") {
            win = new BrowserWindow(options)
        } else {
            const {BrowserWindow} = require("electron-acrylic-window");
            win = new BrowserWindow(options)
        }

        let location = "http://localhost:9000/"
        win.loadURL(location)
        win.on("closed", () => {
            win = null
        })

        // Register listeners on Window to track size and position of the Window.
        mainWindowState.manage(win);

        // IPC stuff

        ipcMain.on('close', () => { // listen for close event
            win.close();
        })

        ipcMain.on('maximize', () => { // listen for maximize event
            if (win.maximizable) {
                win.maximize();
                win.maximizable = false;
            } else {
                win.unmaximize();
                win.maximizable = true;
            }
        })

        ipcMain.on('minimize', () => { // listen for minimize event
            win.minimize();
        })

        if (process.platform === "win32") {
            var WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3
            }
            var wndState = WND_STATE.NORMAL

            win.on("resize", (_event) => {
                const isMaximized = win.isMaximized()
                const isMinimized = win.isMinimized()
                const isFullScreen = win.isFullScreen()
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED
                    win.webContents.executeJavaScript(`app.chrome.maximized = true`)
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL
                    win.webContents.executeJavaScript(`app.chrome.maximized = false`)
                }
            })
        }

        return win
    },
    async InitWebServer() {
        const webRemotePort = await getPort({port : 9000});
        const webapp = express();
        const webRemotePath = path.join(__dirname, '../cider-ui-tests/');
        webapp.use(express.static(webRemotePath));
        webapp.get('/', function (req, res) {
            res.sendFile(path.join(webRemotePath, 'index.html'));
        });
        webapp.listen(webRemotePort, function () {
            console.log(`Web Remote listening on port ${webRemotePort}`);
        });
    },
}

module.exports = CiderBase;