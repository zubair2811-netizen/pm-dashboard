// Google Apps Script backend. Bind to a Google Sheet (Extensions > Apps Script).
const KEY = "change-me";            // must match API_KEY in index.html
const SHEET = "Allocations";
const HEAD = ["date", "hour", "resourceId", "resourceName", "project", "task", "blocker", "updatedAt"];

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) {
    s = ss.insertSheet(SHEET);
    s.appendRow(HEAD);
    s.setFrozenRows(1);
    s.getRange("A:A").setNumberFormat("@"); // keep dates as plain text
  }
  return s;
}
const out_ = (o) => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
const day_ = (v) => (v instanceof Date ? Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd") : String(v));

function doGet(e) {
  if (e.parameter.key !== KEY) return out_({ error: "Unauthorized" });
  const rows = sheet_().getDataRange().getValues().slice(1)
    .filter((r) => day_(r[0]) === e.parameter.date)
    .map((r) => ({ hour: Number(r[1]), resourceId: Number(r[2]), project: r[4], task: r[5], blocker: r[6] }));
  return out_({ allocations: rows });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const p = JSON.parse(e.postData.contents);
    if (p.key !== KEY) return out_({ error: "Unauthorized" });
    const s = sheet_();
    const index = {};
    s.getDataRange().getValues().forEach((r, i) => { if (i) index[day_(r[0]) + "|" + r[1] + "|" + r[2]] = i + 1; });
    const remove = [];
    p.hours.forEach((h) => {
      const row = index[p.date + "|" + h + "|" + p.resourceId];
      if (!p.project) { if (row) remove.push(row); return; } // empty project = free the slot
      const vals = [p.date, h, p.resourceId, p.resourceName, p.project, p.task || "", p.blocker || "", new Date()];
      if (row) s.getRange(row, 1, 1, vals.length).setValues([vals]); else s.appendRow(vals);
    });
    remove.sort((a, b) => b - a).forEach((r) => s.deleteRow(r));
    return out_({ ok: true });
  } finally {
    lock.releaseLock();
  }
}
