import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Matrix() {
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || !user.is_enabled) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user || !user.is_enabled) {
        return null;
    }

    return (
        <>
            <Navbar />
            <section className="hero-section matrix-section" style={{ minHeight: '100vh', background: '#000' }}>
                <div className="glass-card" style={{ maxWidth: '800px', background: 'rgba(0, 20, 0, 0.9)', border: '1px solid #0f0' }}>
                    <h1 className="section-title" style={{ color: '#0f0', textShadow: '0 0 10px #0f0' }}>
                        <i className="fas fa-map-marker-alt"></i> Ubicación Secreta
                    </h1>

                    <div className="matrix-content" style={{ color: '#0f0' }}>
                        <div className="location-info" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ color: '#0f0', marginBottom: '1rem' }}>
                                <i className="fas fa-home"></i> Conjunto Residencial Centenari
                            </h2>
                            <p style={{ fontSize: '1.1rem', lineHeight: 1.8 }}>
                                <strong>Dirección:</strong> Conjunto Residencial Centenari<br />
                                <strong>Ciudad:</strong> Bogotá, Colombia<br />
                                <strong>Fecha:</strong> 15 de Enero, 2025<br />
                                <strong>Hora:</strong> 2:00 PM - 8:00 PM
                            </p>
                        </div>

                        <div className="map-container" style={{ marginTop: '2rem', borderRadius: '12px', overflow: 'hidden', border: '2px solid #0f0' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.8!2d-74.05!3d4.65!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwMzknMDAuMCJOIDc0wrAwMycwMC4wIlc!5e0!3m2!1sen!2sco!4v1234567890"
                                width="100%"
                                height="400"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                        </div>

                        <div className="matrix-instructions" style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(0, 255, 0, 0.1)', borderRadius: '8px', border: '1px solid #0f0' }}>
                            <h3 style={{ color: '#0f0', marginBottom: '1rem' }}>
                                <i className="fas fa-info-circle"></i> Instrucciones
                            </h3>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <i className="fas fa-check"></i> Llega puntual a las 2:00 PM
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <i className="fas fa-check"></i> Trae tu mejor actitud y ganas de compartir
                                </li>
                                <li style={{ marginBottom: '0.5rem' }}>
                                    <i className="fas fa-check"></i> Si tienes alguna duda, contacta a Rafael o Alejandro
                                </li>
                            </ul>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <a
                                href="/"
                                className="cta-btn cta-primary"
                                style={{ background: 'rgba(0, 255, 0, 0.2)', border: '2px solid #0f0', color: '#0f0' }}
                            >
                                <i className="fas fa-arrow-left"></i> Volver al Inicio
                            </a>
                        </div>
                    </div>
                </div>

                {/* Matrix Rain Effect (opcional) */}
                <div className="matrix-rain" style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none',
                    zIndex: 0,
                    opacity: 0.1
                }}>
                    {/* Aquí podrías añadir un efecto de lluvia de Matrix con canvas */}
                </div>
            </section>
        </>
    );
}
