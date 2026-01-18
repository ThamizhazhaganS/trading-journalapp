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
        setPrices(prev => {
            const next = { ...prev };
            watchlist.forEach(sym => {
                if (next[sym]) return; // Preservation check

                let base = 100;
                if (sym.includes('BTC') || sym.includes('btc')) base = 45000;
                if (sym.includes('ETH') || sym.includes('eth')) base = 2800;
                if (sym.includes('EUR') || sym.includes('eur')) base = 1.05;
                if (sym.includes('JPY') || sym.includes('jpy')) base = 145;
                if (sym.includes('AAPL')) base = 180;
                if (sym.includes('TSLA')) base = 250;
                if (sym.includes('NVDA')) base = 500;

                next[sym] = {
                    price: base,
                    change: (Math.random() * 2 - 1).toFixed(2),
                    color: Math.random() > 0.5 ? 'text-success' : 'text-danger'
                };
            });
            return next;
        });

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

    // Trade Overlay State
    const [showTradePanel, setShowTradePanel] = useState(false);
    const [tradeParams, setTradeParams] = useState({
        entry: '',
        stopLoss: '',
        type: 'LONG',
    });

    const calculateRR = () => {
        if (!tradeParams.entry || !tradeParams.stopLoss) return null;
        const entry = parseFloat(tradeParams.entry);
        const sl = parseFloat(tradeParams.stopLoss);
        const risk = Math.abs(entry - sl);
        const r2 = tradeParams.type === 'LONG' ? entry + (risk * 2) : entry - (risk * 2);
        return { risk: risk.toFixed(2), target: r2.toFixed(2) };
    };

    const rrData = calculateRR();

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

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            className={`${styles.actionBtn} ${showTradePanel ? styles.activeBtn : ''}`}
                            onClick={() => setShowTradePanel(true)}
                            title="Open Trade Planner"
                            style={{ marginLeft: '1rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)' }}
                        >
                            <Plus size={16} /> New Trade
                        </button>

                        <button
                            className={styles.actionBtn}
                            onClick={() => setIsFullScreen(true)}
                            title="Enter Full Screen"
                        >
                            <Maximize2 size={16} />
                        </button>
                    </div>
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
                <div className={styles.mainChartArea} style={{ position: 'relative' }}>

                    {/* Trade Builder Overlay */}
                    {showTradePanel && (
                        <div className={styles.tradeOverlay}>
                            <div className={styles.overlayHeader}>
                                <h3>Plan Trade: {symbol.split(':')[1]}</h3>
                                <button className={styles.closeOverlayBtn} onClick={() => setShowTradePanel(false)}><X size={18} /></button>
                            </div>

                            <div className={styles.tradeFormGrid}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className={`btn ${tradeParams.type === 'LONG' ? 'btn-primary' : ''}`}
                                        style={{ flex: 1, padding: '0.25rem', fontSize: '0.8rem', opacity: tradeParams.type === 'LONG' ? 1 : 0.5 }}
                                        onClick={() => setTradeParams({ ...tradeParams, type: 'LONG' })}
                                    >LONG</button>
                                    <button
                                        className={`btn ${tradeParams.type === 'SHORT' ? 'btn-danger' : ''}`}
                                        style={{ flex: 1, padding: '0.25rem', fontSize: '0.8rem', opacity: tradeParams.type === 'SHORT' ? 1 : 0.5 }}
                                        onClick={() => setTradeParams({ ...tradeParams, type: 'SHORT' })}
                                    >SHORT</button>
                                </div>

                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Entry Price</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'white' }}
                                        value={tradeParams.entry}
                                        onChange={e => setTradeParams({ ...tradeParams, entry: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stop Loss</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'white' }}
                                        value={tradeParams.stopLoss}
                                        onChange={e => setTradeParams({ ...tradeParams, stopLoss: e.target.value })}
                                    />
                                </div>

                                {rrData && (
                                    <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '6px', fontSize: '0.8rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Risk:</span>
                                            <span style={{ color: '#ef4444' }}>${rrData.risk}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                                            <span>Target (1:2):</span>
                                            <span style={{ color: '#10b981' }}>{rrData.target}</span>
                                        </div>
                                    </div>
                                )}

                                <button className={styles.analyzeBtnOverlay} onClick={() => alert(`Trade Plan Saved for ${symbol}!\nType: ${tradeParams.type}\nEntry: ${tradeParams.entry}\nSL: ${tradeParams.stopLoss}`)}>
                                    Save to Journal
                                </button>
                                <div className={styles.helperText}>Calculates R:R instantly</div>
                            </div>
                        </div>
                    )}

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
