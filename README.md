# Resource Hub

Hourly (8 AM–6 PM) resource allocation board for project managers. Static site (React via CDN, no build step) + Google Sheet storage through Google Apps Script.

- Day-wise, hour-by-hour grid for all 30 resources; click any cell to assign, move or free a resource for one or more hours.
- Capture stand-up decisions: project, task, blocker. "On Leave" is a project option.
- Free-resources panel for any hour, plus free hours per person per day.
- Works in **demo mode** (browser storage) until you connect a Sheet.

## Connect Google Sheets
1. Create a Google Sheet. Open **Extensions → Apps Script**, paste `apps-script/Code.gs`, set `KEY` to a secret string.
2. **Deploy → New deployment → Web app**: execute as *Me*, access *Anyone*. Authorise, copy the `/exec` URL.
3. In `index.html` set `API_URL` (the URL) and `API_KEY` (same as `KEY`).
4. Re-deploy the script (new version) whenever you change `Code.gs`. The `Allocations` tab is created on first use.

## Publish on GitHub Pages
Push this folder to a new repo, then **Settings → Pages → Deploy from branch → main / (root)**.

## Notes
- `API_KEY` sits in public JS, so it only deters casual writes. For anything sensitive use a private repo/hosting or add real auth.
- Resources and projects are constants at the top of `index.html`. Keep resource ids stable: the Sheet references them.
- Hours, one project per resource per hour. Edits are last-write-wins.
