from app import app, db, User
from werkzeug.security import generate_password_hash

# Context is required to access DB
with app.app_context():
    # Ensure tables exist (since we removed it from app.py global scope)
    db.create_all()
    
    email = "rafaguzmanrodri@gmail.com"
    password = "admin" # Contraseña temporal
    name = "Rafael Guzman"
    
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
            payment_proof="admin_bypass.png" # Placeholder
        )
        db.session.add(user)
    
    db.session.commit()
    print("¡Usuario admin creado/actualizado exitosamente!")
