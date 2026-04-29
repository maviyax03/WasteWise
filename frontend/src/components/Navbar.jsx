import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav style={{
            background: '#0A0F1E',
            borderBottom: '1px solid #1E2D3D',
            padding: '0 2rem',
            height: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            margin: '-8px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>♻️</span>
                <span style={{ color: '#4ADE80', fontWeight: '700', fontSize: '18px' }}>WasteWise</span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
                <Link
                    to="/"
                    style={{
                        color: location.pathname === '/' ? '#4ADE80' : '#778899',
                        textDecoration: 'none',
                        fontWeight: location.pathname === '/' ? '600' : '400'
                    }}>
                    Classify
                </Link>
                <Link
                    to="/stats"
                    style={{
                        color: location.pathname === '/stats' ? '#4ADE80' : '#778899',
                        textDecoration: 'none',
                        fontWeight: location.pathname === '/stats' ? '600' : '400'
                    }}>
                    Dashboard
                </Link>
            </div>
        </nav>
    );
};

export default Navbar;