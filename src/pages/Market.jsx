import { useState } from 'react';
import TradingViewChart from '../components/TradingViewChart';
import { Search } from 'lucide-react';
import styles from './Market.module.css';

export default function Market() {
    const [symbol, setSymbol] = useState('NASDAQ:AAPL');
    const [inputVal, setInputVal] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        if (inputVal.trim()) {
            setSymbol(inputVal.toUpperCase());
            setInputVal('');
        }
    };

    return (
        <div className={styles.marketPage}>
            <header className={styles.header}>
                <h2>Market Analysis</h2>
                <form onSubmit={handleSearch} className={styles.searchBar}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="text"
                        placeholder="Search Symbol (e.g. BTCUSD, AAPL)"
                        value={inputVal}
                        onChange={(e) => setInputVal(e.target.value)}
                    />
                    <button type="submit">Load Chart</button>
                </form>
            </header>

            <div className={styles.chartContainer}>
                <TradingViewChart symbol={symbol} />
            </div>
        </div>
    );
}
