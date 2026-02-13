from fastapi import FastAPI, HTTPException
from app.services.data_fetch import fetch_stock_data
from app.services.data_clean import clean_data
from app.services.data_features import add_features
import logging

app = FastAPI(title="Stock & ETF Signal Backend")

logger = logging.getLogger("uvicorn.error")


@app.get("/")
def home():
    return {"message": "Stock Signal Backend Running"}

@app.get("/test-ticker")
def test_ticker(ticker: str):
    """
    Test whether a ticker is valid and data can be fetched
    """
    try:
        df = fetch_stock_data(ticker)
        df = clean_data(df)
        features = add_features(df)

        return {
            "ticker": ticker,
            "rows_fetched": len(df),
            "columns": list(features.columns)
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/stock/{symbol}")
def get_stock_data(symbol: str):
    try:
        df = fetch_stock_data(symbol)
        df = clean_data(df)
        df = add_features(df)

        if df.empty:
            raise HTTPException(
                status_code=404,
                detail=f"No processed data available for symbol: {symbol}"
            )

        if "Date" in df.columns:
            df["Date"] = df["Date"].astype(str)

        return df.tail(5).to_dict(orient="records")

    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))

    except Exception as e:
        logger.exception(e)
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )
