import {join} from "path";
import {app, BrowserWindow as bw, ipcMain, ShareMenu, shell} from "electron";
import * as windowStateKeeper from "electron-window-state";
import * as express from "express";
import * as getPort from "get-port";
import {search} from "youtube-search-without-api-key";
import {existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, statSync} from "fs";
import {Stream} from "stream";
import {networkInterfaces} from "os";
import * as mm from 'music-metadata';
import fetch from 'electron-fetch'
import {wsapi} from "./wsapi";
import {AppImageUpdater, NsisUpdater} from "electron-updater";
import {utils} from './utils';

const fileWatcher = require('chokidar');
const AdmZip = require("adm-zip");


export class BrowserWindow {
    public static win: any | undefined = null;
    private devMode: boolean = !app.isPackaged;
    private clientPort: number = 0;
    private remotePort: number = 6942;
    private EnvironmentVariables: object = {
        env: {
            platform: process.platform,
            dev: app.isPackaged,
            components: [
                "pages/podcasts",
                "pages/apple-account-settings",
                "pages/library-songs",
                "pages/library-albums",
                "pages/browse",
                "pages/settings",
                "pages/listen_now",
                "pages/home",
                "pages/artist-feed",
                "pages/cider-playlist",
                "pages/playlist-inline",
                "pages/recordLabel",
                "pages/collection-list",
                "pages/apple-curator",
                "pages/artist",
                "pages/search",
                "pages/library-videos",
                "pages/remote-pair",
                "pages/themes-github",
                "pages/plugins-github",
                "pages/replay",
                "pages/zoo",
                "components/mediaitem-artwork",
                "components/artwork-material",
                "components/menu-panel",
                "components/sidebar-playlist",
                "components/plugin-menu",
                "components/audio-controls",
                "components/add-to-playlist",
                "components/queue",
                "components/mediaitem-scroller-horizontal",
                "components/mediaitem-scroller-horizontal-large",
                "components/mediaitem-scroller-horizontal-sp",
                "components/mediaitem-scroller-horizontal-mvview",
                "components/mediaitem-list-item",
                "components/mediaitem-hrect",
                "components/mediaitem-square",
                "components/mediaitem-mvview",
                "components/libraryartist-item",
                "components/listennow-child",
                "components/mediaitem-mvview-sp",
                "components/animatedartwork-view",
                "components/listitem-horizontal",
                "components/lyrics-view",
                "components/fullscreen",
                "components/miniplayer",
                "components/artist-chip",
            ],
            appRoutes: [
                {
                    page: "zoo",
                    component: "<cider-zoo></cider-zoo>",
                    condition: "page == 'zoo'"
                },
                {
                    page: "podcasts",
                    component: `<apple-podcasts></apple-podcasts>`,
                    condition: `page == 'podcasts'`
                }, {
                    page: "library-videos",
                    component: `<cider-library-videos></cider-library-videos>`,
                    condition: `page == 'library-videos'`
                }, {
                    page: "apple-account-settings",
                    component: `<apple-account-settings></apple-account-settings>`,
                    condition: `page == 'apple-account-settings'`
                }, {
                    page: "cider-artist",
                    component: `<cider-artist :data="artistPage.data"></cider-artist>`,
                    condition: `page == 'artist-page' && artistPage.data.attributes`
                }, {
                    page: "collection-list",
                    component: `<cider-collection-list :data="collectionList.response" :type="collectionList.type" :title="collectionList.title"></cider-collection-list>`,
                    condition: `page == 'collection-list'`
                }, {
                    page: "home",
                    component: `<cider-home></cider-home>`,
                    condition: `page == 'home'`
                }, {
                    page: "artist-feed",
                    component: `<cider-artist-feed></cider-artist-feed>`,
                    condition: `page == 'artist-feed'`
                }, {
                    page: "playlist-inline",
                    component: `<playlist-inline :data="showingPlaylist"></playlist-inline>`,
                    condition: `modals.showPlaylist`
                }, {
                    page: "playlist_",
                    component: `<cider-playlist :data="showingPlaylist"></cider-playlist>`,
                    condition: `page.includes('playlist_')`
                }, {
                    page: "album_",
                    component: `<cider-playlist :data="showingPlaylist"></cider-playlist>`,
                    condition: `page.includes('album_')`
                }, {
                    page: "recordLabel_",
                    component: `<cider-recordlabel :data="showingPlaylist"></cider-recordlabel>`,
                    condition: `page.includes('recordLabel_')`
                }, {
                    page: "curator_",
                    component: `<cider-recordlabel :data="showingPlaylist"></cider-recordlabel>`,
                    condition: `page.includes('curator_')`
                }, {
                    page: "browsepage",
                    component: `<cider-browse :data="browsepage"></cider-browse>`,
                    condition: `page == 'browse'`,
                    onEnter: `getBrowsePage();`
                }, {
                    page: "listen_now",
                    component: `<cider-listen-now :data="listennow"></cider-listen-now>`,
                    condition: `page == 'listen_now'`,
                    onEnter: `getListenNow()`
                }, {
                    page: "settings",
                    component: `<cider-settings></cider-settings>`,
                    condition: `page == 'settings'`
                }, {
                    page: "search",
                    component: `<cider-search :search="search"></cider-search>`,
                    condition: `page == 'search'`
                }, {
                    page: "library-songs",
                    component: `<cider-library-songs :data="library.songs"></cider-library-songs>`,
                    condition: `page == 'library-songs'`,
                    onEnter: `getLibrarySongsFull()`
                }, {
                    page: "library-albums",
                    component: `<cider-library-albums :data="library.songs"></cider-library-albums>`,
                    condition: `page == 'library-albums'`,
                    onEnter: `getLibraryAlbumsFull(null, 1); getAlbumSort(); searchLibraryAlbums(1);`
                }, {
                    page: "appleCurator",
                    component: `<cider-applecurator :data="appleCurator"></cider-applecurator>`,
                    condition: `page.includes('appleCurator')`
                }, {
                    page: "themes-github",
                    component: `<themes-github></themes-github>`,
                    condition: `page == 'themes-github'`
                }, {
                    page: "plugins-github",
                    component: `<plugins-github></plugins-github>`,
                    condition: `page == 'plugins-github'`
                }, {
                    page: "remote-pair",
                    component: `<remote-pair></remote-pair>`,
                    condition: `page == 'remote-pair'`
                }, {
                    page: "replay",
                    component: `<replay-page></replay-page>`,
                    condition: `page == 'replay'`
                }
            ]
        },
    };
    private options: any = {
        icon: join(
            utils.getPath('resourcePath'),
            `icons/icon.` + (process.platform === "win32" ? "ico" : "png")
        ),
        width: 1024,
        height: 600,
        x: undefined,
        y: undefined,
        minWidth: 900,
        minHeight: 390,
        frame: false,
        title: "Cider",
        show: false,
        // backgroundColor: "#1E1E1E",
        titleBarStyle: 'hidden',
        trafficLightPosition: {x: 15, y: 20},
        webPreferences: {
            experimentalFeatures: true,
            nodeIntegration: true,
            sandbox: true,
            allowRunningInsecureContent: true,
            contextIsolation: false,
            webviewTag: true,
            plugins: true,
            nodeIntegrationInWorker: false,
            webSecurity: false,
            preload: join(utils.getPath('srcPath'), "./preload/cider-preload.js"),
        },
    };

