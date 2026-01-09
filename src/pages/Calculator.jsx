import { useState } from 'react';
import { Calculator as CalcIcon, RefreshCw, AlertCircle } from 'lucide-react';
import styles from './Calculator.module.css';

export default function Calculator() {
    const [balance, setBalance] = useState(10000);
    const [riskPercent, setRiskPercent] = useState(1);
    const [stopLoss, setStopLoss] = useState(50);
    const [entryPrice, setEntryPrice] = useState(0);

    // Calculations
    const riskAmount = balance * (riskPercent / 100);
    const positionSize = stopLoss > 0 ? (riskAmount / stopLoss) : 0;

    // Advanced: If Entry Price is provided, calculate Target prices
    const rewardRatio = 2; // 1:2 R:R default
    const takeProfitAmount = stopLoss * rewardRatio;

    // Formatting
    const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
    const formatNumber = (val) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(val);

    return (
        <div className={styles.calculatorPage}>
            <header className={styles.header}>
                <h2>Risk Calculator</h2>
                <span className={styles.subtitle}>Position Sizing & Risk Management</span>
            </header>

            <div className={styles.grid}>
                {/* Input Section */}
                <div className={styles.card}>
                    <h3>Parameters</h3>
                    <div className={styles.formGroup}>
                        <label>Account Balance ($)</label>
                        <input
                            type="number"
                            value={balance}
                            onChange={(e) => setBalance(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Risk per Trade (%)</label>
                        <input
                            type="number"
                            value={riskPercent}
                            onChange={(e) => setRiskPercent(Number(e.target.value))}
                            step="0.1"
                        />
                        <div className={styles.rangeLabels}>
                            <span onClick={() => setRiskPercent(0.5)}>0.5%</span>
                            <span onClick={() => setRiskPercent(1)}>1%</span>
                            <span onClick={() => setRiskPercent(2)}>2%</span>
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Stop Loss Distance ($ or Pips)</label>
                        <input
                            type="number"
                            value={stopLoss}
                            onChange={(e) => setStopLoss(Number(e.target.value))}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Entry Price (Optional)</label>
                        <input
                            type="number"
                            value={entryPrice}
                            onChange={(e) => setEntryPrice(Number(e.target.value))}
                            placeholder="For TP calculations"
                        />
                    </div>
                </div>

                {/* Results Section */}
                <div className={`${styles.card} ${styles.resultsCard}`}>
                    <h3>Calculated Position</h3>

                    <div className={styles.resultRow}>
                        <span className={styles.resultLabel}>Risk Amount</span>
                        <span className={styles.resultValueDanger}>{formatCurrency(riskAmount)}</span>
                    </div>

                    <div className={styles.resultRowMain}>
                        <span className={styles.resultLabel}>Position Size (Units)</span>
                        <span className={styles.resultValueBig}>{formatNumber(positionSize)}</span>
                    </div>

                    {entryPrice > 0 && (
                        <div className={styles.targetsContainer}>
                            <div className={styles.targetRow}>
                                <span>Stop Loss Price</span>
                                <span className="text-danger">{formatNumber(entryPrice - stopLoss)}</span>
                            </div>
                            <div className={styles.targetRow}>
                                <span>Take Profit (1:2)</span>
                                <span className="text-success">{formatNumber(entryPrice + takeProfitAmount)}</span>
                            </div>
                        </div>
                    )}

                    <div className={styles.infoBox}>
                        <AlertCircle size={16} />
                        <p>Never risk more than you can afford to lose. Recommended risk is 1-2% per trade.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
