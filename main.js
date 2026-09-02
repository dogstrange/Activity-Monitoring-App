const { ipcMain, powerMonitor } = require("electron");
const { app, BrowserWindow, Menu, Tray } = require("electron/main");
const { nativeImage } = require("electron/common");
const fs = require("fs");
const path = require("path");
const {
  startMonitoring,
  stopMonitoring,
  clockIn,
  clockOut,
  pollIdleTime,
  pollActiveWin,
} = require("./core/activity");

const { saveSession } = require("./core/tool");

const USERFILE = path.join(__dirname, "user.json");
const SESSION_FILE = path.join(__dirname, "activity.json");
const IDLE_THRESHOLD = 60;

let activityPolling = null;
let flushTimer = null;
let user = "";

let buffer = {
  start: null,
  stop: null,
  activeWin: null,
  idleTime: 0,
  appsKeyCount: {},
  appsTimeCount: {},
};

let tray = null;

const createWindow = (htmlFile) => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { preload: path.join(__dirname, "preload.js") },
  });

  win.loadFile(htmlFile);
};

const closeWindow = () => {
  const wins = BrowserWindow.getAllWindows();
  wins.map((win) => win.close());
};

app.whenReady().then(() => {
  createWindow("index.html");
  const icon = nativeImage
    .createFromPath(path.join(__dirname, "img/ps-badge.png"))
    .resize({ width: 23, height: 23 });

  tray = new Tray(icon);
  tray.setToolTip("PropertyScout activity monitor :)");

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Open Dashboard",
      click: () => {
        const wins = BrowserWindow.getAllWindows();
        if (wins.length === 0) {
          createWindow("activity.html");
        } else {
          wins[0].focus();
        }
      },
    },
    {
      label: "Clock in",
      click: () => {
        clockIn(user, SESSION_FILE, buffer);
        activityPolling = setInterval(async () => {
          const activeStatus = powerMonitor.getSystemIdleState(IDLE_THRESHOLD);

          pollIdleTime(buffer, activeStatus);
          await pollActiveWin(buffer, activeStatus);
        }, 5000);

        flushTimer = setInterval(
          () => saveSession(SESSION_FILE, buffer),
          20_000,
        );
      },
    },
    {
      label: "Clock out",
      click: () => {
        clockOut(buffer, SESSION_FILE);
        clearInterval(activityPolling);
        clearInterval(flushTimer);
        stopMonitoring();
      },
    },
    {
      label: "quit",
      type: "normal",
      click: () => {
        clearInterval(activityPolling);
        clearInterval(flushTimer);
        stopMonitoring();
        console.debug("Session performance", buffer);

        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  ipcMain.handle("save-user", (event, data) => {
    let users = [];
    if (fs.existsSync(USERFILE)) {
      const text = fs.readFileSync(USERFILE, "utf-8");
      if (text.trim()) users = JSON.parse(text);
    }

    users.push(data);

    fs.writeFileSync(USERFILE, JSON.stringify(users, null, 2));

    return { ok: true };
  });

  ipcMain.handle("login-user", (event, data) => {
    let users = [];
    if (fs.existsSync(USERFILE)) {
      const text = fs.readFileSync(USERFILE, "utf-8");
      if (text.trim()) users = JSON.parse(text);
    }

    const isRegistered = users.some(
      (user) =>
        data.username === user.username && data.password === user.password,
    ); //check if any item matches conditions, return bool

    if (isRegistered) {
      user = data.username;
      startMonitoring(buffer);
      // if we pass the var as argument, function pass the value not the reference.

      closeWindow();
    }

    return { ok: isRegistered };
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow("index.html");
    }
  });
});

app.on("window-all-closed", () => {});