    StartWatcher(path: string) {
        var chokidar = require("chokidar");

        var watcher = chokidar.watch(path, {
            ignored: /[\/\\]\./,
            persistent: true
        });

        function onWatcherReady() {
            console.info('From here can you check for real changes, the initial scan has been completed.');
        }

        // Declare the listeners of the watcher
        watcher
            .on('add', function (path: string) {
                // console.log('File', path, 'has been added');
            })
            .on('addDir', function (path: string) {
                // console.log('Directory', path, 'has been added');
            })
            .on('change', function (path: string) {
                console.log('File', path, 'has been changed');
                BrowserWindow.win.webContents.send("theme-update", "")
            })
            .on('unlink', function (path: string) {
                // console.log('File', path, 'has been removed');
            })
            .on('unlinkDir', function (path: string) {
                // console.log('Directory', path, 'has been removed');
            })
            .on('error', function (error: string) {
                // console.log('Error happened', error);
            })
            .on('ready', onWatcherReady)
            .on('raw', function (event: any, path: any, details: any) {
                // This event should be triggered everytime something happens.
                // console.log('Raw event info:', event, path, details);
            });
    }

    /**
     * Creates the browser window
     */
    async createWindow(): Promise<Electron.BrowserWindow> {
        this.clientPort = await getPort({port: 9000});
        BrowserWindow.verifyFiles();
        this.StartWatcher(utils.getPath('themes'));

        // Load the previous state with fallback to defaults
        const windowState = windowStateKeeper({
            defaultWidth: 1024,
            defaultHeight: 600,
            fullScreen: false
        });
        this.options.width = windowState.width;
        this.options.height = windowState.height;

        switch (process.platform) {
            default:

                break;
            case "win32":
                this.options.backgroundColor = "#1E1E1E";
                this.options.transparent = false;
                break;
            case "linux":
                this.options.backgroundColor = "#1E1E1E";
                this.options.autoHideMenuBar = true
                this.options.frame = true
                break;
            case "darwin":
                this.options.transparent = true;
                this.options.vibrancy = "dark";
                this.options.hasShadow = true;
                break;
        }

        // Start the webserver for the browser window to load

        this.startWebServer();

        BrowserWindow.win = new bw(this.options);
        const ws = new wsapi(BrowserWindow.win)
        ws.InitWebSockets()
        // and load the renderer.
        this.startSession();
        this.startHandlers();

        // Register listeners on Window to track size and position of the Window.
        windowState.manage(BrowserWindow.win);

        return BrowserWindow.win
    }

