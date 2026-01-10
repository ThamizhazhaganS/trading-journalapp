import { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import styles from './Analytics.module.css';

export default function Analytics() {
    const { trades } = useTrades();
    const [chartType, setChartType] = useState('area');

    // Custom small tooltip style
    const tooltipStyle = {
        backgroundColor: '#181b21',
        border: '1px solid #2d313a',
        borderRadius: '4px',
        padding: '4px 8px',
        fontSize: '11px'
    };

    // Calculate cumulative equity curve
    const data = trades
        .slice()
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .reduce((acc, trade) => {
            const prevEquity = acc.length > 0 ? acc[acc.length - 1].equity : 10000; // Start with 10k dummy equity
            acc.push({
                date: new Date(trade.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                pnl: Number(trade.pnl),
                equity: prevEquity + Number(trade.pnl)
            });
            return acc;
        }, []);

    // 2. Strategy Performance Data
    const strategyData = Object.entries(trades.reduce((acc, trade) => {
        const strat = (trade.strategy || 'Unknown').trim();
        if (!acc[strat]) acc[strat] = { name: strat, pnl: 0, wins: 0, total: 0 };
        acc[strat].pnl += Number(trade.pnl);
        acc[strat].total += 1;
        if (Number(trade.pnl) > 0) acc[strat].wins += 1;
        return acc;
    }, {})).map(([_, val]) => val).sort((a, b) => b.pnl - a.pnl);

    // 3. Emotion Performance Data
    const emotionData = Object.entries(trades.reduce((acc, trade) => {
        const emot = (trade.emotion || 'Neutral').trim();
        if (!acc[emot]) acc[emot] = { name: emot, pnl: 0 };
        acc[emot].pnl += Number(trade.pnl);
        return acc;
    }, {})).map(([_, val]) => val).sort((a, b) => b.pnl - a.pnl);

    // 4. Calendar Heatmap Data (Correctly aligned with weekdays)
    const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const getCalendarData = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const days = [];

        // Add empty padding for days before the 1st of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push({ day: null, index: `pad-${i}` });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = new Date(year, month, i).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            // Find total PnL for this day
            const dailyPnL = trades
                .filter(t => new Date(t.date).getDate() === i && new Date(t.date).getMonth() === month)
                .reduce((sum, t) => sum + Number(t.pnl), 0);

            const hasTrades = trades.some(t => new Date(t.date).getDate() === i && new Date(t.date).getMonth() === month);

            days.push({ day: i, pnl: dailyPnL, active: hasTrades, dateStr, index: `day-${i}` });
        }
        return days;
    };

    const calendarGrid = getCalendarData();

    return (
        <div className={styles.analytics}>
            <header className={styles.header}>
                <h2>Performance Analytics</h2>
            </header>

            <div className={styles.gridTwo}>
                {/* 1. Calendar Heatmap */}
                <div className={styles.card}>
                    <h3>Monthly Heatmap</h3>
                    <div className={styles.calendarGrid}>
                        {/* Weekday Headers */}
                        {WEEKDAYS.map(d => (
                            <div key={d} className={styles.dayHeader}>{d}</div>
                        ))}

                        {/* Calendar Days */}
                        {calendarGrid.map((day) => (
                            day.day ? (
                                <div
                                    key={day.index}
                                    className={`${styles.calendarDay} ${day.active ? (day.pnl >= 0 ? styles.dayWin : styles.dayLoss) : ''}`}
                                    title={`${day.dateStr}: $${day.pnl}`}
                                >
                                    <span className={styles.dayNumber}>{day.day}</span>
                                    {day.active && <span className={styles.dayPnL}>{day.pnl > 0 ? '+' : ''}{day.pnl}</span>}
                                </div>
                            ) : (
                                <div key={day.index} className={styles.emptyDay}></div>
                            )
                        ))}
                    </div>
                </div>

                {/* 2. Equity Curve */}
                <div className={styles.chartCard}>
                    <div className={styles.cardHeaderRow}>
                        <h3>Equity Curve</h3>
                        <select
                            className={styles.chartSelect}
                            value={chartType}
                            onChange={(e) => setChartType(e.target.value)}
                        >
                            <option value="area">Area (Curve)</option>
                            <option value="step">Step Line</option>
                            <option value="bar">Bar (PnL)</option>
                            <option value="composed">Bar + Line</option>
                            <option value="line">Line (Simple)</option>
                        </select>
                    </div>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType === 'area' && (
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(str) => str.split(',')[0]} />
                                    <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                    <Area type="monotone" dataKey="equity" stroke="#2563eb" fillOpacity={1} fill="url(#colorEquity)" />
                                </AreaChart>
                            )}

                            {chartType === 'line' && (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(str) => str.split(',')[0]} />
                                    <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                    <Line type="monotone" dataKey="equity" stroke="#2563eb" strokeWidth={2} dot={false} />
                                </LineChart>
                            )}

                            {chartType === 'step' && (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(str) => str.split(',')[0]} />
                                    <YAxis stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                    <Line type="stepAfter" dataKey="equity" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            )}

                            {chartType === 'bar' && (
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickFormatter={(str) => str.split(',')[0]} />
                                    <YAxis stroke="#9ca3af" fontSize={12} />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                    <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            )}

                            {chartType === 'composed' && (
                                <ComposedChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                    <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} domain={['auto', 'auto']} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                                    <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                    <Legend />
                                    <Area yAxisId="left" type="monotone" dataKey="equity" fill="rgba(37, 99, 235, 0.1)" stroke="#2563eb" />
                                    <Bar yAxisId="right" dataKey="pnl" barSize={20}>
                                        {data.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                        ))}
                                    </Bar>
                                </ComposedChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className={styles.gridTwo}>
                {/* 3. Strategy Bar Chart */}
                <div className={styles.chartCard}>
                    <h3>PnL by Strategy</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={strategyData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" fontSize={12} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                <Bar dataKey="pnl" radius={[0, 4, 4, 0]}>
                                    {strategyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 4. Emotion Bar Chart */}
                <div className={styles.chartCard}>
                    <h3>PnL by Emotion</h3>
                    <div className={styles.chartContainer}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={emotionData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2d313a" />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                                <YAxis stroke="#9ca3af" fontSize={12} />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={tooltipStyle} itemStyle={{ color: '#ededed' }} />
                                <Bar dataKey="pnl" radius={[4, 4, 4, 4]}>
                                    {emotionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? '#10b981' : '#ef4444'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
