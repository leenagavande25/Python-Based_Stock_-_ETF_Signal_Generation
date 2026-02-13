import pickle
from app.services.data_fetch import fetch_stock_data
from app.services.data_clean import clean_data
from app.services.data_features import add_features

MODEL_DIR = "models"

def load_artifacts(ticker):
    model = pickle.load(open(f"{MODEL_DIR}/{ticker}_model.pkl", "rb"))
    scaler = pickle.load(open(f"{MODEL_DIR}/{ticker}_scaler.pkl", "rb"))
    features = pickle.load(open(f"{MODEL_DIR}/{ticker}_features.pkl", "rb"))
    return model, scaler, features


def predict_signal(ticker):
    model, scaler, features = load_artifacts(ticker)

    df = fetch_stock_data(ticker)
    df = clean_data(df)
    df = add_features(df)

    latest = df[features].iloc[-1:]
    latest_scaled = scaler.transform(latest)

    pred = model.predict(latest_scaled)[0]
    signal_map = {1: "BUY", 0: "HOLD", -1: "SELL"}

    return {
        "ticker": ticker,
        "signal": signal_map[pred],
        "price": float(df["Close"].iloc[-1])
    }