    /**
     * Verifies the files for the renderer to use (Cache, library info, etc.)
     */
    private static verifyFiles(): void {
        const expectedDirectories = ["CiderCache"];
        const expectedFiles = [
            "library-songs.json",
            "library-artists.json",
            "library-albums.json",
            "library-playlists.json",
            "library-recentlyAdded.json",
        ];
        for (let i = 0; i < expectedDirectories.length; i++) {
            if (
                !existsSync(
                    join(app.getPath("userData"), expectedDirectories[i])
                )
            ) {
                mkdirSync(
                    join(app.getPath("userData"), expectedDirectories[i])
                );
            }
        }
        for (let i = 0; i < expectedFiles.length; i++) {
            const file = join(utils.getPath('ciderCache'), expectedFiles[i]);
            if (!existsSync(file)) {
                writeFileSync(file, JSON.stringify([]));
            }
        }
    }

    /**
     * Starts the webserver for the renderer process.
     */
    private startWebServer(): void {
        const app = express();

        app.use(express.static(join(utils.getPath('srcPath'), "./renderer/")));
        app.set("views", join(utils.getPath('srcPath'), "./renderer/views"));
        app.set("view engine", "ejs");
        let firstRequest = true;
        app.use((req, res, next) => {
            if (!req || !req.headers || !req.headers.host || !req.headers["user-agent"]) {
                console.error('Req not defined')
                return
            }
            if (req.url.includes("audio.wav") || (req.headers.host.includes("localhost") && (this.devMode || req.headers["user-agent"].includes("Electron")))) {
                next();
            } else {
                res.redirect("https://discord.gg/applemusic");
            }
        });

        app.get("/", (_req, res) => {
            res.render("main", this.EnvironmentVariables);
        });

        app.get("/api/playback/:action", (req, res) => {
            const action = req.params.action;
            switch (action) {
                case "playpause":
                    BrowserWindow.win.webContents.executeJavaScript("wsapi.togglePlayPause()")
                    res.send("Play/Pause toggle")
                    break;
                case "play":
                    BrowserWindow.win.webContents.executeJavaScript("MusicKit.getInstance().play()")
                    res.send("Playing")
                    break;
                case "pause":
                    BrowserWindow.win.webContents.executeJavaScript("MusicKit.getInstance().pause()")
                    res.send("Paused")
                    break;
                case "stop":
                    BrowserWindow.win.webContents.executeJavaScript("MusicKit.getInstance().stop()")
                    res.send("Stopped")
                    break;
                case "next":
                    BrowserWindow.win.webContents.executeJavaScript("if (MusicKit.getInstance().queue.nextPlayableItemIndex != -1 && MusicKit.getInstance().queue.nextPlayableItemIndex != null) {MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.nextPlayableItemIndex);}")
                    res.send("Next")
                    break;
                case "previous":
                    BrowserWindow.win.webContents.executeJavaScript("if (MusicKit.getInstance().queue.previousPlayableItemIndex != -1 && MusicKit.getInstance().queue.previousPlayableItemIndex != null) {MusicKit.getInstance().changeToMediaAtIndex(MusicKit.getInstance().queue.previousPlayableItemIndex);}")
                    res.send("Previous")
                    break;
                default: {
                    res.send("Invalid action")
                }
            }
        })

        app.get("/themes/:theme", (req, res) => {
            const theme = req.params.theme;
            const themePath = join(utils.getPath('srcPath'), "./renderer/themes/", theme);
            const userThemePath = join(utils.getPath('themes'), theme);
            if (existsSync(userThemePath)) {
                res.sendFile(userThemePath);
            } else if (existsSync(themePath)) {
                res.sendFile(themePath);
            } else {
                res.send(`// Theme not found - ${userThemePath}`);
            }
        });

        app.get("/themes/:theme/*", (req: {params: {theme: string, 0: string}}, res) => {
            const theme = req.params.theme;
            const file = req.params[0];
            const themePath = join(utils.getPath('srcPath'), "./renderer/themes/", theme);
            const userThemePath = join(utils.getPath('themes'), theme);
            if (existsSync(userThemePath)) {
                res.sendFile(join(userThemePath, file));
            } else if (existsSync(themePath)) {
                res.sendFile(join(themePath, file));
            } else {
                res.send(`// File not found - ${userThemePath}`);
            }
        });

        app.get("/plugins/:plugin/*", (req: {params: {plugin: string, 0: string}}, res) => {
            const plugin = req.params.plugin;
            const file = req.params[0];
            const pluginPath = join(utils.getPath('plugins'), plugin);
            console.log(pluginPath)
            if (existsSync(pluginPath)) {
                res.sendFile(join(pluginPath, file));
            } else {
                res.send(`// Plugin not found - ${pluginPath}`);
            }
        });

        app.listen(this.clientPort, () => {
            console.log(`Cider client port: ${this.clientPort}`);
        });

        /*
         * Remote Client -@quacksire
         * https://github.com/ciderapp/Apple-Music-Electron/blob/818189ed40ff600d76eb59d22016723a75885cd5/resources/functions/handler.js#L1173
         */
        const remote = express();
        remote.use(express.static(join(utils.getPath('srcPath'), "./web-remote/")))
        remote.set("views", join(utils.getPath('srcPath'), "./web-remote/views"));
        remote.set("view engine", "ejs");
        getPort({port: 6942}).then((port) => {
            this.remotePort = port;
            // Start Remote Discovery
            this.broadcastRemote()
            remote.listen(this.remotePort, () => {
                console.log(`Cider remote port: ${this.remotePort}`);
                firstRequest = false;
            })
            remote.get("/", (_req, res) => {
                res.render("index", this.EnvironmentVariables);
            });
        })
    }

