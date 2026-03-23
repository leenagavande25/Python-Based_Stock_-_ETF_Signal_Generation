# Stock Signal Generation System

An AI-powered stock signal prediction system for NSE India stocks using ML models and FastAPI.

## Tech Stack
- **Backend**: FastAPI, scikit-learn, LightGBM, XGBoost, yfinance
- **Frontend**: React + Vite, Chart.js, SWR
- **ML**: Per-stock `.pkl` models with LightGBM/XGBoost classifiers

## Project Structure
```
FastAPI/
├── app/
│   ├── core/         # Config, logging
│   ├── services/     # ML, data, alert, history services
│   ├── routes/       # FastAPI API endpoints
│   └── schemas/      # Pydantic models
├── frontend/         # React + Vite frontend
├── train_models.py   # Model training script
└── .env.example      # Environment variable template
models/               # Trained .pkl files (generated - not in git)
```

## Quick Start

### Backend
```bash
cd FastAPI
python -m venv venv
venv\Scripts\activate       # Windows
pip install -r requirements.txt
cp .env.example .env        # Fill in your credentials
uvicorn app.main:app --reload
```

### Frontend
```bash
cd FastAPI/frontend
npm install
npm run dev
```

### Train Models
```bash
cd FastAPI
python train_models.py
```

## Features
- Live NSE stock signals (BUY / HOLD / SELL) with confidence scores
- Strategy backtester with portfolio curve vs market benchmark
- Signal history log
- Email alerts on BUY/SELL signal detection
- Auto-refresh dashboard (15s / 30s / 60s)
- Confidence filter slider

## Environment Variables
See `.env.example` for required configuration.
