import {app, Menu, shell} from "electron";

export default class Thumbar {
    /**
     * Private variables for interaction in plugins
     */
    private _win: any;
    private _app: any;
    private _store: any;

    /**
     * Base Plugin Details (Eventually implemented into a GUI in settings)
     */
    public name: string = 'Menubar Plugin';
    public description: string = 'Creates the menubar';
    public version: string = '1.0.0';
    public author: string = 'Core / Quacksire';

    /**
     * Thumbnail Toolbar Assets
     * NATIVE-IMAGE DOESN'T SUPPORT SVG
     private icons: { [key: string]: Electron.NativeImage } = {
        remoteIcon: nativeImage.createFromPath(join(utils.getPath('rendererPath'), 'views/svg/smartphone.svg')).toPNG(),
        soundIcon: nativeImage.createFromPath(join(utils.getPath('rendererPath'), 'views/svg/headphones.svg')).toPNG(),
        aboutIcon: nativeImage.createFromPath(join(utils.getPath('rendererPath'), 'views/svg/info.svg')).toPNG(),
        settingsIcon: nativeImage.createFromPath(join(utils.getPath('rendererPath'), 'views/svg/settings.svg')).toPNG(),
        logoutIcon: nativeImage.createFromPath(join(utils.getPath('rendererPath'), 'views/svg/log-out.svg')).toPNG(),
        ciderIcon: nativeImage.createFromPath(join(utils.getPath('rendererPath'), 'assets/logocute.png')).toPNG(),
    }
     */

    /**
     * Menubar Assets
     * @private
     */
    private isMac: boolean = process.platform === 'darwin';
    private menubarTemplate: any = [
        {
            label: app.getName(),
            submenu: [
                { type: 'separator' },
                {
                    label: 'Settings',
                    accelerator: 'CommandOrControl+,',
                    click: () => this._win.webContents.executeJavaScript(`app.appRoute('settings')`)
                },
                { type: 'separator' },
                { role: 'services' },
                { type: 'separator' },
                { role: 'hide' },
                { role: 'hideOthers' },
                { role: 'unhide' },
                { type: 'separator' },
                { role: 'quit' }
            ]
        },
        {
            label: 'View',
            submenu: [
                {role: 'reload'},
                {role: 'forceReload'},
                {role: 'toggleDevTools'},
                {type: 'separator'},
                {role: 'resetZoom'},
                {role: 'zoomIn'},
                {role: 'zoomOut'},
                {type: 'separator'},
                {role: 'togglefullscreen'},
            ]
        },
        {
            label: 'Window',
            submenu: [
                {role: 'minimize'},
                {role: 'zoom'},
                ...(this.isMac ? [
                    {type: 'separator'},
                    {role: 'front'},
                ] : [
                    {role: 'close'}
                ]),
                {
                    label: 'Edit',
                    submenu: [
                        { role: 'undo' },
                        { role: 'redo' },
                        { type: 'separator' },
                        { role: 'cut' },
                        { role: 'copy' },
                        { role: 'paste' },
                    ]
                },
                {type: 'separator'},
                {
                    label: 'Plug-in Menu',
                    accelerator: 'CommandOrControl+Shift+P',
                    click: () => this._win.webContents.executeJavaScript(`app.modals.pluginMenu = true`)
                }

            ]
        },
        {
            label: 'Controls',
            submenu: [
                {
                    label: 'Pause / Play',
                    accelerator: 'Space',
                    click: () => this._win.webContents.executeJavaScript(`app.SpacePause()`)
                },
                {
                    label: 'Next',
                    accelerator: 'CommandOrControl+Right',
                    click: () => this._win.webContents.executeJavaScript(`MusicKitInterop.next()`)
                },
                {
                    label: 'Previous',
                    accelerator: 'CommandOrControl+Left',
                    click: () => this._win.webContents.executeJavaScript(`MusicKitInterop.previous()`)
                },
                { type: 'separator' },
                {
                    label: 'Volume Up',
                    accelerator: 'CommandOrControl+Up',
                    click: () => this._win.webContents.executeJavaScript(`app.volumeUp()`)
                },
                {
                    label: 'Volume Down',
                    accelerator: 'CommandOrControl+Down',
                    click: () => this._win.webContents.executeJavaScript(`app.volumeDown()`)
                }
            ]
        },
        {
            label: 'Account',
            submenu: [
                {
                    label: 'Account Settings',
                    click: () => this._win.webContents.executeJavaScript(`app.appRoute('apple-account-settings')`)
                },
                {
                    label: 'Sign Out',
                    click: () => this._win.webContents.executeJavaScript(`app.unauthorize()`)
                }
            ]
        },
        {
            label: 'Support',
            role: 'help',
            submenu: [
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'Option+CommandOrControl+I',
                    click: () => this._win.webContents.openDevTools()
                },
                {
                    label: 'Open Configuration File in Editor',
                    click: () => this._store.openInEditor()
                }
            ]
        }
    ]

    /*******************************************************************************************
     * Public Methods
     * ****************************************************************************************/

    /**
     * Runs on plugin load (Currently run on application start)
     */
    constructor(app: any, store: any) {
        this._app = app;
        this._store = store
        console.debug(`[Plugin][${this.name}] Loading Complete.`);
    }

    /**
     * Runs on app ready
     */
    onReady(win: Electron.BrowserWindow): void {
        this._win = win;
        Menu.setApplicationMenu(Menu.buildFromTemplate(this.menubarTemplate))
    }

    /**
     * Runs on app stop
     */
    onBeforeQuit(): void {
        console.debug(`[Plugin][${this.name}] Stopped.`);
    }

    /**
     * Runs on playback State Change
     * @param attributes Music Attributes (attributes.status = current state)
     */
    onPlaybackStateDidChange(attributes: object): void {

    }

    /**
     * Runs on song change
     * @param attributes Music Attributes
     */
    onNowPlayingItemDidChange(attributes: object): void {

    }

}