    /**
     * Starts the session for the renderer process.
     */
    private startSession(): void {
        // intercept "https://js-cdn.music.apple.com/hls.js/2.141.1/hls.js/hls.js" and redirect to local file "./apple-hls.js" instead
        BrowserWindow.win.webContents.session.webRequest.onBeforeRequest(
            {
                urls: ["https://*/*.js"],
            },
            (
                details: { url: string | string[] },
                callback: (arg0: { redirectURL?: string; cancel?: boolean }) => void
            ) => {
                if (details.url.includes("hls.js")) {
                    callback({
                        redirectURL: `http://localhost:${this.clientPort}/apple-hls.js`,
                    });
                } else {
                    callback({
                        cancel: false,
                    });
                }
            }
        );

        BrowserWindow.win.webContents.session.webRequest.onBeforeSendHeaders(
            async (
                details: { url: string; requestHeaders: { [x: string]: string } },
                callback: (arg0: { requestHeaders: any }) => void
            ) => {
                if (details.url === "https://buy.itunes.apple.com/account/web/info") {
                    details.requestHeaders["sec-fetch-site"] = "same-site";
                    details.requestHeaders["DNT"] = "1";
                    let itspod = await BrowserWindow.win.webContents.executeJavaScript(
                        `window.localStorage.getItem("music.ampwebplay.itspod")`
                    );
                    if (itspod != null)
                        details.requestHeaders["Cookie"] = `itspod=${itspod}`;
                }
                callback({requestHeaders: details.requestHeaders});
            }
        );

        let location = `http://localhost:${this.clientPort}/`;

        if (app.isPackaged) {
            BrowserWindow.win.loadURL(location);
        } else {
            BrowserWindow.win.loadURL(location, {
                userAgent: "Cider Development Environment",
            });
        }
    }

