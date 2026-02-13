import pandas as pd


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        raise ValueError("Empty DataFrame received for cleaning")

    df = df.copy()

    df.drop_duplicates(inplace=True)
    df.ffill(inplace=True)

    if "Date" in df.columns:
        df.sort_values("Date", inplace=True)

    return df
