import { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { Plus, X, Trash2 } from 'lucide-react';
import styles from './Journal.module.css';
import './JournalModal.css';

export default function Journal() {
    const { trades, addTrade, deleteTrade } = useTrades();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        symbol: '',
        date: new Date().toISOString().split('T')[0], // Default to today
        type: 'LONG',
        entryPrice: '',
        exitPrice: '',
        quantity: '',
        strategy: '',
        emotion: '',
        assetClass: 'Crypto',
        marketTrend: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const pnl = (Number(formData.exitPrice) - Number(formData.entryPrice)) * Number(formData.quantity) * (formData.type === 'LONG' ? 1 : -1);

        addTrade({
            ...formData,
            pnl: pnl.toFixed(2),
            entryPrice: Number(formData.entryPrice),
            exitPrice: Number(formData.exitPrice),
            quantity: Number(formData.quantity)
        });
        setIsAdding(false);
        setFormData({
            symbol: '',
            date: new Date().toISOString().split('T')[0],
            type: 'LONG',
            entryPrice: '',
            exitPrice: '',
            quantity: '',
            strategy: '',
            emotion: '',
            assetClass: 'Crypto',
            marketTrend: '',
            notes: ''
        });
    };

    const [showImport, setShowImport] = useState(false);
    const [csvContent, setCsvContent] = useState('');

    const handleImport = () => {
        if (!csvContent.trim()) return;

        const lines = csvContent.trim().split('\n');
        const newTrades = [];

        // Simple CSV Parser: Expects Date, Symbol, Type, Entry, Exit, Qty (comma or tab separated)
        // Skip header if 'Symbol' or 'Date' is in first line
        const startIndex = (lines[0].toLowerCase().includes('symbol') || lines[0].toLowerCase().includes('date')) ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].replace(/\r/g, '').replace(/\t/g, ','); // normalized
            const cols = line.split(',');

            if (cols.length >= 3) {
                // Try to map columns intelligently or assume fixed order: 
                // Date [0], Symbol [1], Type [2], Entry [3], Exit [4], Qty [5]
                const rawType = cols[2] ? cols[2].toUpperCase() : 'LONG';
                const type = rawType.includes('SHORT') ? 'SHORT' : 'LONG';
                const entry = parseFloat(cols[3]) || 0;
                const exit = parseFloat(cols[4]) || 0;
                const qty = parseFloat(cols[5]) || 1;
                const pnl = (exit - entry) * qty * (type === 'LONG' ? 1 : -1);

                newTrades.push({
                    date: cols[0] || new Date().toISOString(),
                    symbol: cols[1] || 'UNKNOWN',
                    type: type,
                    entryPrice: entry,
                    exitPrice: exit,
                    quantity: qty,
                    pnl: pnl.toFixed(2),
                    assetClass: 'Imported',
                    status: pnl >= 0 ? 'WIN' : 'LOSS'
                });
            }
        }

        // Batch add - utilizing context one by one for now as context might not support batch
        newTrades.forEach(t => addTrade(t));
        setShowImport(false);
        setCsvContent('');
    };

    return (
        <div className={styles.journal}>
            <header className={styles.header}>
                <h2>Trade Journal</h2>
                <div className={styles.headerActions}>
                    <button className="btn btn-secondary" onClick={() => setShowImport(!showImport)} style={{ marginRight: '0.5rem', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        Import CSV
                    </button>
                    <button className="btn" onClick={() => setIsAdding(!isAdding)}>
                        {isAdding ? <X size={20} /> : <Plus size={20} />}
                        {isAdding ? 'Cancel' : 'New Trade'}
                    </button>
                </div>
            </header>

            {/* Import Modal */}
            {showImport && (
                <div className={styles.importModal}>
                    <div className={styles.modalContent}>
                        <h3>Import Trades (CSV)</h3>
                        <p>Paste your CSV data below. Format: <code>Date, Symbol, Type, Entry, Exit, Qty</code></p>
                        <textarea
                            rows="5"
                            placeholder="2024-03-01, BTCUSD, LONG, 60000, 62000, 0.5"
                            value={csvContent}
                            onChange={(e) => setCsvContent(e.target.value)}
                        />
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowImport(false)}>Cancel</button>
                            <button className="btn" onClick={handleImport}>Import Data</button>
                        </div>
                    </div>
                </div>
            )}

            {isAdding && (
                <form onSubmit={handleSubmit} className={styles.formCard}>
                    <div className={styles.formGrid}>
                        <div className={styles.field}>
                            <label>Symbol</label>
                            <input
                                required
                                placeholder="e.g. BTC/USD"
                                value={formData.symbol}
                                onChange={e => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Date</label>
                            <input
                                type="date"
                                required
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="LONG">Long</option>
                                <option value="SHORT">Short</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Entry Price</label>
                            <input
                                type="number" step="any" required
                                value={formData.entryPrice}
                                onChange={e => setFormData({ ...formData, entryPrice: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Exit Price</label>
                            <input
                                type="number" step="any" required
                                value={formData.exitPrice}
                                onChange={e => setFormData({ ...formData, exitPrice: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Quantity</label>
                            <input
                                type="number" step="any" required
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Strategy</label>
                            <input
                                placeholder="e.g. Breakout"
                                value={formData.strategy}
                                onChange={e => setFormData({ ...formData, strategy: e.target.value })}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Emotion</label>
                            <select
                                value={formData.emotion}
                                onChange={e => setFormData({ ...formData, emotion: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="Confident">Confident</option>
                                <option value="FOMO">FOMO</option>
                                <option value="Fearful">Fearful</option>
                                <option value="Greedy">Greedy</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Revenge">Revenge</option>
                                <option value="Frustrated">Frustrated</option>
                                <option value="Calm">Calm</option>
                                <option value="Excited">Excited</option>
                                <option value="Hopeful">Hopeful</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Asset Class</label>
                            <select
                                value={formData.assetClass}
                                onChange={e => setFormData({ ...formData, assetClass: e.target.value })}
                            >
                                <option value="Crypto">Crypto</option>
                                <option value="Forex">Forex</option>
                                <option value="Stocks">Stocks</option>
                                <option value="Indices">Indices</option>
                                <option value="Commodities">Commodities</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label>Market Trend</label>
                            <select
                                value={formData.marketTrend}
                                onChange={e => setFormData({ ...formData, marketTrend: e.target.value })}
                            >
                                <option value="">Select...</option>
                                <option value="Strong Uptrend">Strong Uptrend</option>
                                <option value="Uptrend">Uptrend</option>
                                <option value="Ranging">Ranging</option>
                                <option value="Downtrend">Downtrend</option>
                                <option value="Strong Downtrend">Strong Downtrend</option>
                            </select>
                        </div>
                    </div>
                    <div className={styles.field}>
                        <label>Notes <span style={{ fontSize: '0.7em', color: 'var(--text-secondary)' }}>(AI Voice enabled)</span></label>
                        <div style={{ position: 'relative' }}>
                            <textarea
                                rows="3"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Click the mic and speak..."
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    if (!('webkitSpeechRecognition' in window)) {
                                        alert('Voice input is not supported in this browser. Try Chrome.');
                                        return;
                                    }
                                    const recognition = new window.webkitSpeechRecognition();
                                    recognition.continuous = false;
                                    recognition.lang = 'en-US';
                                    recognition.interimResults = false;

                                    recognition.onstart = () => {
                                        const btn = document.getElementById('voiceBtn');
                                        if (btn) btn.style.color = '#ef4444'; // Recording color
                                    };

                                    recognition.onend = () => {
                                        const btn = document.getElementById('voiceBtn');
                                        if (btn) btn.style.color = 'var(--text-secondary)';
                                    };

                                    recognition.onresult = (event) => {
                                        const transcript = event.results[0][0].transcript;
                                        setFormData(prev => {
                                            // Simple AI: Detect emotion from keywords
                                            let detectedEmotion = prev.emotion;
                                            const lowerText = transcript.toLowerCase();
                                            if (lowerText.includes('scared') || lowerText.includes('fear')) detectedEmotion = 'Fearful';
                                            if (lowerText.includes('angry') || lowerText.includes('mad')) detectedEmotion = 'Revenge';
                                            if (lowerText.includes('happy') || lowerText.includes('great')) detectedEmotion = 'Excited';
                                            if (lowerText.includes('missed') || lowerText.includes('wish')) detectedEmotion = 'FOMO';

                                            return {
                                                ...prev,
                                                notes: prev.notes ? prev.notes + ' ' + transcript : transcript,
                                                emotion: detectedEmotion || prev.emotion
                                            };
                                        });
                                    };

                                    recognition.start();
                                }}
                                id="voiceBtn"
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    bottom: '10px',
                                    background: 'transparent',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: 'var(--text-secondary)'
                                }}
                                title="Click to speak"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                            </button>
                        </div>
                    </div>
                    <button type="submit" className="btn" style={{ marginTop: '1rem', width: '100%' }}>Save Trade</button>
                </form>
            )}

            {/* Desktop Table */}
            <div className={styles.tableContainer}>
                <table className={styles.tradeTable}>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Symbol</th>
                            <th>Type</th>
                            <th>Setup</th>
                            <th>Entry</th>
                            <th>Exit</th>
                            <th>PnL</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map(trade => (
                            <tr key={trade.id}>
                                <td className={styles.tdDate}>{new Date(trade.date).toLocaleDateString()}</td>
                                <td className={styles.tdSymbol}>
                                    {trade.symbol}
                                    <span className={styles.assetBadge}>{trade.assetClass}</span>
                                </td>
                                <td><span className={`tag ${trade.type === 'LONG' ? 'text-success' : 'text-danger'}`}>{trade.type}</span></td>
                                <td className={styles.tdStrategy}>{trade.strategy || '-'}</td>
                                <td>{trade.entryPrice}</td>
                                <td>{trade.exitPrice}</td>
                                <td className={Number(trade.pnl) >= 0 ? 'text-success' : 'text-danger'}>
                                    {Number(trade.pnl) >= 0 ? '+' : ''}${trade.pnl}
                                </td>
                                <td>
                                    <button className={styles.iconBtn} onClick={() => deleteTrade(trade.id)}>
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {trades.length === 0 && (
                            <tr>
                                <td colSpan="8" className={styles.emptyCell}>No trades recorded yet.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Cards (Visible only on small screens via CSS) */}
            <div className={styles.mobileList}>
                {trades.map(trade => (
                    <div key={trade.id} className={styles.tradeItem}>
                        <div className={styles.tradeHeader}>
                            <div className={styles.tradeTitle}>
                                <strong>{trade.symbol}</strong>
                                <span className={`tag ${trade.type === 'LONG' ? 'text-success' : 'text-danger'}`}>{trade.type}</span>
                            </div>
                            <button className={styles.deleteBtn} onClick={() => deleteTrade(trade.id)}>
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className={styles.tradeDetails}>
                            <div>Entry: {trade.entryPrice}</div>
                            <div>Exit: {trade.exitPrice}</div>
                            <div>Qty: {trade.quantity}</div>
                        </div>
                        <div className={styles.tradeFooter}>
                            <span className={Number(trade.pnl) >= 0 ? 'text-success' : 'text-danger'}>
                                {Number(trade.pnl) >= 0 ? '+' : ''}{trade.pnl} PnL
                            </span>
                            <span className={styles.date}>{new Date(trade.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
