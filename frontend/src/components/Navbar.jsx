import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        document.body.classList.toggle('light-mode', savedTheme === 'light');
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.body.classList.toggle('light-mode', newTheme === 'light');
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="glass-nav">
            <div className="nav-container">
                <Link to="/" className="logo">
                    Dev Barbecue <span className="highlight">ETITC</span>
                </Link>
                <ul className="nav-links">
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <li><Link to="/admin" className="nav-link">Admin Panel</Link></li>
                            )}
                            {user.is_enabled && (
                                <li><Link to="/matrix" className="nav-link">Ubicación</Link></li>
                            )}
                            <li>
                                <button id="theme-toggle" className="theme-btn" onClick={toggleTheme}>
                                    <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                                </button>
                            </li>
                            <li className="user-menu">
                                <span className="nav-link">Hola, {user.name}</span>
                            </li>
                            <li>
                                <button onClick={handleLogout} className="nav-link" style={{ color: '#ff6b6b', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    Salir
                                </button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li><Link to="/login" className="nav-link">Iniciar Sesión</Link></li>
                            <li><Link to="/register" className="cta-btn">Registrarse</Link></li>
                            <li>
                                <button id="theme-toggle" className="theme-btn" onClick={toggleTheme}>
                                    <i className={`fas fa-${theme === 'dark' ? 'sun' : 'moon'}`}></i>
                                </button>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
}
