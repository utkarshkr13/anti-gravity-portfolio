import yfinance as yf
import json
import os

SYMBOLS = [
    # ==================== 60 US STOCKS & CRYPTOCURRENCIES ====================
    # Big Tech (Magnificent Seven)
    "AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "META", "AMZN",
    # Semiconductors & Hardware
    "AMD", "INTC", "QCOM", "AVGO", "TSM", "ARM", "MU", 
    # Enterprise Software, Cloud & SaaS
    "NFLX", "ORCL", "IBM", "CRM", "ADBE", "PLTR", "NOW", "SNOW", "PANW", "INTU", "WDAY",
    # Banking & Payments
    "JPM", "V", "MA", "BAC", "WFC", "GS", "MS", "PYPL", "COIN",
    # Consumer Giants & Retailers
    "WMT", "DIS", "UBER", "KO", "PEP", "NKE", "COST", "SBUX", "TGT",
    # Industrials, Defense & Energy
    "CAT", "GE", "HON", "NOC", "LMT", "DE", "FDX",
    # Cryptocurrencies
    "BTC-USD", "ETH-USD", "SOL-USD", "BNB-USD", "ADA-USD", "XRP-USD", "DOGE-USD", "DOT-USD", "LINK-USD",

    # ==================== 60 INDIAN BLUE-CHIP STOCKS ====================
    # Conglomerate & IT Services
    "RELIANCE.NS", "TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS", "LTIM.NS",
    # Private & Public Banking / NBFCs
    "HDFCBANK.NS", "ICICIBANK.NS", "AXISBANK.NS", "KOTAKBANK.NS", "SBIN.NS", "BAJFINANCE.NS", "BAJAJFINSV.NS", "LICI.NS", "RECLTD.NS",
    # Automotive & Mobility
    "MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS", "EICHERMOT.NS", "TVSMOTOR.NS",
    # FMCG & Consumer Durables
    "ITC.NS", "HINDUNILVR.NS", "ASIANPAINT.NS", "NESTLEIND.NS", "BRITANNIA.NS", "COLPAL.NS", "DABUR.NS", "GODREJCP.NS", "TATACONSUM.NS",
    # Healthcare & Pharma
    "SUNPHARMA.NS", "CIPLA.NS", "DRREDDY.NS", "APOLLOHOSP.NS", "DIVISLAB.NS", "LUPIN.NS", "MAXHEALTH.NS",
    # Infra, Utilities, Metal & Mining
    "LT.NS", "ADANIENT.NS", "ADANIPORTS.NS", "POWERGRID.NS", "NTPC.NS", "TATASTEEL.NS", "JINDALSTEL.NS", "JSWSTEEL.NS", "HINDALCO.NS", "GRASIM.NS", "COALINDIA.NS",
    # Telecom, Transport, Defence & Public Services
    "BHARTIARTL.NS", "ONGC.NS", "BPCL.NS", "IOC.NS", "GAIL.NS", "INDIGO.NS", "DLF.NS", "HAL.NS", "BEL.NS", "ZOMATO.NS"
]

def fetch_market():
    tickers_data = []
    try:
        # Batch download 1-day pricing to get opening and current closing
        data = yf.download(SYMBOLS, period="1d", group_by="ticker", progress=False)
        
        # Determine columns structure (batch returns multi-index columns on success)
        has_multi_index = hasattr(data.columns, 'levels')
        
        for symbol in SYMBOLS:
            try:
                # Safely extract ticker dataframe from batch result
                if has_multi_index:
                    if symbol not in data.columns.levels[0]:
                        continue
                    ticker_df = data[symbol]
                else:
                    ticker_df = data
                
                # Clean and drop NaN values to handle weekend gaps between crypto & stock indices seamlessly
                clean_df = ticker_df.dropna(subset=['Open', 'Close'])
                if clean_df.empty:
                    continue
                    
                import math
                
                open_price = float(clean_df['Open'].iloc[0])
                current_price = float(clean_df['Close'].iloc[-1])
                
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
            except Exception as inner_e:
                # Silently skip single symbol parse errors to preserve high-res aggregate data
                continue
                
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
