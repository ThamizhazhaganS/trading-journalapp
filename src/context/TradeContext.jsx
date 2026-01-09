import { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TradeContext = createContext();

const getDummyData = () => {
  const today = new Date();

  // Helper to get a date n days ago
  const getDate = (daysAgo, hours = 10, minutes = 0) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: '1',
      symbol: 'BTC/USD',
      type: 'LONG',
      entryPrice: 42000,
      exitPrice: 43500,
      quantity: 0.5,
      date: getDate(6), // 6 days ago
      notes: 'Breakout retest',
      strategy: 'Breakout',
      emotion: 'Confident',
      assetClass: 'Crypto',
      marketTrend: 'Uptrend',
      status: 'WIN',
      pnl: 750,
    },
    {
      id: '2',
      symbol: 'ETH/USD',
      type: 'SHORT',
      entryPrice: 2400,
      exitPrice: 2450,
      quantity: 5,
      date: getDate(5, 9, 15),
      notes: 'Resistance rejection failed',
      strategy: 'Reversal',
      emotion: 'Fearful',
      assetClass: 'Crypto',
      marketTrend: 'Ranging',
      status: 'LOSS',
      pnl: -250,
    },
    {
      id: '3',
      symbol: 'EUR/USD',
      type: 'LONG',
      entryPrice: 1.0850,
      exitPrice: 1.0890,
      quantity: 10000,
      date: getDate(4, 11, 0),
      notes: 'News event scalp',
      strategy: 'Scalp',
      emotion: 'FOMO',
      assetClass: 'Forex',
      marketTrend: 'Uptrend',
      status: 'WIN',
      pnl: 40,
    },
    {
      id: '4',
      symbol: 'XAU/USD',
      type: 'LONG',
      entryPrice: 2150.50,
      exitPrice: 2165.00,
      quantity: 10,
      date: getDate(3, 10, 0),
      notes: 'Safe haven play',
      strategy: 'Trend Following',
      emotion: 'Neutral',
      assetClass: 'Commodities',
      marketTrend: 'uptrend',
      status: 'WIN',
      pnl: 145,
    },
    {
      id: '5',
      symbol: 'SENSEX',
      type: 'SHORT',
      entryPrice: 73500,
      exitPrice: 73200,
      quantity: 1,
      date: getDate(2, 9, 30),
      notes: 'Gap fill trade',
      strategy: 'Reversal',
      emotion: 'Greedy',
      assetClass: 'Indices',
      marketTrend: 'Downtrend',
      status: 'WIN',
      pnl: 300,
    },
    {
      id: '6',
      symbol: 'GBP/JPY',
      type: 'LONG',
      entryPrice: 188.20,
      exitPrice: 187.90,
      quantity: 5000,
      date: getDate(2, 15, 45),
      notes: 'Stopped out on volatility',
      strategy: 'Breakout',
      emotion: 'Frustrated',
      assetClass: 'Forex',
      marketTrend: 'Ranging',
      status: 'LOSS',
      pnl: -140,
    },
    {
      id: '7',
      symbol: 'CRUDEOIL',
      type: 'LONG',
      entryPrice: 78.50,
      exitPrice: 80.10,
      quantity: 100,
      date: getDate(1, 11, 20), // Yesterday
      notes: 'Supply shock news',
      strategy: 'News',
      emotion: 'Confident',
      assetClass: 'Commodities',
      marketTrend: 'Strong Uptrend',
      status: 'WIN',
      pnl: 160,
    },
    {
      id: '8',
      symbol: 'NIFTY50',
      type: 'LONG',
      entryPrice: 22100,
      exitPrice: 22250,
      quantity: 2,
      date: getDate(0, 13, 10), // Today
      notes: 'Support bounce',
      strategy: 'Support/Resistance',
      emotion: 'Calm',
      assetClass: 'Indices',
      marketTrend: 'Uptrend',
      status: 'WIN',
      pnl: 300,
    }
  ];
};

export function TradeProvider({ children }) {
  const [trades, setTrades] = useState(() => {
    const saved = localStorage.getItem('trades');
    return saved ? JSON.parse(saved) : getDummyData();
  });

  useEffect(() => {
    localStorage.setItem('trades', JSON.stringify(trades));
  }, [trades]);

  const addTrade = (trade) => {
    const newTrade = {
      ...trade,
      id: uuidv4(),
      date: trade.date ? new Date(trade.date).toISOString() : new Date().toISOString(),
      status: Number(trade.pnl) >= 0 ? 'WIN' : 'LOSS' // Simple auto-status based on PnL
    };
    setTrades([newTrade, ...trades]);
  };

  const deleteTrade = (id) => {
    setTrades(trades.filter(t => t.id !== id));
  };

  const resetData = () => {
    const freshData = getDummyData();
    localStorage.setItem('trades', JSON.stringify(freshData));
    setTrades(freshData);
  };

  const getStats = () => {
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === 'WIN').length;
    const winRate = totalTrades ? ((wins / totalTrades) * 100).toFixed(1) : 0;
    const totalPnL = trades.reduce((acc, t) => acc + Number(t.pnl), 0);

    return {
      totalTrades,
      winRate,
      totalPnL: totalPnL.toFixed(2),
      wins,
      losses: totalTrades - wins
    };
  };

  return (
    <TradeContext.Provider value={{ trades, addTrade, deleteTrade, resetData, getStats }}>
      {children}
    </TradeContext.Provider>
  );
}

export const useTrades = () => useContext(TradeContext);