    /**
     * Initializes the window handlers
     */
    private startHandlers(): void {
        /**********************************************************************************************************************
         * ipcMain Events
         ****************************************************************************************************************** */
        ipcMain.on("cider-platform", (event) => {
            event.returnValue = process.platform;
        });

        ipcMain.handle("get-github-theme", async (event, url) => {
            const returnVal = {
                success: true,
                theme: null,
                message: ""
            }
            try {
                if (!existsSync(utils.getPath("themes"))) {
                    mkdirSync(utils.getPath("themes"));
                }
                if (url.endsWith("/")) url = url.slice(0, -1);
                let response = await fetch(
                    `${url}/archive/refs/heads/main.zip`
                );
                let repo = url.split("/").slice(-2).join("/");
                let apiRepo = await fetch(
                    `https://api.github.com/repos/${repo}`
                ).then((res) => res.json());
                console.debug(`REPO ID: ${apiRepo.id}`);
                // extract the files from the first folder in the zip response
                let zip = new AdmZip(await response.buffer());
                let entry = zip.getEntries()[0];
                if (!existsSync(join(utils.getPath("themes"), "gh_" + apiRepo.id))) {
                    mkdirSync(join(utils.getPath("themes"), "gh_" + apiRepo.id));
                }
                console.log(join(utils.getPath("themes"), "gh_" + apiRepo.id))
                zip.extractEntryTo(entry, join(utils.getPath("themes"), "gh_" + apiRepo.id), false, true);
                let commit = await fetch(
                    `https://api.github.com/repos/${repo}/commits`
                ).then((res) => res.json());
                console.debug(`COMMIT SHA: ${commit[0].sha}`);
                let theme = JSON.parse(
                    readFileSync(join(utils.getPath("themes"), "gh_" + apiRepo.id, "theme.json"), "utf8")
                );
                theme.id = apiRepo.id
                theme.commit = commit[0].sha;
                writeFileSync(
                    join(utils.getPath("themes"), "gh_" + apiRepo.id, "theme.json"),
                    JSON.stringify(theme, null, 4),
                    "utf8"
                );
            } catch (e) {
                returnVal.success = false;
            }
            BrowserWindow.win.webContents.send("theme-installed", returnVal);
        });

        ipcMain.on("get-themes", (event, _key) => {
            if (existsSync(utils.getPath("themes"))) {
                let files = readdirSync(utils.getPath("themes"));
                let themes = [];
                for (let file of files) {
                    if (file.endsWith(".less")) {
                        themes.push(file);
                    } else if (statSync(join(utils.getPath("themes"), file)).isDirectory()) {
                        let subFiles = readdirSync(join(utils.getPath("themes"), file));
                        for (let subFile of subFiles) {
                            if (subFile.endsWith(".less")) {
                                themes.push(join(file, subFile));
                            }
                        }
                    }
                }
                let themeObjects = [];
                for (let theme of themes) {
                    let themePath = join(utils.getPath("themes"), theme);
                    let themeName = theme;
                    let themeDescription = "";
                    if (theme.includes("/")) {
                        themeName = theme.split("/")[1];
                        themeDescription = theme.split("/")[0];
                    }
                    if (themePath.endsWith("index.less")) {
                        themePath = themePath.slice(0, -10);
                    }
                    if (existsSync(join(themePath, "theme.json"))) {
                        let themeJson = JSON.parse(readFileSync(join(themePath, "theme.json"), "utf8"));
                        themeObjects.push({
                            name: themeJson.name || themeName,
                            description: themeJson.description || themeDescription,
                            path: themePath,
                            file: theme,
                            github_repo: themeJson.github_repo || "",
                            commit: themeJson.commit || ""
                        });
                    } else {
                        themeObjects.push({
                            name: themeName,
                            description: themeDescription,
                            path: themePath,
                            file: theme,
                            github_repo: "",
                            commit: ""
                        });
                    }
                }
                event.returnValue = themeObjects;

            } else {
                event.returnValue = [];
            }
        });

        ipcMain.handle("open-path", async (event, path) => {
            switch(path) {
                default:
                case "plugins":
                    shell.openPath(utils.getPath("plugins"));
                    break;
                case "userdata":
                    shell.openPath(app.getPath("userData"));
                    break;
                case "themes":
                    shell.openPath(utils.getPath("themes"));
                    break;
            }
        });

        ipcMain.on("get-i18n", (event, key) => {
            event.returnValue = utils.getLocale(key);
        });

        ipcMain.on("get-i18n-listing", event => {
            let i18nFiles = readdirSync(join(__dirname, "../../src/i18n")).filter(file => file.endsWith(".json"));
            // read all the files and parse them
            let i18nListing = []
            for (let i = 0; i < i18nFiles.length; i++) {
                const i18n: { [index: string]: Object } = JSON.parse(readFileSync(join(__dirname, `../../src/i18n/${i18nFiles[i]}`), "utf8"));
                i18nListing.push({
                    "code": i18nFiles[i].replace(".json", ""),
                    "nameNative": i18n["i18n.languageName"] ?? i18nFiles[i].replace(".json", ""),
                    "nameEnglish": i18n["i18n.languageNameEnglish"] ?? i18nFiles[i].replace(".json", ""),
                    "category": i18n["i18n.category"] ?? "",
                    "authors": i18n["i18n.authors"] ?? ""
                })
            }
            event.returnValue = i18nListing;
        })

        ipcMain.on("get-gpu-mode", (event) => {
            event.returnValue = process.platform;
        });

        ipcMain.on("is-dev", (event) => {
            event.returnValue = this.devMode;
        });

        ipcMain.handle("put-cache", (_event, arg) => {
            writeFileSync(
                join(utils.getPath('ciderCache'), `${arg.file}.json`),
                arg.data
            );
        });

        ipcMain.on("get-cache", (event, arg) => {
            let read = ""
            if (existsSync(join(utils.getPath('ciderCache'), `${arg}.json`))) {
                read = readFileSync(
                    join(utils.getPath('ciderCache'), `${arg}.json`),
                    "utf8"
                );
            }
            event.returnValue = read;
        });

        ipcMain.handle("getYTLyrics", async (_event, track, artist) => {
            const u = track + " " + artist + " official video";
            return await search(u);
        });

        ipcMain.on("close", (_event) => {
            BrowserWindow.win.close();
        });

        ipcMain.on("maximize", (_event) => {
            // listen for maximize event
            if (BrowserWindow.win.isMaximized()) {
                BrowserWindow.win.unmaximize();
            } else {
                BrowserWindow.win.maximize();
            }
        });
        ipcMain.on("unmaximize", () => {
            // listen for maximize event
            BrowserWindow.win.unmaximize();
        });

        ipcMain.on("minimize", () => {
            // listen for minimize event
            BrowserWindow.win.minimize();
        });

        // Set scale
        ipcMain.on("setScreenScale", (_event, scale) => {
            BrowserWindow.win.webContents.setZoomFactor(parseFloat(scale));
        });

        ipcMain.on("windowmin", (_event, width, height) => {
            BrowserWindow.win.setMinimumSize(width, height);
        })

        ipcMain.on("windowontop", (_event, ontop) => {
            BrowserWindow.win.setAlwaysOnTop(ontop);
        });

        // Set scale
        ipcMain.on("windowresize", (_event, width, height, lock = false) => {
            BrowserWindow.win.setContentSize(width, height);
            BrowserWindow.win.setResizable(!lock);
        });

        //Fullscreen
        ipcMain.on('setFullScreen', (_event, flag) => {
            BrowserWindow.win.setFullScreen(flag)
        })
        //Fullscreen
        ipcMain.on('detachDT', (_event, _) => {
            BrowserWindow.win.webContents.openDevTools({mode: 'detach'});
        })


        ipcMain.on('play', (_event, type, id) => {
            BrowserWindow.win.webContents.executeJavaScript(`
			    MusicKit.getInstance().setQueue({ ${type}: '${id}', parameters : {l : app.mklang}}).then(function(queue) {
				    MusicKit.getInstance().play();
			    });
		    `)
        });

        ipcMain.on('get-remote-pair-url', (_event, _) => {
            let url = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
            if (app.isPackaged) {
                BrowserWindow.win.webContents.send('send-remote-pair-url', (`https://cider.sh/pair-remote?url=${Buffer.from(encodeURI(url)).toString('base64')}`).toString());
            } else {
                BrowserWindow.win.webContents.send('send-remote-pair-url', (`http://127.0.0.1:5500/pair-remote.html?url=${Buffer.from(encodeURI(url)).toString('base64')}`).toString());
            }

        });
        if (process.platform === "darwin") {
            app.setUserActivity('com.CiderCollective.remote.pair', {
                ip: `${BrowserWindow.getIP()}`
            }, `http://${BrowserWindow.getIP()}:${this.remotePort}`);
        }

        ipcMain.on('share-menu', async (_event, url) => {
            if (process.platform != 'darwin') return;
            //https://www.electronjs.org/docs/latest/api/share-menu
            console.log('[Share Sheet - App.ts]', url)
            const options = {
                title: 'Share',
                urls: [url]
            };
            const shareMenu = new ShareMenu(options);
            shareMenu.popup();
        })

        ipcMain.on('get-version', (_event) => {
            if (app.isPackaged) {
                _event.returnValue = app.getVersion()
            } else {
                _event.returnValue = `Experimental running on Electron ${app.getVersion()}`
            }

        });
        ipcMain.on('open-appdata', (_event) => {
            shell.openPath(app.getPath('userData'));
        });
        /* *********************************************************************************************
         * Window Events
         * **********************************************************************************************/
        if (process.platform === "win32") {
            let WND_STATE = {
                MINIMIZED: 0,
                NORMAL: 1,
                MAXIMIZED: 2,
                FULL_SCREEN: 3,
            };
            let wndState = WND_STATE.NORMAL;

            BrowserWindow.win.on("resize", (_: any) => {
                const isMaximized = BrowserWindow.win.isMaximized();
                const isMinimized = BrowserWindow.win.isMinimized();
                const isFullScreen = BrowserWindow.win.isFullScreen();
                const state = wndState;
                if (isMinimized && state !== WND_STATE.MINIMIZED) {
                    wndState = WND_STATE.MINIMIZED;
                } else if (isFullScreen && state !== WND_STATE.FULL_SCREEN) {
                    wndState = WND_STATE.FULL_SCREEN;
                } else if (isMaximized && state !== WND_STATE.MAXIMIZED) {
                    wndState = WND_STATE.MAXIMIZED;
                    BrowserWindow.win.webContents.executeJavaScript(`app.chrome.maximized = true`);
                } else if (state !== WND_STATE.NORMAL) {
                    wndState = WND_STATE.NORMAL;
                    BrowserWindow.win.webContents.executeJavaScript(
                        `app.chrome.maximized = false`
                    );
                }
            });
        }

        let isQuiting = false

        BrowserWindow.win.on("close", (event: Event) => {
            if ((utils.getStoreValue('general.close_button_hide') || process.platform === "darwin") && !isQuiting) {
                event.preventDefault();
                BrowserWindow.win.hide();
            } else {
                BrowserWindow.win.destroy();
            }
        })

        app.on('before-quit', () => {
            isQuiting = true
        });

        app.on('window-all-closed', () => {
            app.quit()
        })

        BrowserWindow.win.on("closed", () => {
            BrowserWindow.win = null;
        });

        // Set window Handler
        BrowserWindow.win.webContents.setWindowOpenHandler((x: any) => {
            if (x.url.includes("apple") || x.url.includes("localhost")) {
                return {action: "allow"};
            }
            shell.openExternal(x.url).catch(console.error);
            return {action: "deny"};
        });
    }

