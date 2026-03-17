from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import pickle
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import yfinance as yf

app = FastAPI(title="AI Stock Signal Platform")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

TOP_10_STOCKS = {
    "RELIANCE": "RELIANCE.NS",
    "TCS": "TCS.NS",
    "HDFCBANK": "HDFCBANK.NS",
    "INFY": "INFY.NS",
    "ICICIBANK": "ICICIBANK.NS",
    "HINDUNILVR": "HINDUNILVR.NS",
    "ITC": "ITC.NS",
    "SBIN": "SBIN.NS",
    "BHARTIARTL": "BHARTIARTL.NS",
    "KOTAKBANK": "KOTAKBANK.NS",
}

SECTOR_MAP = {
    "RELIANCE": "Energy / Conglomerate",
    "TCS": "Information Technology",
    "HDFCBANK": "Banking & Finance",
    "INFY": "Information Technology",
    "ICICIBANK": "Banking & Finance",
    "HINDUNILVR": "FMCG",
    "ITC": "FMCG / Conglomerate",
    "SBIN": "Banking & Finance",
    "BHARTIARTL": "Telecommunications",
    "KOTAKBANK": "Banking & Finance",
}

_model_cache = {}

# -------------------------------------------------------
# LOAD MODEL
# -------------------------------------------------------
def load_model(ticker):
    if ticker in _model_cache:
        return _model_cache[ticker]

    path = os.path.join(MODELS_DIR, f"{ticker}.pkl")

    if not os.path.exists(path):
        raise HTTPException(404, "Model not trained")

    with open(path, "rb") as f:
        model = pickle.load(f)

    _model_cache[ticker] = model
    return model


# -------------------------------------------------------
# DOWNLOAD DATA
# -------------------------------------------------------
def fetch_data(symbol, days=200):

    end = datetime.today()
    start = end - timedelta(days=days)

    df = yf.download(symbol, start=start, end=end, progress=False)

    df.columns = [c[0] if isinstance(c, tuple) else c for c in df.columns]

    return df


# -------------------------------------------------------
# FEATURE ENGINEERING
# -------------------------------------------------------
def compute_features(df):

    close = df["Close"]

    df["SMA_10"] = close.rolling(10).mean()
    df["SMA_20"] = close.rolling(20).mean()
    df["SMA_50"] = close.rolling(50).mean()

    df["EMA_12"] = close.ewm(span=12).mean()
    df["EMA_26"] = close.ewm(span=26).mean()

    df["MACD"] = df["EMA_12"] - df["EMA_26"]
    df["MACD_signal"] = df["MACD"].ewm(span=9).mean()

    delta = close.diff()
    gain = delta.clip(lower=0).rolling(14).mean()
    loss = (-delta.clip(upper=0)).rolling(14).mean()

    rs = gain / (loss + 1e-9)
    df["RSI"] = 100 - (100 / (1 + rs))

    bb_mid = close.rolling(20).mean()
    bb_std = close.rolling(20).std()

    df["BB_upper"] = bb_mid + 2 * bb_std
    df["BB_lower"] = bb_mid - 2 * bb_std
    df["BB_width"] = (df["BB_upper"] - df["BB_lower"]) / (bb_mid + 1e-9)

    df["Return_1d"] = close.pct_change(1)
    df["Return_5d"] = close.pct_change(5)
    df["Return_10d"] = close.pct_change(10)

    df["Volume_MA10"] = df["Volume"].rolling(10).mean()
    df["Volume_ratio"] = df["Volume"] / (df["Volume_MA10"] + 1e-9)

    return df


# -------------------------------------------------------
# ROOT
# -------------------------------------------------------
@app.get("/")
def home():
    return {"message": "AI Stock Signal Platform API"}


# -------------------------------------------------------
# ALL SIGNALS
# -------------------------------------------------------
@app.get("/api/signals/all")
def all_signals():

    results = []

    for ticker in TOP_10_STOCKS:

        try:

            data = load_model(ticker)

            results.append(
                {
                    "ticker": ticker,
                    "sector": SECTOR_MAP.get(ticker),
                    "signal": data["latest_signal"],
                    "probabilities": data["signal_proba"],
                    "latest_close": data["latest_close"],
                    "latest_date": data["latest_date"],
                    "accuracy": data["accuracy"],
                    "model_type": data["model_type"],
                }
            )

        except:

            results.append(
                {
                    "ticker": ticker,
                    "sector": SECTOR_MAP.get(ticker),
                    "signal": "N/A",
                }
            )

    return {"signals": results}


