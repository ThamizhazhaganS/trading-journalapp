import { useState } from 'react';
import { Calculator as CalcIcon, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Target, Shield, Settings } from 'lucide-react';
import styles from './Calculator.module.css';

export default function Calculator() {
    // Mode: Simple, Advanced, Crypto, Forex
    const [mode, setMode] = useState('CRYPTO'); // CRYPTO | FOREX | SIMPLE

    // Inputs
    const [accountBalance, setAccountBalance] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const [entryPrice, setEntryPrice] = useState(45000);
    const [stopLossPrice, setStopLossPrice] = useState(44500);
    const [leverage, setLeverage] = useState(1);

    // Derived Inputs for Forex
    const [pipSize, setPipSize] = useState(10); // Standard Lot 10$ per pip roughly, simplified

    // Calculations
    const riskAmount = accountBalance * (riskPercent / 100);

    let positionSizeUnits = 0;
    let positionSizeUSD = 0;
    let stopLossPercent = 0;
    let bias = 'LONG';

    if (mode === 'CRYPTO' || mode === 'SIMPLE') {
        // Calculate Direction
        bias = entryPrice > stopLossPrice ? 'LONG' : 'SHORT';
        const priceDiff = Math.abs(entryPrice - stopLossPrice);
        stopLossPercent = (priceDiff / entryPrice) * 100;

        // Position Size = Risk Amount / (Entry - SL per unit)
        // If Short: Risk / (SL - Entry) -> same magnitude
        if (priceDiff > 0) {
            positionSizeUnits = riskAmount / priceDiff;
            positionSizeUSD = positionSizeUnits * entryPrice;
        }
    } else if (mode === 'FOREX') {
        // Forex Logic (Simplified for standard lots)
        // Risk = Lots * Pips * PipValue
        const pipsRisked = Math.abs(entryPrice - stopLossPrice) * 10000; // Assuming 4 decimal pair
        if (pipsRisked > 0) {
            // Standard Lot = 100,000 units. 1 pip = $10.
            // Lots = Risk / (Pips * 10)
            const lots = riskAmount / (pipsRisked * 10);
            positionSizeUnits = lots; // Display in Lots
        }
    }

    // Leverage Handling
    const marginRequired = positionSizeUSD / leverage;
    const liquidationPrice = bias === 'LONG'
        ? entryPrice * (1 - (1 / leverage))
        : entryPrice * (1 + (1 / leverage));

    // R:R Scenarios
    const r2Target = bias === 'LONG' ? entryPrice + (Math.abs(entryPrice - stopLossPrice) * 2) : entryPrice - (Math.abs(entryPrice - stopLossPrice) * 2);
    const r3Target = bias === 'LONG' ? entryPrice + (Math.abs(entryPrice - stopLossPrice) * 3) : entryPrice - (Math.abs(entryPrice - stopLossPrice) * 3);


    // Render Helpers
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatNumber = (val, dec = 2) => new Intl.NumberFormat('en-US', { maximumFractionDigits: dec }).format(val);

    return (
        <div className={styles.calculatorPage}>
            <header className={styles.header}>
                <div>
                    <h2>Smart Risk Manager</h2>
                    <span className={styles.subtitle}>Professional Position Sizing & Leverage Logic</span>
                </div>
                <div className={styles.modeToggle}>
                    <button className={mode === 'CRYPTO' ? styles.activeMode : ''} onClick={() => setMode('CRYPTO')}>Crypto</button>
                    <button className={mode === 'FOREX' ? styles.activeMode : ''} onClick={() => setMode('FOREX')}>Forex</button>
                    {/* <button className={mode === 'SIMPLE' ? styles.activeMode : ''} onClick={() => setMode('SIMPLE')}>Simple</button> */}
                </div>
            </header>

            <div className={styles.grid}>

                {/* 1. Configuration Panel */}
                <div className={styles.inputCard}>
                    <div className={styles.sectionTitle}>
                        <Settings size={18} /> Setup
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Account Balance</label>
                            <div className={styles.inputWrapper}>
                                <span className={styles.prefix}>$</span>
                                <input type="number" value={accountBalance} onChange={e => setAccountBalance(Number(e.target.value))} />
                            </div>
                        </div>
                        <div className={styles.formGroup}>
                            <label>Risk (%)</label>
                            <div className={styles.inputWrapper}>
                                <input type="number" value={riskPercent} onChange={e => setRiskPercent(Number(e.target.value))} step="0.5" />
                                <span className={styles.suffix}>%</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.leverageContainer}>
                        <label>Leverage: <span className={styles.highlightHighlight}>{leverage}x</span></label>
                        <input
                            type="range"
                            min="1" max="100"
                            value={leverage}
                            onChange={e => setLeverage(Number(e.target.value))}
                            className={styles.slider}
                        />
                        <div className={styles.leverageTags}>
                            <span onClick={() => setLeverage(1)}>1x</span>
                            <span onClick={() => setLeverage(5)}>5x</span>
                            <span onClick={() => setLeverage(10)}>10x</span>
                            <span onClick={() => setLeverage(20)}>20x</span>
                            <span onClick={() => setLeverage(50)}>50x</span>
                            <span onClick={() => setLeverage(100)}>100x</span>
                        </div>
                    </div>

                    <div className={styles.divider}></div>

                    <div className={styles.sectionTitle}>
                        <Target size={18} /> Trade Plan
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Entry Price</label>
                            <input type="number" value={entryPrice} onChange={e => setEntryPrice(Number(e.target.value))} />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Stop Loss</label>
                            <input type="number" value={stopLossPrice} onChange={e => setStopLossPrice(Number(e.target.value))} />
                        </div>
                    </div>

                    <div className={`${styles.biasBadge} ${bias === 'LONG' ? styles.biasLong : styles.biasShort}`}>
                        {bias === 'LONG' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {bias} Setup Identified ({stopLossPercent.toFixed(2)}% Risk Distance)
                    </div>

                </div>


                {/* 2. Results Panel */}
                <div className={styles.resultsCard}>
                    <div className={styles.mainResult}>
                        <div className={styles.mainResultLabel}>Recommended Position Size</div>
                        <div className={styles.mainResultValue}>
                            {mode === 'FOREX' ? (
                                <span>{formatNumber(positionSizeUnits, 2)} <small>Lots</small></span>
                            ) : (
                                <span>{formatNumber(positionSizeUnits, 4)} <small>Units</small></span>
                            )}
                        </div>
                        <div className={styles.mainResultSub}>
                            Total Value: {formatCurrency(positionSizeUSD)}
                        </div>
                    </div>

                    <div className={styles.statsGrid}>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>Risk Amount ($)</span>
                            <span className={styles.statValueDanger}>{formatCurrency(riskAmount)}</span>
                        </div>
                        <div className={styles.statBox}>
                            <span className={styles.statLabel}>Margin Required</span>
                            <span className={styles.statValue}>{formatCurrency(marginRequired)}</span>
                        </div>
                    </div>

                    <div className={styles.liquidationBox}>
                        <div className={styles.liqHeader}>
                            <Shield size={16} /> Liquidation Price (Est.)
                        </div>
                        <div className={styles.liqValue}>{formatCurrency(liquidationPrice)}</div>
                        <div className={styles.liqNote}>
                            {((Math.abs(entryPrice - liquidationPrice) / entryPrice) * 100).toFixed(2)}% move to liq
                        </div>
                    </div>

                    <div className={styles.targetsList}>
                        <h4>Risk : Reward Targets</h4>
                        <div className={styles.targetRow}>
                            <span>Target 1 (1:2)</span>
                            <span className={styles.targetVal}>{formatNumber(r2Target)} <small>(+${formatNumber(riskAmount * 2)})</small></span>
                        </div>
                        <div className={styles.targetRow}>
                            <span>Target 2 (1:3)</span>
                            <span className={styles.targetVal}>{formatNumber(r3Target)} <small>(+${formatNumber(riskAmount * 3)})</small></span>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
