import os
from flask import Flask, render_template, redirect, url_for, request, flash, send_from_directory
from dotenv import load_dotenv
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_mail import Mail, Message
from models import db, User

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_change_in_production')
# Use absolute path for DB to avoid issues with relative paths
basedir = os.path.abspath(os.path.dirname(__file__))
db_path = os.path.join(basedir, 'barbecue.db')
# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', f'sqlite:///{db_path}')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'

if app.config['SQLALCHEMY_DATABASE_URI'].startswith("postgres://"):
    app.config['SQLALCHEMY_DATABASE_URI'] = app.config['SQLALCHEMY_DATABASE_URI'].replace("postgres://", "postgresql://", 1)
app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'uploads')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# --- Mail Config ---
app.config['MAIL_SERVER'] = os.environ.get('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.environ.get('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.environ.get('MAIL_USE_TLS', 'True') == 'True'
app.config['MAIL_USERNAME'] = os.environ.get('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.environ.get('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('MAIL_DEFAULT_SENDER')

mail = Mail(app)

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

Ingresa aquí: {url_for('login', _external=True)}

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

# Ensure upload and instance directories exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
os.makedirs(os.path.join(app.root_path, 'instance'), exist_ok=True)

db.init_app(app)

# Create tables if they don't exist
# Tables will be created manually or in main block


login_manager = LoginManager()
login_manager.login_view = 'login'
login_manager.init_app(app)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# --- Admin Helper ---
from functools import wraps
from flask import abort

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            abort(403)
        return f(*args, **kwargs)
    return decorated_function

# --- CLI Commands ---
@app.cli.command("create-admin")
def create_admin():
    """Creates an admin user."""
    email = input("Enter admin email: ")
    password = input("Enter admin password: ")
    name = input("Enter admin name: ")
    
    user = User.query.filter_by(email=email).first()
    if user:
        print("User already exists. Updating role to admin.")
        user.role = 'admin'
        user.is_enabled = True
    else:
        user = User(
            email=email,
            name=name,
            password_hash=generate_password_hash(password, method='pbkdf2:sha256'),
            role='admin',
            is_enabled=True
        )
        db.session.add(user)
    
    db.session.commit()
    print(f"Admin user {email} created/updated successfully.")

# --- Routes ---

@app.route('/')
def index():
    return render_template('index.html', user=current_user)

@app.route('/admin')
@login_required
@admin_required
def admin_panel():
    users = User.query.all()
    return render_template('admin.html', users=users)

@app.route('/admin/approve/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def approve_user(user_id):
    user = User.query.get_or_404(user_id)
    user.is_enabled = True
    db.session.commit()
    
    # Send email
    send_status_email(user, 'approved')
    
    flash(f'Usuario {user.name} habilitado exitosamente y notificado por correo.', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/admin/disable/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def disable_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        flash('No puedes deshabilitar tu propia cuenta.', 'error')
        return redirect(url_for('admin_panel'))
    user.is_enabled = False
    db.session.commit()
    
    # Send email
    send_status_email(user, 'disabled')
    
    flash(f'Usuario {user.name} deshabilitado exitosamente y notificado por correo.', 'success')
    flash(f'Usuario {user.name} deshabilitado exitosamente y notificado por correo.', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/admin/delete/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        flash('No puedes eliminar tu propia cuenta.', 'error')
        return redirect(url_for('admin_panel'))
    
    # Optional: Delete proof file if exists
    if user.payment_proof:
        try:
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], user.payment_proof)
            if os.path.exists(file_path):
                os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")

    db.session.delete(user)
    db.session.commit()
    
    flash(f'Usuario {user.name} eliminado permanentemente.', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/admin/change_role/<int:user_id>', methods=['POST'])
@login_required
@admin_required
def change_role(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        flash('No puedes cambiar tu propio rol por seguridad.', 'error')
        return redirect(url_for('admin_panel'))
    
    new_role = request.form.get('role')
    if new_role not in ['admin', 'user']:
        flash('Rol inválido.', 'error')
        return redirect(url_for('admin_panel'))
        
    user.role = new_role
    db.session.commit()
    flash(f'Rol de {user.name} actualizado a {new_role}.', 'success')
    return redirect(url_for('admin_panel'))

@app.route('/matrix')
@login_required
def matrix():
    if not current_user.is_enabled:
        flash('Tu cuenta aún no ha sido habilitada. Verifica tu pago.', 'warning')
        return redirect(url_for('index'))
    return render_template('matrix.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        else:
            flash('Email o contraseña incorrectos.', 'error')
            
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        email = request.form.get('email')
        name = request.form.get('name')
        password = request.form.get('password')
        
        # Handle file upload
        if 'payment_proof' not in request.files:
            flash('Debes subir un comprobante de pago.', 'error')
            return redirect(request.url)
            
        file = request.files['payment_proof']
        if file.filename == '':
            flash('No seleccionaste ningún archivo.', 'error')
            return redirect(request.url)
            
        if file:
            filename = secure_filename(file.filename)
            # Save with unique name to prevent overwrite
            unique_filename = f"{email}_{filename}"
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
            
            user = User.query.filter_by(email=email).first()
            if user:
                flash('El email ya está registrado.', 'error')
                return redirect(url_for('login'))
            
            new_user = User(
                email=email,
                name=name,
                password_hash=generate_password_hash(password, method='pbkdf2:sha256'),
                payment_proof=unique_filename,
                is_enabled=False # Default to disabled
            )
            
            db.session.add(new_user)
            db.session.commit()
            
            # Send welcome/verification pending email
            send_status_email(new_user, 'registered')
            
            flash('Registro exitoso. Tu cuenta será habilitada tras verificar el pago.', 'success')
            return redirect(url_for('login'))
            
    return render_template('register.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

# Route to serve uploaded files (admin only ideally, but for now...)
@app.route('/uploads/<filename>')
@login_required
def uploaded_file(filename):
    # In a real app, check if user is admin or the owner of the file
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
