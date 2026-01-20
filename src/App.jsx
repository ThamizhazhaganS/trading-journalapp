import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Analytics from './pages/Analytics';
import Market from './pages/Market';
import Calculator from './pages/Calculator';
import Login from './pages/Login';
import PrivateRoute from './components/PrivateRoute';
import { TradeProvider } from './context/TradeContext';

function App() {
  return (
    <TradeProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="journal" element={<Journal />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="market" element={<Market />} />
          <Route path="calculator" element={<Calculator />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </TradeProvider>
  );
}

export default App;
