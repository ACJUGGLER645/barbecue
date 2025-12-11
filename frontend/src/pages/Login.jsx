import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <section className="hero-section" style={{ minHeight: '100vh', alignItems: 'center' }}>
                <div className="glass-card" style={{ maxWidth: '500px', width: '100%' }}>
                    <h1 className="section-title">Iniciar Sesión</h1>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="tu@email.com"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">
                                <i className="fas fa-lock"></i> Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="form-input"
                            />
                        </div>

                        <button
                            type="submit"
                            className="cta-btn cta-primary"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? (
                                <><i className="fas fa-spinner fa-spin"></i> Iniciando...</>
                            ) : (
                                <><i className="fas fa-sign-in-alt"></i> Iniciar Sesión</>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.8 }}>
                        ¿No tienes cuenta? <Link to="/register" className="highlight">Regístrate aquí</Link>
                    </p>
                </div>

                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </section>
        </>
    );
}