    /**
     * Gets ip
     * @private
     */
    private static getIP(): string {
        let ip: string = '';
        let alias = 0;
        const ifaces: any = networkInterfaces();
        for (let dev in ifaces) {
            ifaces[dev].forEach((details: any) => {
                if (details.family === 'IPv4') {
                    if (!/(loopback|vmware|internal|hamachi|vboxnet|virtualbox)/gi.test(dev + (alias ? ':' + alias : ''))) {
                        if (details.address.substring(0, 8) === '192.168.' ||
                            details.address.substring(0, 7) === '172.16.' ||
                            details.address.substring(0, 3) === '10.'
                        ) {
                            ip = details.address;
                            ++alias;
                        }
                    }
                }
            });
        }
        return ip;
    }

    /**
     * Broadcast the remote to the IP
     * @private
     */
    private async broadcastRemote() {
        const myString = `http://${BrowserWindow.getIP()}:${this.remotePort}`;
        const mdns = require('mdns-js');
        const encoded = new Buffer(myString).toString('base64');
        const x = mdns.tcp('cider-remote');
        const txt_record = {
            "Ver": "131077",
            'DvSv': '3689',
            'DbId': 'D41D8CD98F00B205',
            'DvTy': 'Cider',
            'OSsi': '0x212F0',
            'txtvers': '1',
            "CtlN": "Cider",
            "iV": "196623"
        };
        let server2 = mdns.createAdvertisement(x, `${await getPort({port: 3839})}`, {
            name: encoded,
            txt: txt_record
        });
        server2.start();
        console.log('remote broadcasted')
    }
}