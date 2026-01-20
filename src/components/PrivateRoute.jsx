
import { Navigate, useLocation } from 'react-router-dom';
import { useTrades } from '../context/TradeContext';

export default function PrivateRoute({ children }) {
    const { user, loading } = useTrades();
    const location = useLocation();

    if (loading) {
        return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-app)', color: 'var(--text-secondary)' }}>Loading...</div>;
    }

    if (!user) {
        // Redirect to login but save the attempted location
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
}
