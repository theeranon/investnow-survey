/**
 * InvestNow Survey — Google Sheet writer.
 *
 * Deploy as: Deploy > New deployment > Web app,
 *   Execute as    : Me
 *   Who has access: Anyone      <-- respondents are not signed in
 *
 * The spreadsheet is opened by id rather than via getActiveSpreadsheet(), so this
 * works whether the script is bound to the sheet or standalone.
 *
 * The survey posts JSON with a text/plain content type on purpose: Apps Script
 * cannot answer a CORS preflight, and text/plain keeps the POST a simple request.
 */

var SPREADSHEET_ID = '1Xy4vMvQBlCy9AhSnHQh8yMOIpS7eKTX6dfv2PfyVX8k';

/** Tab to append to. Leave '' to use the first tab in the spreadsheet. */
var SHEET_NAME = '';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return json({ ok: false, error: 'empty request body' });
    }

    var body = JSON.parse(e.postData.contents);

    // The survey pings this endpoint to verify the deployment before going live.
    if (body.type === 'ping') {
      ensureSheet(body.headers);
      return json({ ok: true, pong: true });
    }

    if (!body.row || !body.row.length) {
      return json({ ok: false, error: 'missing row' });
    }

    var sheet = ensureSheet(body.headers);
    sheet.appendRow(body.row);
    return json({ ok: true, row: sheet.getLastRow() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Open the /exec URL in a browser to confirm the deployment is live. */
function doGet() {
  return json({ ok: true, service: 'investnow-survey' });
}

/** Returns the target tab, adding a frozen bold header row if it is still empty. */
function ensureSheet(headers) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = SHEET_NAME
    ? ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME)
    : ss.getSheets()[0];

  if (sheet.getLastRow() === 0 && headers && headers.length) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}
