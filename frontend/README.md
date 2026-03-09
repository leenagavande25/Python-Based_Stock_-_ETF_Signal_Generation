# Stock & ETF Signal Generation Platform — Frontend

React frontend for the Infosys Springboard Virtual Internship 6.0 project.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure backend URL
cp .env.example .env
# Edit .env and set REACT_APP_API_BASE_URL to your team's backend URL

# 3. Start dev server
npm start
# Opens at http://localhost:3000
```

---

## 📁 Project Structure

```
src/
├── pages/          # 6 route-level pages
├── components/     # Reusable UI components
│   ├── common/     # Navbar, Topbar, Loader
│   ├── charts/     # Recharts-based chart components
│   ├── signals/    # Signal table & cards
│   └── backtest/   # Backtest form & results
├── hooks/          # Custom React hooks (data fetching)
├── services/       # Axios API calls — connect to backend here
├── utils/          # Formatters & chart helpers
└── styles/         # Global CSS variables & styles
```

---

## 🔌 Connecting to Your Team's Backend

All API calls are in `src/services/`. Change the base URL in `.env`:

```
REACT_APP_API_BASE_URL=http://your-backend-url/api
```

### Expected API Endpoints

| Method | Endpoint                    | Purpose                        |
|--------|-----------------------------|--------------------------------|
| GET    | `/signals`                  | Get signals (filter by ticker) |
| GET    | `/signals/latest`           | Latest signal per ticker       |
| POST   | `/signals/generate`         | Trigger ML signal generation   |
| GET    | `/market/quote?ticker=AAPL` | Live quote                     |
| GET    | `/market/history`           | Historical OHLCV data          |
| GET    | `/market/overview`          | Dashboard overview stats       |
| POST   | `/backtest/run`             | Start backtest job             |
| GET    | `/backtest/:id`             | Poll backtest result           |
| GET    | `/alerts`                   | List alerts                    |
| POST   | `/alerts`                   | Create alert                   |
| DELETE | `/alerts/:id`               | Delete alert                   |
| PATCH  | `/alerts/:id/toggle`        | Enable/disable alert           |
| GET    | `/alerts/notifications`     | Recent fired notifications     |

> **Tip:** Share this table with your backend team so they match these endpoints exactly.

---

## 🛠 Tech Stack

- **React 18** — UI framework
- **React Router v6** — routing
- **Axios** — HTTP client
- **Recharts** — charts (LineChart, AreaChart, ComposedChart)
- **CSS Variables** — theming (dark trading terminal aesthetic)

---

## 📊 Pages

| Page        | Route        | Description                              |
|-------------|--------------|------------------------------------------|
| Dashboard   | `/`          | Overview stats, latest signals, movers   |
| Signals     | `/signals`   | Generate & browse ML signals             |
| Backtest    | `/backtest`  | Run strategy backtests, view metrics     |
| Alerts      | `/alerts`    | Create/manage price & signal alerts      |
| Market Data | `/market`    | Live quotes & historical charts          |
| Settings    | `/settings`  | API keys, notification config            |

---

## 🔄 Milestone Mapping

| Milestone          | Weeks | Frontend Work                           |
|--------------------|-------|-----------------------------------------|
| Setup & Data APIs  | 1–2   | MarketData page + services/hooks        |
| ML Signal Engine   | 3–4   | Signals page + SignalTable/Chart        |
| Backtesting        | 5–6   | Backtest page + EquityCurveChart        |
| Dashboard & Deploy | 7–8   | Dashboard + Alerts + Settings           |
