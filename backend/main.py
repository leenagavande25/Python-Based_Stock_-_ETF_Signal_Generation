"""
FastAPI Backend - AI Stock Signal Platform
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os, pickle, json, asyncio
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
import pandas as pd
import yfinance as yf

app = FastAPI(
    title="AI Stock Signal Platform",
    description="ML-powered buy/sell/hold signals for Top 10 Indian Stocks",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

TOP_10_STOCKS = {
    "RELIANCE":   "RELIANCE.NS",
    "TCS":        "TCS.NS",
    "HDFCBANK":   "HDFCBANK.NS",
    "INFY":       "INFY.NS",
    "ICICIBANK":  "ICICIBANK.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "ITC":        "ITC.NS",
    "SBIN":       "SBIN.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "KOTAKBANK":  "KOTAKBANK.NS",
}

SECTOR_MAP = {
    "RELIANCE":    "Energy / Conglomerate",
    "TCS":         "Information Technology",
    "HDFCBANK":    "Banking & Finance",
    "INFY":        "Information Technology",
    "ICICIBANK":   "Banking & Finance",
    "HINDUNILVR":  "FMCG",
    "ITC":         "FMCG / Conglomerate",
    "SBIN":        "Banking & Finance",
    "BHARTIARTL":  "Telecommunications",
    "KOTAKBANK":   "Banking & Finance",
}

_model_cache: dict = {}


# ─── Helpers ───────────────────────────────────────────────────────────────────
def load_model(ticker: str) -> dict:
    if ticker in _model_cache:
        return _model_cache[ticker]
    path = os.path.join(MODELS_DIR, f"{ticker}.pkl")
    if not os.path.exists(path):
        raise HTTPException(404, f"Model not found for {ticker}. Run train_models.py first.")
    with open(path, "rb") as f:
        data = pickle.load(f)
    _model_cache[ticker] = data
    return data


def fetch_latest_ohlcv(symbol: str, days: int = 60) -> pd.DataFrame:
    end   = datetime.today()
    start = end - timedelta(days=days)
    df = yf.download(symbol, start=start, end=end, progress=False, auto_adjust=True)
    df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]
    return df


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    close = df["Close"]
    df["SMA_10"]  = close.rolling(10).mean()
    df["SMA_20"]  = close.rolling(20).mean()
    df["SMA_50"]  = close.rolling(50).mean()
    df["EMA_12"]  = close.ewm(span=12).mean()
    df["EMA_26"]  = close.ewm(span=26).mean()
    df["MACD"]    = df["EMA_12"] - df["EMA_26"]
    df["MACD_signal"] = df["MACD"].ewm(span=9).mean()
    delta = close.diff()
    gain  = delta.clip(lower=0).rolling(14).mean()
    loss  = (-delta.clip(upper=0)).rolling(14).mean()
    rs    = gain / (loss + 1e-9)
    df["RSI"] = 100 - (100 / (1 + rs))
    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()
    df["BB_upper"] = bb_mid + 2 * bb_std
    df["BB_lower"] = bb_mid - 2 * bb_std
    df["BB_width"] = (df["BB_upper"] - df["BB_lower"]) / (bb_mid + 1e-9)
    df["Volume_MA10"]  = df["Volume"].rolling(10).mean()
    df["Volume_ratio"] = df["Volume"] / (df["Volume_MA10"] + 1e-9)
    df["Return_1d"]  = close.pct_change(1)
    df["Return_5d"]  = close.pct_change(5)
    df["Return_10d"] = close.pct_change(10)
    df["High_Low_ratio"]    = df["High"]  / (df["Low"]  + 1e-9)
    df["Close_Open_ratio"]  = close / (df["Open"] + 1e-9)
    df["SMA10_above_SMA20"] = (df["SMA_10"] > df["SMA_20"]).astype(int)
    df["Price_above_SMA50"] = (close > df["SMA_50"]).astype(int)
    return df


def safe_float(val):
    if isinstance(val, (np.floating, np.integer)):
        return float(val)
    if isinstance(val, float) and (np.isnan(val) or np.isinf(val)):
        return None
    return val


# ─── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "AI Stock Signal Platform API", "version": "1.0.0"}


@app.get("/api/stocks")
def list_stocks():
    """List all supported stocks with model availability."""
    stocks = []
    for name, symbol in TOP_10_STOCKS.items():
        pkl = os.path.join(MODELS_DIR, f"{name}.pkl")
        stocks.append({
            "ticker":    name,
            "symbol":    symbol,
            "sector":    SECTOR_MAP.get(name, "N/A"),
            "model_ready": os.path.exists(pkl),
        })
    return {"stocks": stocks, "total": len(stocks)}


@app.get("/api/signal/{ticker}")
def get_signal(ticker: str):
    """Get the stored signal from pickle for a ticker."""
    ticker = ticker.upper()
    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404, f"{ticker} not in supported list.")
    data = load_model(ticker)
    return {
        "ticker":       data["ticker_name"],
        "symbol":       data["ticker_symbol"],
        "sector":       SECTOR_MAP.get(ticker, "N/A"),
        "signal":       data["latest_signal"],
        "probabilities":data["signal_proba"],
        "latest_close": data["latest_close"],
        "latest_date":  data["latest_date"],
        "accuracy":     data["accuracy"],
        "model_type":   data["model_type"],
        "trained_at":   data["trained_at"],
    }


@app.get("/api/signal/{ticker}/live")
def get_live_signal(ticker: str):
    """Fetch fresh market data and compute a new signal in real-time."""
    ticker = ticker.upper()
    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404, f"{ticker} not in supported list.")

    data   = load_model(ticker)
    model  = data["model"]
    scaler = data["scaler"]
    feat   = data["feature_cols"]

    symbol = TOP_10_STOCKS[ticker]
    raw    = fetch_latest_ohlcv(symbol, days=80)
    if raw.empty or len(raw) < 30:
        raise HTTPException(503, "Insufficient live data from Yahoo Finance.")

    df = compute_features(raw)
    df.dropna(inplace=True)
    if df.empty:
        raise HTTPException(503, "Feature computation failed.")

    X_raw = scaler.transform(df[feat].iloc[[-1]].values)
    selector = data.get("selector")
    X = selector.transform(X_raw) if selector is not None else X_raw
    proba      = model.predict_proba(X)[0]
    signal_cls = model.predict(X)[0]
    signal_map = {0: "SELL", 1: "HOLD", 2: "BUY"}

    latest = df.iloc[-1]
    return {
        "ticker":       ticker,
        "symbol":       symbol,
        "sector":       SECTOR_MAP.get(ticker, "N/A"),
        "signal":       signal_map[int(signal_cls)],
        "probabilities":{
            "SELL": round(float(proba[0]), 4),
            "HOLD": round(float(proba[1]), 4),
            "BUY":  round(float(proba[2]), 4),
        },
        "indicators": {
            "close":        safe_float(latest["Close"]),
            "rsi":          safe_float(round(latest["RSI"], 2)),
            "macd":         safe_float(round(latest["MACD"], 4)),
            "sma_10":       safe_float(round(latest["SMA_10"], 2)),
            "sma_20":       safe_float(round(latest["SMA_20"], 2)),
            "bb_upper":     safe_float(round(latest["BB_upper"], 2)),
            "bb_lower":     safe_float(round(latest["BB_lower"], 2)),
            "volume_ratio": safe_float(round(latest["Volume_ratio"], 3)),
        },
        "accuracy":     data["accuracy"],
        "model_type":   data["model_type"],
        "live":         True,
        "timestamp":    datetime.now().isoformat(),
    }


@app.get("/api/signals/all")
def get_all_signals():
    """Return stored signals for all 10 stocks."""
    results = []
    for name in TOP_10_STOCKS:
        try:
            d = load_model(name)
            results.append({
                "ticker":        d["ticker_name"],
                "sector":        SECTOR_MAP.get(name, "N/A"),
                "signal":        d["latest_signal"],
                "probabilities": d["signal_proba"],
                "latest_close":  d["latest_close"],
                "latest_date":   d["latest_date"],
                "accuracy":      d["accuracy"],
                "model_type":    d["model_type"],
            })
        except:
            results.append({
                "ticker": name,
                "sector": SECTOR_MAP.get(name, "N/A"),
                "signal": "N/A",
                "error":  "Model not trained yet",
            })
    return {"signals": results, "generated_at": datetime.now().isoformat()}


@app.get("/api/history/{ticker}")
def get_price_history(ticker: str, days: int = 90):
    """Return OHLCV + technical indicator history for charting."""
    ticker = ticker.upper()
    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404, f"{ticker} not in supported list.")

    symbol = TOP_10_STOCKS[ticker]
    raw    = fetch_latest_ohlcv(symbol, days=days + 60)
    if raw.empty:
        raise HTTPException(503, "No data from Yahoo Finance.")

    df = compute_features(raw)
    df.dropna(inplace=True)
    df = df.tail(days)

    records = []
    for idx, row in df.iterrows():
        records.append({
            "date":       str(idx.date()),
            "open":       safe_float(round(row["Open"], 2)),
            "high":       safe_float(round(row["High"], 2)),
            "low":        safe_float(round(row["Low"], 2)),
            "close":      safe_float(round(row["Close"], 2)),
            "volume":     safe_float(int(row["Volume"])),
            "sma_10":     safe_float(round(row["SMA_10"], 2)),
            "sma_20":     safe_float(round(row["SMA_20"], 2)),
            "rsi":        safe_float(round(row["RSI"], 2)),
            "macd":       safe_float(round(row["MACD"], 4)),
            "bb_upper":   safe_float(round(row["BB_upper"], 2)),
            "bb_lower":   safe_float(round(row["BB_lower"], 2)),
        })

    return {"ticker": ticker, "symbol": symbol, "history": records, "count": len(records)}


@app.get("/api/backtest/{ticker}")
def backtest(ticker: str, days: int = 252):
    """Simple signal-based backtest over historical data."""
    ticker = ticker.upper()
    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404, f"{ticker} not in supported list.")

    data   = load_model(ticker)
    model  = data["model"]
    scaler = data["scaler"]
    feat   = data["feature_cols"]

    symbol = TOP_10_STOCKS[ticker]
    raw    = fetch_latest_ohlcv(symbol, days=days + 100)
    if raw.empty:
        raise HTTPException(503, "No data.")

    df = compute_features(raw)
    df.dropna(inplace=True)
    df = df.tail(days)

    X_raw    = scaler.transform(df[feat].values)
    selector = data.get("selector")
    X        = selector.transform(X_raw) if selector is not None else X_raw
    signals  = model.predict(X)

    df = df.copy()
    df["signal"] = signals
    df["fwd_ret"] = df["Close"].pct_change(5).shift(-5)

    strategy_returns, bnh_returns = [], []
    trades, wins = 0, 0

    for i in range(len(df) - 5):
        sig = df["signal"].iloc[i]
        ret = df["fwd_ret"].iloc[i]
        if sig == 2:   # BUY
            strategy_returns.append(ret)
            trades += 1
            if ret > 0: wins += 1
        elif sig == 0: # SELL (short)
            strategy_returns.append(-ret)
            trades += 1
            if -ret > 0: wins += 1
        else:
            strategy_returns.append(0)
        bnh_returns.append(df["Close"].pct_change().iloc[i+1])

    strategy_cum = float(np.prod([1 + r for r in strategy_returns if not np.isnan(r)]) - 1)
    bnh_cum      = float(np.prod([1 + r for r in bnh_returns      if not np.isnan(r)]) - 1)

    s_arr = np.array([r for r in strategy_returns if not np.isnan(r)])
    sharpe = float(np.mean(s_arr) / (np.std(s_arr) + 1e-9) * np.sqrt(252)) if len(s_arr) > 0 else 0

    cumulative = np.cumprod(1 + s_arr)
    drawdown   = float(np.min(cumulative / np.maximum.accumulate(cumulative) - 1)) if len(cumulative) > 0 else 0

    signal_dist = {"BUY": int((signals==2).sum()), "HOLD": int((signals==1).sum()), "SELL": int((signals==0).sum())}

    return {
        "ticker":            ticker,
        "backtest_days":     days,
        "strategy_return":   round(strategy_cum * 100, 2),
        "buy_hold_return":   round(bnh_cum * 100, 2),
        "sharpe_ratio":      round(sharpe, 3),
        "max_drawdown":      round(drawdown * 100, 2),
        "total_trades":      trades,
        "win_rate":          round(wins / trades * 100, 2) if trades > 0 else 0,
        "signal_distribution": signal_dist,
    }


@app.get("/api/models/status")
def models_status():
    """Return training status of all 10 pickle files."""
    status = []
    for name in TOP_10_STOCKS:
        pkl = os.path.join(MODELS_DIR, f"{name}.pkl")
        if os.path.exists(pkl):
            d = load_model(name)
            status.append({
                "ticker":      name,
                "trained":     True,
                "accuracy":    d["accuracy"],
                "model_type":  d["model_type"],
                "trained_at":  d["trained_at"],
                "train_samples": d["train_samples"],
            })
        else:
            status.append({"ticker": name, "trained": False})
    trained = sum(1 for s in status if s.get("trained"))
    return {"models": status, "trained": trained, "total": len(status)}