# ⚡ Micro Menace Command Centre

A working, responsive neon dashboard — no dependencies, no login, no backend.

**Features**
- Live local clock and launch status
- Simulated terminal with safe commands (`help`, `about`, `date`, `status`, `clear`, `roll`, `motivate`)
- Tasks saved to browser localStorage
- Focus timer (25 min) with start/pause/reset
- Small JavaScript sandbox running in an isolated iframe
- Random creative build missions
- Purple and green visual themes

**Use locally:** double-click `index.html`.  
**Publish:** this repository includes `.github/workflows/pages.yml`. In GitHub **Settings → Pages**, set **Source = GitHub Actions**, then check the Actions tab.

**Security note:** Terminal commands are intentionally fake. The experiment iframe is sandboxed without same-origin access, but it is still a learning toy: never run code from untrusted sources.
