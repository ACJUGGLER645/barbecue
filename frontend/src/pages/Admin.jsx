import { useState, useEffect } from 'react';
import { adminService, getUploadUrl } from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Admin() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchUsers();
    }, [currentUser, navigate]);

    const fetchUsers = async () => {
        try {
            const res = await adminService.getUsers();
            setUsers(res.data.users);
        } catch (err) {
            setError('Error al cargar usuarios');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await adminService.approveUser(id);
            fetchUsers();
            alert('Usuario aprobado exitosamente');
        } catch (err) {
            alert('Error al aprobar usuario');
        }
    };

    const handleDisable = async (id) => {
        try {
            await adminService.disableUser(id);
            fetchUsers();
            alert('Usuario deshabilitado exitosamente');
        } catch (err) {
            alert('Error al deshabilitar usuario');
        }
    };

    const handleDelete = async (id, name) => {
        if (!confirm(`¿Estás seguro de ELIMINAR a ${name}? Esta acción no se puede deshacer.`)) {
            return;
        }
        try {
            await adminService.deleteUser(id);
            fetchUsers();
            setSelectedUser(null);
            alert('Usuario eliminado permanentemente');
        } catch (err) {
            alert('Error al eliminar usuario');
        }
    };

    const handleChangeRole = async (id, newRole) => {
        try {
            await adminService.changeRole(id, newRole);
            fetchUsers();
            alert(`Rol actualizado a ${newRole}`);
        } catch (err) {
            alert('Error al cambiar rol');
        }
    };

    const handleRowClick = (user) => {
        setSelectedUser(selectedUser?.id === user.id ? null : user);
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem' }}></i>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <section className="hero-section" style={{ minHeight: 'calc(100vh - 80px)', alignItems: 'flex-start', paddingTop: '4rem' }}>
                <div className="glass-card admin-container">
                    <div className="admin-header">
                        <h1 className="section-title admin-title">Panel de Administración</h1>
                        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                            <i className="fas fa-users"></i> Total Usuarios: {users.length}
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">{error}</div>
                    )}

                    <div className="admin-layout">
                        <div className="list-section">
                            <div className="table-responsive">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Usuario</th>
                                            <th>Rol</th>
                                            <th>Email</th>
                                            <th>Estado</th>
                                            <th>Comprobante</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map((u) => (
                                            <tr
                                                key={u.id}
                                                id={`row-${u.id}`}
                                                className={`user-row ${selectedUser?.id === u.id ? 'selected-row' : ''}`}
                                                onClick={() => handleRowClick(u)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                <td>#{u.id}</td>
                                                <td>
                                                    <div style={{ fontWeight: 600 }}>{u.name}</div>
                                                </td>
                                                <td>
                                                    <select
                                                        className="role-select"
                                                        value={u.role}
                                                        onChange={(e) => {
                                                            e.stopPropagation();
                                                            handleChangeRole(u.id, e.target.value);
                                                        }}
                                                        onClick={(e) => e.stopPropagation()}
                                                        disabled={u.id === currentUser.id}
                                                    >
                                                        <option value="user">Usuario</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </td>
                                                <td>{u.email}</td>
                                                <td>
                                                    {u.is_enabled ? (
                                                        <span className="status-badge status-active">
                                                            <i className="fas fa-check-circle"></i> Activo
                                                        </span>
                                                    ) : (
                                                        <span className="status-badge status-pending">
                                                            <i className="fas fa-clock"></i> Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {u.payment_proof ? (
                                                        <button
                                                            className="btn-action btn-view"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRowClick(u);
                                                            }}
                                                        >
                                                            <i className="fas fa-eye"></i> Ver
                                                        </button>
                                                    ) : (
                                                        <span style={{ opacity: 0.5 }}>—</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        {!u.is_enabled ? (
                                                            <button
                                                                className="btn-action btn-approve"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleApprove(u.id);
                                                                }}
                                                            >
                                                                <i className="fas fa-check"></i> Aprobar
                                                            </button>
                                                        ) : (
                                                            <button
                                                                className="btn-action btn-disable"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDisable(u.id);
                                                                }}
                                                                disabled={u.id === currentUser.id}
                                                            >
                                                                <i className="fas fa-ban"></i> Deshab.
                                                            </button>
                                                        )}
                                                        <button
                                                            className="btn-action btn-disable"
                                                            style={{ background: 'rgba(255, 0, 0, 0.4)', borderColor: 'red', color: 'white' }}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDelete(u.id, u.name);
                                                            }}
                                                            disabled={u.id === currentUser.id}
                                                        >
                                                            <i className="fas fa-trash"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Preview Section */}
                        <div className={`preview-section ${selectedUser ? 'active' : ''}`}>
                            {selectedUser && (
                                <>
                                    <div className="preview-header">
                                        <h3>Comprobante: {selectedUser.name}</h3>
                                        <button className="btn-close-preview" onClick={() => setSelectedUser(null)}>
                                            <i className="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <div className="preview-content">
                                        {selectedUser.payment_proof ? (
                                            <img
                                                src={getUploadUrl(selectedUser.payment_proof)}
                                                alt="Comprobante de pago"
                                                style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain', borderRadius: '4px' }}
                                            />
                                        ) : (
                                            <div style={{ textAlign: 'center', padding: '2rem' }}>
                                                <i className="fas fa-image" style={{ fontSize: '3rem', opacity: 0.3, marginBottom: '1rem' }}></i>
                                                <p>Sin comprobante</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                </div>
            </section>
        </>
    );
}
