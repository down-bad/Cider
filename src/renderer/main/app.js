import { app } from "./vueapp.js"
import {CiderCache} from './cidercache.js'
import {CiderFrontAPI} from './ciderfrontapi.js'
import {simulateGamepad} from './gamepad.js'
import {Events} from './events.js'
import { wsapi } from "./wsapi_interop.js"
import { MusicKitTools } from "./musickittools.js"


// Define window objects
window.app = app
window.MusicKitTools = MusicKitTools
window.CiderCache = CiderCache
window.CiderFrontAPI = CiderFrontAPI
window.wsapi = wsapi

// Mount Vue to #app
app.$mount("#app")

// Import gamepad support
app.simulateGamepad = simulateGamepad

Events.InitEvents()