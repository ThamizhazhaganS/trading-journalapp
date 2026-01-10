import { useState, useEffect } from 'react';
import TradingViewChart from '../components/TradingViewChart';
import { Search, Plus, X, Star, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import styles from './Market.module.css';

const DEFAULT_WATCHLIST = ['NASDAQ:AAPL', 'NASDAQ:TSLA', 'FX:EURUSD', 'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'];

export default function Market() {
    // State
    const [symbol, setSymbol] = useState('NASDAQ:AAPL');
    const [inputVal, setInputVal] = useState('');

    // Watchlist State
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem('market_watchlist');
        return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    });
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [quickAddVal, setQuickAddVal] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Price Simulation (Hybrid: Real feel)
    const [prices, setPrices] = useState({});

    // Effect to start price simulation
    useEffect(() => {
        // Initial random prices based on symbol type (mock)
        const initialPrices = {};
        watchlist.forEach(sym => {
            let base = 100;
            if (sym.includes('BTC') || sym.includes('btc')) base = 45000;
            if (sym.includes('ETH') || sym.includes('eth')) base = 2800;
            if (sym.includes('EUR') || sym.includes('eur')) base = 1.05;
            if (sym.includes('JPY') || sym.includes('jpy')) base = 145;
            if (sym.includes('AAPL')) base = 180;
            if (sym.includes('TSLA')) base = 250;
            if (sym.includes('NVDA')) base = 500;

            initialPrices[sym] = {
                price: base,
                change: (Math.random() * 2 - 1).toFixed(2),
                color: Math.random() > 0.5 ? 'text-success' : 'text-danger'
            };
        });
        setPrices(initialPrices);

        // Live Ticker Effect
        const interval = setInterval(() => {
            setPrices(prev => {
                const next = { ...prev };
                watchlist.forEach(key => {
                    if (!next[key]) return;
                    const volatility = key.toUpperCase().includes('EUR') || key.toUpperCase().includes('JPY') ? 0.0001 : (next[key].price * 0.0005);
                    const move = (Math.random() - 0.5) * volatility;
                    const newPrice = next[key].price + move;
                    const newChange = (parseFloat(next[key].change) + (Math.random() * 0.1 - 0.05)).toFixed(2);

                    next[key] = {
                        price: newPrice,
                        change: newChange,
                        color: newChange >= 0 ? 'text-success' : 'text-danger'
                    };
                });
                return next;
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [watchlist]);

    useEffect(() => {
        localStorage.setItem('market_watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    // Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        const newSym = inputVal.trim().toUpperCase();
        if (newSym) {
            setSymbol(newSym);
            setInputVal('');
        }
    };

    const addToWatchlist = (symToAdd) => {
        const target = symToAdd || symbol; // Use argument or current symbol
        if (!watchlist.includes(target)) {
            setWatchlist([...watchlist, target]);
        }
    };

    const handleQuickAdd = (e) => {
        e.preventDefault();
        if (quickAddVal.trim()) {
            addToWatchlist(quickAddVal.trim().toUpperCase());
            setQuickAddVal('');
        }
    };

    const removeFromWatchlist = (sym, e) => {
        e.stopPropagation();
        setWatchlist(watchlist.filter(s => s !== sym));
    };

    return (
        <div className={`${styles.marketPage} ${isFullScreen ? styles.fullScreenMode : ''}`}>
            {/* Header / Controls - Hidden in Full Screen */}
            {!isFullScreen && (
                <header className={styles.header}>
                    <div className={styles.controls}>
                        <h2>Market Analysis</h2>
                        <button
                            className={styles.actionBtn}
                            onClick={() => setSidebarOpen(!isSidebarOpen)}
                            title={isSidebarOpen ? "Hide Watchlist" : "Show Watchlist"}
                        >
                            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className={styles.searchBar}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Load Chart (e.g. BTCUSD)..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                        />
                        <button type="submit" className={styles.actionBtn}>Load</button>
                    </form>

                    <button
                        className={styles.actionBtn}
                        onClick={() => setIsFullScreen(true)}
                        title="Enter Full Screen"
                        style={{ marginLeft: '1rem' }}
                    >
                        <Maximize2 size={16} />
                    </button>
                </header>
            )}

            {/* Main Terminal Grid */}
            <div className={styles.marketGrid}>

                {/* 1. Watchlist Sidebar - Hidden in Full Screen */}
                {!isFullScreen && isSidebarOpen && (
                    <div className={styles.watchlistPanel}>
                        <div className={styles.panelHeader}>
                            <span>Watchlist</span>
                            <span className={styles.count}>{watchlist.length}</span>
                        </div>

                        {/* Quick Add Form inside Sidebar */}
                        <form onSubmit={handleQuickAdd} className={styles.quickAddForm}>
                            <input
                                type="text"
                                placeholder="Add Symbol..."
                                value={quickAddVal}
                                onChange={(e) => setQuickAddVal(e.target.value)}
                            />
                            <button type="submit"><Plus size={14} /></button>
                        </form>

                        <div className={styles.symbolList}>
                            {watchlist.map(sym => (
                                <div
                                    key={sym}
                                    className={`${styles.symbolItem} ${symbol === sym ? styles.symbolActive : ''}`}
                                    onClick={() => setSymbol(sym)}
                                >
                                    <div className={styles.itemMain}>
                                        <span className={styles.symbolName}>{sym.split(':')[1] || sym}</span>
                                        {prices[sym] && (
                                            <div className={styles.itemData}>
                                                <span className={styles.price}>{prices[sym].price.toFixed(sym.toUpperCase().includes('EUR') || sym.toUpperCase().includes('JPY') ? 4 : 2)}</span>
                                                <span className={`${styles.change} ${prices[sym].change >= 0 ? 'text-success' : 'text-danger'}`}>
                                                    {prices[sym].change > 0 ? '+' : ''}{prices[sym].change}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <button className={styles.removeBtn} onClick={(e) => removeFromWatchlist(sym, e)}>
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2. Main Chart Area */}
                <div className={styles.mainChartArea}>
                    <div className={styles.chartCard} style={isFullScreen ? { borderRadius: 0, border: 'none' } : {}}>
                        <TradingViewChart symbol={symbol} />

                        {/* Float Exit Button only in Full Screen */}
                        {isFullScreen && (
                            <button
                                className={styles.exitFullScreenBtn}
                                onClick={() => setIsFullScreen(false)}
                                title="Exit Full Screen"
                            >
                                <Minimize2 size={24} />
                            </button>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
