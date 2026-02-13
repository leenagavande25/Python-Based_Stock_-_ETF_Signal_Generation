import yfinance as yf
import pandas as pd


def fetch_stock_data(symbol: str) -> pd.DataFrame:
    try:
        df = yf.download(symbol, period="1y", progress=False)
    except Exception:
        raise ValueError("Failed to fetch data from Yahoo Finance")

    if df is None or df.empty:
        raise ValueError(f"No data returned for symbol: {symbol}")

    # 🔥 FIX 1: Flatten columns if MultiIndex
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    # 🔥 FIX 2: Validate required columns
    if "Close" not in df.columns:
        raise ValueError("Required column 'Close' not found in data")

    df = df.reset_index()
    return df
