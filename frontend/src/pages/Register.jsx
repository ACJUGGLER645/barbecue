import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import Navbar from '../components/Navbar';

export default function Register() {
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: ''
    });
    const [file, setFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validations
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!file) {
            setError('Debes subir un comprobante de pago');
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();
            data.append('email', formData.email);
            data.append('name', formData.name);
            data.append('password', formData.password);
            data.append('payment_proof', file);

            await authService.register(data);
            setSuccess('Registro exitoso. Tu cuenta será habilitada tras verificar el pago. Recibirás un correo de confirmación.');

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Error al registrarse');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <section className="hero-section" style={{ minHeight: '100vh', alignItems: 'flex-start', paddingTop: '4rem' }}>
                <div className="glass-card" style={{ maxWidth: '600px', width: '100%' }}>
                    <h1 className="section-title">Registrarse</h1>
                    <p style={{ textAlign: 'center', opacity: 0.8, marginBottom: '2rem' }}>
                        Completa el formulario y sube tu comprobante de pago
                    </p>

                    {error && (
                        <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
                            <i className="fas fa-exclamation-circle"></i> {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
                            <i className="fas fa-check-circle"></i> {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label htmlFor="name">
                                <i className="fas fa-user"></i> Nombre Completo
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                placeholder="Tu nombre"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">
                                <i className="fas fa-envelope"></i> Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
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
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="form-input"
                                minLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">
                                <i className="fas fa-lock"></i> Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="form-input"
                                minLength="6"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="payment_proof">
                                <i className="fas fa-file-image"></i> Comprobante de Pago
                            </label>
                            <input
                                type="file"
                                id="payment_proof"
                                onChange={handleFileChange}
                                required
                                accept="image/*"
                                className="form-input"
                                style={{ padding: '0.75rem' }}
                            />
                            <small style={{ opacity: 0.7, fontSize: '0.85rem' }}>
                                Formatos permitidos: PNG, JPG, JPEG, GIF, WEBP (máx. 16MB)
                            </small>
                        </div>

                        <button
                            type="submit"
                            className="cta-btn cta-primary"
                            disabled={loading}
                            style={{ width: '100%', marginTop: '1rem' }}
                        >
                            {loading ? (
                                <><i className="fas fa-spinner fa-spin"></i> Registrando...</>
                            ) : (
                                <><i className="fas fa-user-plus"></i> Registrarse</>
                            )}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.5rem', opacity: 0.8 }}>
                        ¿Ya tienes cuenta? <Link to="/login" className="highlight">Inicia sesión aquí</Link>
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
