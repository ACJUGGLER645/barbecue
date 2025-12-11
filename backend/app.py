import os
from flask import Flask, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_mail import Mail, Message
from dotenv import load_dotenv
from config import Config
from models import db, User

load_dotenv()

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app, origins=app.config['CORS_ORIGINS'], supports_credentials=True)
mail = Mail(app)

# Ensure directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

def send_status_email(user, action):
    """Sends an email notification to the user about their account status."""
    if not app.config['MAIL_USERNAME']:
        print("Mail not configured, skipping email.")
        return

    subject = ""
    body = ""
    
    if action == 'approved':
        subject = "¡Tu cuenta en Dev Barbecue ha sido APROBADA!"
        body = f"""Hola {user.name},
        
Nos complace informarte que tu pago ha sido verificado y tu cuenta ha sido habilitada.
Ya puedes iniciar sesión y acceder a todo el contenido, incluyendo la ubicación secreta de los eventos.

¡Te esperamos!
Equipo Dev Barbecue ETITC"""
    elif action == 'disabled':
        subject = "AVISO: Tu cuenta en Dev Barbecue ha sido deshabilitada"
        body = f"""Hola {user.name},
        
Te informamos que tu cuenta ha sido deshabilitada temporalmente por un administrador.
Si crees que esto es un error, por favor contacta con soporte.

Atentamente,
Equipo Dev Barbecue ETITC"""
    elif action == 'registered':
        subject = "Registro Recibido - Dev Barbecue"
        body = f"""Hola {user.name},

Hemos recibido tu solicitud de registro y tu comprobante de pago.
Un administrador revisará la información pronto. Te llegará otro correo cuando tu cuenta sea aprobada.

Gracias por registrarte.
Equipo Dev Barbecue ETITC"""

    try:
        msg = Message(subject, recipients=[user.email], body=body)
        mail.send(msg)
        print(f"Email sent to {user.email}")
    except Exception as e:
        print(f"Error sending email: {e}")

def notify_admins_new_user(new_user):
    """Sends an email to all admins about a new user registration."""
    if not app.config['MAIL_USERNAME']:
        return

    with app.app_context():
        admins = User.query.filter_by(role='admin').all()
        admin_emails = [admin.email for admin in admins]
        
        if not admin_emails:
            return

        subject = f"Nuevo Registro: {new_user.name}"
        body = f"""Hola Admin,

Un nuevo usuario se ha registrado y espera aprobación:

Nombre: {new_user.name}
Email: {new_user.email}

Por favor ingresa al panel de administración para verificar el comprobante de pago y aprobar la cuenta.
    """

        try:
            msg = Message(subject, recipients=admin_emails, body=body)
            mail.send(msg)
            print(f"Notification sent to admins: {admin_emails}")
        except Exception as e:
            print(f"Error sending admin notification: {e}")

# ==================== AUTH ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        # Get form data
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        
        # Validate
        if not all([email, name, password]):
            return jsonify({'error': 'Todos los campos son requeridos'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=email).first():
            return jsonify({'error': 'El email ya está registrado'}), 400
        
        # Handle file upload
        if 'payment_proof' not in request.files:
            return jsonify({'error': 'Debes subir un comprobante de pago'}), 400
            
        file = request.files['payment_proof']
        if file.filename == '':
            return jsonify({'error': 'No seleccionaste ningún archivo'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Tipo de archivo no permitido'}), 400
            
        # Save file
        filename = secure_filename(file.filename)
        unique_filename = f"{email}_{filename}"
        file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
        
        # Create user
        new_user = User(
            email=email,
            name=name,
            password_hash=generate_password_hash(password, method='pbkdf2:sha256'),
            payment_proof=unique_filename,
            is_enabled=False
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Send emails
        send_status_email(new_user, 'registered')
        notify_admins_new_user(new_user)
        
        return jsonify({
            'message': 'Registro exitoso. Tu cuenta será habilitada tras verificar el pago.',
            'user': {
                'id': new_user.id,
                'email': new_user.email,
                'name': new_user.name
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email y contraseña son requeridos'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user or not check_password_hash(user.password_hash, password):
            return jsonify({'error': 'Email o contraseña incorrectos'}), 401
        
        # Create JWT token
        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'is_enabled': user.is_enabled
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/auth/me', methods=['GET'])
@jwt_required()
def get_current_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        
        return jsonify({
            'id': user.id,
            'email': user.email,
            'name': user.name,
            'role': user.role,
            'is_enabled': user.is_enabled
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ADMIN ROUTES ====================

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_all_users():
    try:
        user_id = get_jwt_identity()
        current_user = User.query.get(user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'No autorizado'}), 403
        
        users = User.query.all()
        users_data = [{
            'id': u.id,
            'email': u.email,
            'name': u.name,
            'role': u.role,
            'is_enabled': u.is_enabled,
            'payment_proof': u.payment_proof,
            'created_at': u.created_at.isoformat() if u.created_at else None
        } for u in users]
        
        return jsonify({'users': users_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/approve', methods=['POST'])
@jwt_required()
def approve_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'No autorizado'}), 403
        
        user = User.query.get_or_404(user_id)
        user.is_enabled = True
        db.session.commit()
        
        send_status_email(user, 'approved')
        
        return jsonify({'message': f'Usuario {user.name} habilitado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/disable', methods=['POST'])
@jwt_required()
def disable_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'No autorizado'}), 403
        
        if user_id == current_user_id:
            return jsonify({'error': 'No puedes deshabilitar tu propia cuenta'}), 400
        
        user = User.query.get_or_404(user_id)
        user.is_enabled = False
        db.session.commit()
        
        send_status_email(user, 'disabled')
        
        return jsonify({'message': f'Usuario {user.name} deshabilitado exitosamente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'No autorizado'}), 403
        
        if user_id == current_user_id:
            return jsonify({'error': 'No puedes eliminar tu propia cuenta'}), 400
        
        user = User.query.get_or_404(user_id)
        
        # Delete payment proof file
        if user.payment_proof:
            try:
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], user.payment_proof)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                print(f"Error deleting file: {e}")
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': f'Usuario {user.name} eliminado permanentemente'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def change_role(user_id):
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user or current_user.role != 'admin':
            return jsonify({'error': 'No autorizado'}), 403
        
        if user_id == current_user_id:
            return jsonify({'error': 'No puedes cambiar tu propio rol'}), 400
        
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['admin', 'user']:
            return jsonify({'error': 'Rol inválido'}), 400
        
        user = User.query.get_or_404(user_id)
        user.role = new_role
        db.session.commit()
        
        return jsonify({'message': f'Rol de {user.name} actualizado a {new_role}'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== FILE ROUTES ====================

@app.route('/api/uploads/<filename>', methods=['GET'])
@jwt_required()
def get_uploaded_file(filename):
    try:
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    except Exception as e:
        return jsonify({'error': 'Archivo no encontrado'}), 404

# ==================== HEALTH CHECK ====================

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok', 'message': 'Backend API is running'}), 200

# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Recurso no encontrado'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Error interno del servidor'}), 500

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
