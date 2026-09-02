const fs = require("fs");

function saveSession(path, buffer) {
  let sessions = loadSessions(path);
  const currentSession = sessions.at(-1);
  const flushBuffer = { ...currentSession, ...buffer };
  sessions[sessions.length - 1] = flushBuffer;
  fs.writeFileSync(path, JSON.stringify(sessions, null, 2));

  console.debug('Flushed buffer', buffer)
}

function loadSessions(path) {
  let sessions = [];
  if (fs.existsSync(path)) {
    const text = fs.readFileSync(path, "utf-8");
    if (text.trim()) sessions = JSON.parse(text);
  }
  return sessions;
}

function addNewSession(path, user) {
  let sessions = loadSessions(path);
  const newSession = { sessionId: `${user}_${Date.now()}` };
  sessions.push(newSession);

  fs.writeFileSync(path, JSON.stringify(sessions, null, 2));
}
function resetBuffer(buffer) {
  buffer.idleTime = 0;
  buffer.appsKeyCount = {};
  buffer.appsTimeCount = {};
  buffer.start = null;
  buffer.stop = null;
  buffer.activeWin = null;   // optional — the next poll repopulates it
}
module.exports = { saveSession, addNewSession, resetBuffer };
