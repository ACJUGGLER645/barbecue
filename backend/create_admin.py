from app import app, db, User
from werkzeug.security import generate_password_hash

# Context is required to access DB
with app.app_context():
    # Ensure tables exist
    db.create_all()
    
    email = input("Email del admin: ") or "rafaguzmanrodri@gmail.com"
    password = input("Contraseña: ") or "admin"
    name = input("Nombre: ") or "Rafael Guzman"
    
    user = User.query.filter_by(email=email).first()
    if user:
        print(f"Usuario {email} ya existe. Actualizando a admin.")
        user.role = 'admin'
        user.is_enabled = True
        user.password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    else:
        print(f"Creando nuevo admin: {email}")
        user = User(
            email=email,
            name=name,
            password_hash=generate_password_hash(password, method='pbkdf2:sha256'),
            role='admin',
            is_enabled=True,
            payment_proof="admin_bypass.png"
        )
        db.session.add(user)
    
    db.session.commit()
    print("¡Usuario admin creado/actualizado exitosamente!")
