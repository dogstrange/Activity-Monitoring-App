const { uIOhook } = require("uiohook-napi");

const activeWin = require("active-win");

const { addNewSession, resetBuffer, saveSession } = require("./tool");

const POLLING_RATE = 5;

function startMonitoring(buffer) {
  uIOhook.on("keydown", (e) => {
    const app = buffer.activeWin?.app ?? "unknown";
    buffer.appsKeyCount[app] = (buffer.appsKeyCount[app] ?? 0) + 1;
    console.debug("Current key count", buffer.appsKeyCount);
  });

  uIOhook.start();

  console.log("Start monitoring..");
}

function stopMonitoring() {
  uIOhook.stop();

  console.log("Stop monitoring");
}
function clockIn(user, path, buffer) {
  addNewSession(path, user);
  buffer.start = new Date().toString();
  console.debug("Starting at: ", buffer.start);
}
function clockOut(buffer, path) {
  buffer.stop = new Date().toString();
  console.debug("Stopping at: ", buffer.stop);
  saveSession(path, buffer);
  resetBuffer(buffer);
}

async function pollActiveWin(buffer, activeStatus) {
  const win = await activeWin();
  buffer.activeWin = win ? { app: win.owner.name, title: win.title } : null;
  console.debug("Current active windows", buffer.activeWin);

  const app = buffer.activeWin?.app ?? "unknown";
  if (app && activeStatus === "active") {
    buffer.appsTimeCount[app] = (buffer.appsTimeCount[app] ?? 0) + POLLING_RATE;
  }
}

function pollIdleTime(buffer, activeStatus) {
  if (activeStatus !== "active") buffer.idleTime += POLLING_RATE;
  console.debug("User Idle Time", buffer.idleTime);
  //register the callback function
}

module.exports = {
  startMonitoring,
  stopMonitoring,
  clockIn,
  clockOut,
  pollIdleTime,
  pollActiveWin,
};
