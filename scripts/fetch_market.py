import yfinance as yf
import json
import os

SYMBOLS = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "META", "AMZN", "BTC-USD", "RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "SBIN.NS"]

def fetch_market():
    tickers_data = []
    try:
        # Batch download 1-day pricing to get opening and current closing
        data = yf.download(SYMBOLS, period="1d", group_by="ticker", progress=False)
        for symbol in SYMBOLS:
            # Handle multi-index dataframe structure from yfinance batch downloads
            ticker_df = data[symbol] if len(SYMBOLS) > 1 else data
            if not ticker_df.empty:
                import math
                
                open_price = float(ticker_df['Open'].iloc[0])
                current_price = float(ticker_df['Close'].iloc[-1])
                
                # Sanitize NaNs
                if math.isnan(open_price) or math.isnan(current_price):
                    continue
                    
                change = current_price - open_price
                change_pct = (change / open_price) * 100 if open_price else 0
                
                currency = '₹' if symbol.endswith('.NS') else '$'
                display_symbol = symbol.replace('.NS', '') if symbol.endswith('.NS') else symbol
                
                tickers_data.append({
                    "symbol": display_symbol,
                    "currency": currency,
                    "price": round(current_price, 2),
                    "change": round(change, 2),
                    "change_pct": round(change_pct, 2),
                    "is_positive": change >= 0
                })
        return tickers_data
    except Exception as e:
        print(f"Error fetching yfinance: {e}")
        return []

def main():
    print("Fetching live market data from yfinance...")
    tickers = fetch_market()
    
    if not tickers:
        print("Warning: Fetch failed, using fallback data.")
        tickers = [
            {"symbol": "AAPL", "currency": "$", "price": 175.25, "change": 1.50, "change_pct": 1.01, "is_positive": True},
            {"symbol": "TSLA", "currency": "$", "price": 180.10, "change": -2.30, "change_pct": -1.26, "is_positive": False},
            {"symbol": "NVDA", "currency": "$", "price": 850.50, "change": 45.20, "change_pct": 5.61, "is_positive": True},
            {"symbol": "RELIANCE", "currency": "₹", "price": 2900.00, "change": 15.00, "change_pct": 0.52, "is_positive": True},
            {"symbol": "TCS", "currency": "₹", "price": 3800.00, "change": -25.00, "change_pct": -0.65, "is_positive": False}
        ]
        
    data = {"tickers": tickers}
    
    out_path = os.path.join(os.path.dirname(__file__), '..', 'assets', 'market.json')
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully wrote {len(tickers)} tickers to assets/market.json")

if __name__ == "__main__":
    main()