# -------------------------------------------------------
# LIVE SIGNAL
# -------------------------------------------------------
@app.get("/api/signal/{ticker}/live")
def live_signal(ticker):

    ticker = ticker.upper()

    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404)

    data = load_model(ticker)

    model = data["model"]
    scaler = data["scaler"]
    selector = data["selector"]
    features = data["feature_cols"]

    symbol = TOP_10_STOCKS[ticker]

    df = fetch_data(symbol, 120)

    df = compute_features(df)

    df.dropna(inplace=True)

    # ensure all features exist
    for f in features:
        if f not in df.columns:
            df[f] = 0

    X = scaler.transform(df[features].iloc[[-1]])

    if selector:
        X = selector.transform(X)

    proba = model.predict_proba(X)[0]

    signal_map = {0: "SELL", 1: "HOLD", 2: "BUY"}

    signal = signal_map[model.predict(X)[0]]

    return {
        "ticker": ticker,
        "signal": signal,
        "probabilities": {
            "SELL": float(proba[0]),
            "HOLD": float(proba[1]),
            "BUY": float(proba[2]),
        },
        "timestamp": datetime.now().isoformat(),
    }


# -------------------------------------------------------
# HISTORY
# -------------------------------------------------------
@app.get("/api/history/{ticker}")
def history(ticker, days: int = 90):

    ticker = ticker.upper()

    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404)

    symbol = TOP_10_STOCKS[ticker]

    df = fetch_data(symbol, days + 50)

    df = compute_features(df)

    df.dropna(inplace=True)

    df = df.tail(days)

    history = []

    for i, row in df.iterrows():

        history.append(
            {
                "date": str(i.date()),
                "open": float(row["Open"]),
                "high": float(row["High"]),
                "low": float(row["Low"]),
                "close": float(row["Close"]),
                "volume": int(row["Volume"]),
                "rsi": float(row["RSI"]),
                "macd": float(row["MACD"]),
            }
        )

    return {"ticker": ticker, "history": history}


# -------------------------------------------------------
# BACKTEST
# -------------------------------------------------------
@app.get("/api/backtest/{ticker}")
def backtest(ticker, days: int = 252):

    ticker = ticker.upper()

    if ticker not in TOP_10_STOCKS:
        raise HTTPException(404)

    data = load_model(ticker)

    model = data["model"]
    scaler = data["scaler"]
    selector = data["selector"]
    features = data["feature_cols"]

    symbol = TOP_10_STOCKS[ticker]

    df = fetch_data(symbol, days + 200)

    df = compute_features(df)

    df.dropna(inplace=True)

    df = df.tail(days)

    for f in features:
        if f not in df.columns:
            df[f] = 0

    X = scaler.transform(df[features])

    if selector:
        X = selector.transform(X)

    signals = model.predict(X)

    df["signal"] = signals
    df["future_return"] = df["Close"].pct_change(5).shift(-5)

    strategy = []
    trades = 0
    wins = 0

    for i in range(len(df) - 5):

        sig = df["signal"].iloc[i]
        ret = df["future_return"].iloc[i]

        if sig == 2:

            strategy.append(ret)
            trades += 1
            if ret > 0:
                wins += 1

        elif sig == 0:

            strategy.append(-ret)
            trades += 1
            if -ret > 0:
                wins += 1

    strategy_return = np.prod([1 + r for r in strategy if not np.isnan(r)]) - 1

    win_rate = (wins / trades * 100) if trades > 0 else 0

    return {
        "ticker": ticker,
        "strategy_return": round(strategy_return * 100, 2),
        "total_trades": trades,
        "win_rate": round(win_rate, 2),
    }


# -------------------------------------------------------
# MODEL STATUS
# -------------------------------------------------------
@app.get("/api/models/status")
def models_status():
    status = []

    for name in TOP_10_STOCKS:
        pkl = os.path.join(MODELS_DIR, f"{name}.pkl")

        if os.path.exists(pkl):
            d = load_model(name)

            status.append({
                "ticker": name,
                "trained": True,
                "accuracy": d.get("accuracy"),
                "model_type": d.get("model_type"),
                "trained_at": d.get("trained_at"),
                "train_samples": d.get("train_samples", 0)   # FIX
            })

        else:
            status.append({
                "ticker": name,
                "trained": False,
                "accuracy": None,
                "model_type": None,
                "train_samples": 0
            })

    trained = sum(1 for s in status if s.get("trained"))

    return {
        "models": status,
        "trained": trained,
        "total": len(status)
    }