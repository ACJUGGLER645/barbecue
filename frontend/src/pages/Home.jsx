import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { user } = useAuth();

    return (
        <>
            <Navbar />

            {/* Hero Section */}
            <section className="hero-section">
                <div className="glass-card hero-content">
                    <h1 className="hero-title">
                        Dev Barbecue <span className="highlight">2025</span>
                    </h1>
                    <p className="hero-subtitle">
                        El evento tech más esperado del año en ETITC
                    </p>
                    <p className="hero-description">
                        Únete a nosotros para una jornada inolvidable de código, networking y diversión.
                        {!user && ' ¡Regístrate ahora y asegura tu lugar!'}
                    </p>
                    {!user && (
                        <div className="hero-cta">
                            <a href="/register" className="cta-btn cta-primary">
                                <i className="fas fa-rocket"></i> Registrarse Ahora
                            </a>
                            <a href="/login" className="cta-btn cta-secondary">
                                <i className="fas fa-sign-in-alt"></i> Ya tengo cuenta
                            </a>
                        </div>
                    )}
                    {user && !user.is_enabled && (
                        <div className="alert alert-warning">
                            <i className="fas fa-clock"></i> Tu cuenta está pendiente de aprobación. Te notificaremos por correo cuando sea activada.
                        </div>
                    )}
                </div>

                {/* Background Shapes */}
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </section>

            {/* Details Section */}
            <section className="details-section">
                <div className="glass-card">
                    <h2 className="section-title">📅 Detalles del Evento</h2>
                    <div className="details-grid">
                        <div className="detail-item">
                            <i className="fas fa-calendar-alt"></i>
                            <h3>Fecha</h3>
                            <p>15 de Enero, 2025</p>
                        </div>
                        <div className="detail-item">
                            <i className="fas fa-clock"></i>
                            <h3>Hora</h3>
                            <p>2:00 PM - 8:00 PM</p>
                        </div>
                        <div className="detail-item">
                            <i className="fas fa-map-marker-alt"></i>
                            <h3>Ubicación</h3>
                            <p>{user && user.is_enabled ? 'Ver en sección Matrix' : 'Revelada al aprobar'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Budget Section */}
            <section className="budget-section">
                <div className="glass-card">
                    <h2 className="section-title">💰 Presupuesto del Evento</h2>
                    <div className="table-responsive">
                        <table>
                            <thead>
                                <tr>
                                    <th>Concepto</th>
                                    <th>Precio</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr><td>🍖 Carne (Res y Cerdo)</td><td>$150.000</td></tr>
                                <tr><td>🥗 Ensaladas y Vegetales</td><td>$50.000</td></tr>
                                <tr><td>🍞 Pan y Arepas</td><td>$30.000</td></tr>
                                <tr><td>🥤 Bebidas (Gaseosas y Agua)</td><td>$40.000</td></tr>
                                <tr><td>🍺 Cerveza</td><td>$80.000</td></tr>
                                <tr><td>🧊 Hielo</td><td>$10.000</td></tr>
                                <tr><td>🌿 Chimichurri</td><td>$15.000</td></tr>
                                <tr><td>🍴 Platos, Vasos, Cubiertos</td><td>$25.000</td></tr>
                                <tr><td>🎵 Equipo de Sonido</td><td>$50.000</td></tr>
                                <tr><td>🎮 Actividades y Juegos</td><td>$30.000</td></tr>
                                <tr><td>🔥 Carbón y Leña</td><td>$20.000</td></tr>
                                <tr><td><strong>TOTAL</strong></td><td><strong>$500.000</strong></td></tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="budget-note">
                        <strong>Costo por persona:</strong> $25.000 (estimado para 20 personas)
                    </p>
                </div>
            </section>

            {/* Payment Section */}
            <section className="payment-section">
                <div className="glass-card">
                    <h2 className="section-title">💳 Métodos de Pago</h2>
                    <div className="payment-info">
                        <div className="payment-method">
                            <h3><i className="fas fa-mobile-alt"></i> Nequi</h3>
                            <p><strong>Rafael Andres Guzman</strong></p>
                            <p className="phone-number">
                                <a href="https://wa.me/573024232284" target="_blank" rel="noopener noreferrer">
                                    302 423 2284
                                </a>
                            </p>
                        </div>
                        <div className="qr-code">
                            <img src="/qr_nequi.png" alt="QR Nequi" />
                            <p>Escanea para pagar</p>
                        </div>
                    </div>
                    <p className="payment-note">
                        <i className="fas fa-info-circle"></i> Después de pagar, regístrate y sube tu comprobante para ser aprobado.
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <p>&copy; 2025 Dev Barbecue ETITC. Todos los derechos reservados.</p>
                    <div className="footer-links">
                        <p>Contacto: Rafael (302 423 2284) | Alejandro (310 481 2234)</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
