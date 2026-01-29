
import { useState, useEffect } from 'react';
import TradingViewChart from '../components/TradingViewChart';
import { Search, Plus, X, Star, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { useTrades } from '../context/TradeContext';
import styles from './Market.module.css';

const DEFAULT_WATCHLIST = ['NASDAQ:AAPL', 'NASDAQ:TSLA', 'FX:EURUSD', 'BINANCE:BTCUSDT', 'BINANCE:ETHUSDT'];

export default function Market() {
    // 1. Context Sync
    const { setActiveAsset } = useTrades();

    // 2. Core State
    const [symbol, setSymbol] = useState('NASDAQ:AAPL');
    const [inputVal, setInputVal] = useState('');
    const [watchlist, setWatchlist] = useState(() => {
        const saved = localStorage.getItem('market_watchlist');
        return saved ? JSON.parse(saved) : DEFAULT_WATCHLIST;
    });
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [quickAddVal, setQuickAddVal] = useState('');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [prices, setPrices] = useState({});

    // 3. Trade Planner Overlay State
    const [showTradePanel, setShowTradePanel] = useState(false);
    const [tradeParams, setTradeParams] = useState({
        entry: '',
        stopLoss: '',
        type: 'LONG',
    });

    // 4. Price Simulation (Keeping your logic)
    useEffect(() => {
        setPrices(prev => {
            const next = { ...prev };
            watchlist.forEach(sym => {
                if (next[sym]) return;
                let base = 100;
                if (sym.includes('BTC')) base = 48000;
                if (sym.includes('ETH')) base = 2600;
                if (sym.includes('EUR')) base = 1.08;
                if (sym.includes('TSLA')) base = 190;
                next[sym] = { price: base, change: (Math.random() * 2 - 1).toFixed(2) };
            });
            return next;
        });

        const interval = setInterval(() => {
            setPrices(prev => {
                const next = { ...prev };
                watchlist.forEach(key => {
                    if (!next[key]) return;
                    const vol = key.toUpperCase().includes('EUR') || key.toUpperCase().includes('JPY') ? 0.0001 : (next[key].price * 0.0005);
                    const move = (Math.random() - 0.5) * vol;
                    const newPrice = next[key].price + move;
                    const newChange = (parseFloat(next[key].change) + (Math.random() * 0.1 - 0.05)).toFixed(2);
                    next[key] = { price: newPrice, change: newChange };
                });
                return next;
            });
        }, 2000);
        return () => clearInterval(interval);
    }, [watchlist]);

    useEffect(() => {
        localStorage.setItem('market_watchlist', JSON.stringify(watchlist));
    }, [watchlist]);

    // 5. Broadcast to Calculator (Sync Feature)
    useEffect(() => {
        const detectType = (sym) => {
            if (sym.includes('BTC') || sym.includes('ETH')) return 'CRYPTO';
            if (sym.includes('FX:') || sym.includes('USD') && sym.length === 6) return 'FOREX';
            return 'STOCK';
        };

        setActiveAsset({
            symbol: symbol,
            price: prices[symbol]?.price || 0,
            type: detectType(symbol),
            lastUpdated: Date.now()
        });
    }, [symbol]);

    // 6. Handlers
    const handleSearch = (e) => {
        e.preventDefault();
        const newSym = inputVal.trim().toUpperCase();
        if (newSym) {
            setSymbol(newSym);
            setInputVal('');
        }
    };

    const addToWatchlist = (s) => {
        const target = s || symbol;
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
            {/* 7. Header (Restored with all controls) */}
            {!isFullScreen && (
                <header className={styles.header}>
                    <div className={styles.controls}>
                        <h2>Market Terminal</h2>
                        <button className={styles.actionBtn} onClick={() => setSidebarOpen(!isSidebarOpen)}>
                            {isSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </button>
                    </div>

                    <form onSubmit={handleSearch} className={styles.searchBar}>
                        <Search size={16} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Load Chart..."
                            value={inputVal}
                            onChange={(e) => setInputVal(e.target.value)}
                        />
                    </form>

                    <div className={styles.headerActions}>
                        <button
                            className={`${styles.actionBtn} ${showTradePanel ? styles.activeBtn : ''}`}
                            onClick={() => setShowTradePanel(!showTradePanel)}
                            title="Trade Planner"
                        >
                            <Plus size={16} /> New Trade
                        </button>
                        <button className={styles.actionBtn} onClick={() => addToWatchlist(symbol)} title="Watchlist">
                            <Star size={16} fill={watchlist.includes(symbol) ? "var(--accent-primary)" : "none"} stroke={watchlist.includes(symbol) ? "var(--accent-primary)" : "currentColor"} />
                        </button>
                        <button className={styles.actionBtn} onClick={() => setIsFullScreen(true)}>
                            <Maximize2 size={16} />
                        </button>
                    </div>
                </header>
            )}

            {/* 8. Main Terminal Grid (Restored Sidebar & Layout) */}
            <div className={styles.marketGrid}>
                {!isFullScreen && isSidebarOpen && (
                    <div className={styles.watchlistPanel}>
                        <div className={styles.panelHeader}>
                            Watchlist <span>{watchlist.length}</span>
                        </div>

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
                                                <span className={styles.price}>{prices[sym].price.toFixed(sym.includes('FX') ? 4 : 2)}</span>
                                                <span style={{ color: parseFloat(prices[sym].change) >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                                                    {prices[sym].change}%
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

                {/* 9. Main Chart Area with Trade Overlay (Restored Full Feature) */}
                <div className={styles.mainChartArea} style={{ position: 'relative' }}>
                    {showTradePanel && (
                        <div className={styles.tradeOverlay}>
                            <div className={styles.overlayHeader}>
                                <h3>Plan Trade: {symbol.split(':')[1]}</h3>
                                <button className={styles.closeOverlayBtn} onClick={() => setShowTradePanel(false)}><X size={18} /></button>
                            </div>

                            <div className={styles.tradeFormGrid}>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: tradeParams.type === 'LONG' ? '#10b981' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setTradeParams({ ...tradeParams, type: 'LONG' })}
                                    >LONG</button>
                                    <button
                                        style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: 'none', background: tradeParams.type === 'SHORT' ? '#ef4444' : 'rgba(255,255,255,0.05)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                                        onClick={() => setTradeParams({ ...tradeParams, type: 'SHORT' })}
                                    >SHORT</button>
                                </div>

                                <div className={styles.inputGroupCol}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Entry Price</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'white' }}
                                        value={tradeParams.entry}
                                        onChange={e => setTradeParams({ ...tradeParams, entry: e.target.value })}
                                    />
                                </div>
                                <div className={styles.inputGroupCol}>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Stop Loss</label>
                                    <input
                                        type="number"
                                        style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-app)', color: 'white' }}
                                        value={tradeParams.stopLoss}
                                        onChange={e => setTradeParams({ ...tradeParams, stopLoss: e.target.value })}
                                    />
                                </div>

                                {rrData && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span>Risk Value:</span>
                                            <span style={{ color: '#ef4444' }}>${rrData.risk}</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem' }}>
                                            <span>1:2 Target:</span>
                                            <span style={{ color: '#10b981' }}>{rrData.target}</span>
                                        </div>
                                    </div>
                                )}

                                <button className={styles.analyzeBtnOverlay} onClick={() => {
                                    alert(`Plan Created!\nEntry: ${tradeParams.entry}\nSL: ${tradeParams.stopLoss}`);
                                    setShowTradePanel(false);
                                }}>
                                    Save Draft
                                </button>
                            </div>
                        </div>
                    )}

                    <div className={styles.chartCard}>
                        <TradingViewChart symbol={symbol} />
                        {isFullScreen && (
                            <button className={styles.exitFullScreenBtn} onClick={() => setIsFullScreen(false)}><Minimize2 size={24} /></button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
