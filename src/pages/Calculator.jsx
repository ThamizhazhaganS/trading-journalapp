import { useState, useEffect, useRef } from 'react';
import { useTrades } from '../context/TradeContext';
import { Settings, Target, Shield, AlertCircle, TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';
import styles from './Calculator.module.css';

export default function Calculator() {
    const { user, activeAsset } = useTrades();
    const lastUpdateTimestamp = useRef(0);

    // State
    const [mode, setMode] = useState('CRYPTO');
    const [symbol, setSymbol] = useState('BINANCE:BTCUSDT');
    const [accountBalance, setAccountBalance] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const [entryPrice, setEntryPrice] = useState(45000);
    const [stopLossPrice, setStopLossPrice] = useState(44500);
    const [leverage, setLeverage] = useState(1);

    const currency = user?.user_metadata?.currency || 'USD';
    const tradingRules = user?.user_metadata?.trading_rules || '';

    // Smart Sync: Only trigger when a NEW selection is made in Market
    useEffect(() => {
        if (activeAsset && activeAsset.lastUpdated > lastUpdateTimestamp.current) {
            lastUpdateTimestamp.current = activeAsset.lastUpdated;
            setSymbol(activeAsset.symbol);
            setMode(activeAsset.type);

            if (activeAsset.price > 0) {
                const p = Number(activeAsset.price.toFixed(4));
                setEntryPrice(p);
                // Logical SL gap
                const gap = activeAsset.type === 'CRYPTO' ? 0.015 : 0.005;
                setStopLossPrice(Number((p * (1 - gap)).toFixed(4)));
            }
        }
    }, [activeAsset]);

    useEffect(() => {
        if (user?.user_metadata?.initial_capital) {
            setAccountBalance(Number(user.user_metadata.initial_capital));
        }
    }, [user]);

    // Calculations
    const riskAmount = accountBalance * (riskPercent / 100);
    let positionSizeUnits = 0;
    let positionSizeUSD = 0;
    let stopLossPercent = 0;
    let bias = 'LONG';

    if (mode === 'CRYPTO' || mode === 'STOCK') {
        bias = entryPrice > stopLossPrice ? 'LONG' : 'SHORT';
        const diff = Math.abs(entryPrice - stopLossPrice);
        stopLossPercent = entryPrice > 0 ? (diff / entryPrice) * 100 : 0;
        if (diff > 0) {
            positionSizeUnits = riskAmount / diff;
            positionSizeUSD = positionSizeUnits * entryPrice;
        }
    } else {
        const isJPY = entryPrice > 50;
        const pips = Math.abs(entryPrice - stopLossPrice) * (isJPY ? 100 : 10000);
        if (pips > 0) {
            const lots = riskAmount / (pips * 10);
            positionSizeUnits = lots;
            positionSizeUSD = lots * 100000;
        }
        bias = entryPrice > stopLossPrice ? 'LONG' : 'SHORT';
        stopLossPercent = entryPrice > 0 ? (Math.abs(entryPrice - stopLossPrice) / entryPrice) * 100 : 0;
    }

    const margin = positionSizeUSD / leverage;
    const liqPrice = bias === 'LONG' ? entryPrice * (1 - (1 / leverage)) : entryPrice * (1 + (1 / leverage));

    // Helpers
    const getSymbol = (c) => ({ 'USD': '$', 'INR': '₹', 'EUR': '€', 'GBP': '£' }[c] || '$');
    const formatCurr = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(v);
    const formatNum = (v, d = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: d }).format(v);

    return (
        <div className={styles.calculatorPage}>
            <header className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2>Position Calculator</h2>
                    <div className={styles.syncBadge}>
                        <div className={styles.pulse}></div>
                        Live: <strong>{symbol.split(':')[1] || symbol}</strong>
                    </div>
                </div>
                <div className={styles.modeToggle}>
                    <button className={mode === 'CRYPTO' ? styles.activeMode : ''} onClick={() => setMode('CRYPTO')}>Crypto</button>
                    <button className={mode === 'STOCK' ? styles.activeMode : ''} onClick={() => setMode('STOCK')}>Stock</button>
                    <button className={mode === 'FOREX' ? styles.activeMode : ''} onClick={() => setMode('FOREX')}>Forex</button>
                    <button className={styles.marketLink} onClick={() => window.location.href = '/market'}>
                        Analyze <Maximize2 size={14} />
                    </button>
                </div>
            </header>

            <div className={styles.mainLayout}>
                <div className={styles.calcGrid}>
                    <div className={styles.mainCol}>
                        <div className={styles.inputCard}>
                            <div className={styles.sectionTitle}><Settings size={18} /> Setup</div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Balance</label>
                                    <div className={styles.inputWrapper}>
                                        <span className={styles.prefix}>{getSymbol(currency)}</span>
                                        <input type="number" value={accountBalance} onChange={e => setAccountBalance(Number(e.target.value))} />
                                    </div>
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Risk %</label>
                                    <div className={styles.inputWrapper}>
                                        <input type="number" value={riskPercent} onChange={e => setRiskPercent(Number(e.target.value))} step="0.5" />
                                        <span className={styles.suffix}>%</span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.leverageContainer}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                                    Leverage: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{leverage}x</span>
                                </label>
                                <input type="range" min="1" max="100" value={leverage} onChange={e => setLeverage(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--accent-primary)', marginTop: '0.5rem' }} />
                                <div className={styles.leverageTags}>
                                    {[1, 10, 20, 50, 100].map(v => (
                                        <span key={v} onClick={() => setLeverage(v)} className={leverage === v ? styles.activeTag : ''}>{v}x</span>
                                    ))}
                                </div>
                            </div>

                            <div style={{ height: '1px', background: 'var(--border)', margin: '0.5rem 0' }}></div>

                            <div className={styles.sectionTitle}><Target size={18} /> Plan: {symbol.split(':')[1] || symbol}</div>
                            <div className={styles.row}>
                                <div className={styles.formGroup}>
                                    <label>Entry</label>
                                    <input type="number" value={entryPrice} onChange={e => setEntryPrice(Number(e.target.value))} step="any" />
                                </div>
                                <div className={styles.formGroup}>
                                    <label>Stop Loss</label>
                                    <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(Number(e.target.value))} step="any" />
                                </div>
                            </div>
                            <div className={`${styles.biasBadge} ${bias === 'LONG' ? styles.biasLong : styles.biasShort}`}>
                                {bias === 'LONG' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                                {bias} ({stopLossPercent.toFixed(2)}% Risk)
                            </div>
                        </div>

                        {tradingRules && (
                            <div className={styles.rulesCard}>
                                <div className={styles.sectionTitle}><Shield size={18} /> Mantra</div>
                                <div className={styles.rulesContent}>
                                    {tradingRules.split('\n').map((r, i) => (
                                        <div key={i} className={styles.ruleItem}><div className={styles.bullet}></div>{r}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={styles.resultsCard}>
                        <div className={styles.mainResult}>
                            <div className={styles.mainResultLabel}>Size</div>
                            <div className={styles.mainResultValue}>
                                {mode === 'FOREX' ? <span>{formatNum(positionSizeUnits, 2)} <small>Lots</small></span> : <span>{formatNum(positionSizeUnits, 4)} <small>Units</small></span>}
                            </div>
                            <div className={styles.mainResultSub}>Value: {formatCurr(positionSizeUSD)}</div>
                        </div>

                        <div className={styles.statsGrid}>
                            <div className={styles.statBox}>
                                <span className={styles.statLabel}>Risk</span>
                                <span className={styles.statValueDanger}>{formatCurr(riskAmount)}</span>
                            </div>
                            <div className={styles.statBox}>
                                <span className={styles.statLabel}>Margin</span>
                                <span className={styles.statValue}>{formatCurr(margin)}</span>
                            </div>
                        </div>

                        <div className={styles.liquidationBox}>
                            <div className={styles.liqHeader}><Shield size={16} /> Liquidation</div>
                            <div className={styles.liqValue}>{formatCurr(liqPrice)}</div>
                            <div className={styles.liqNote}>
                                <AlertCircle size={12} /> {((Math.abs(entryPrice - liqPrice) / entryPrice) * 100).toFixed(2)}% move to liq.
                            </div>
                        </div>

                        <div className={styles.targetsList}>
                            <h4>RR Targets</h4>
                            <div className={styles.targetRow}><span>1:2 RR</span><span className={styles.targetVal}>{formatNum(entryPrice + (Math.abs(entryPrice - stopLossPrice) * (bias === 'LONG' ? 2 : -2)))}</span></div>
                            <div className={styles.targetRow}><span>1:3 RR</span><span className={styles.targetVal}>{formatNum(entryPrice + (Math.abs(entryPrice - stopLossPrice) * (bias === 'LONG' ? 3 : -3)))}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
