import pandas as pd
import numpy as np


def add_features(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        raise ValueError("Empty DataFrame received for feature creation")

    required_columns = {"Close"}

    if not required_columns.issubset(df.columns):
        raise ValueError("Required column 'Close' not found in data")

    df = df.copy()

    # Returns
    df["Daily_Return"] = df["Close"].pct_change()

    # Moving averages
    df["MA_10"] = df["Close"].rolling(window=10).mean()
    df["MA_50"] = df["Close"].rolling(window=50).mean()

    # RSI
    delta = df["Close"].diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()

    rs = avg_gain / avg_loss.replace(0, np.nan)
    df["RSI"] = 100 - (100 / (1 + rs))

    df.dropna(inplace=True)
    return df
