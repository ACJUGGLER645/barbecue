from app import app, mail
from flask_mail import Message
import os

# Create a test script to verify email functionality
print("--- Verificando Configuración ---")
print(f"Servidor: {app.config['MAIL_SERVER']}")
print(f"Puerto: {app.config['MAIL_PORT']}")
print(f"Usuario: {app.config['MAIL_USERNAME']}")
# Don't print the full password for security, just length
print(f"Password Check: {'OK' if app.config['MAIL_PASSWORD'] else 'MISSING'}")

recipient = "rafaguzmanrodri@gmail.com"

with app.app_context():
    msg = Message(
        subject="Prueba de Configuración SMTP - Dev Barbecue",
        sender=app.config['MAIL_DEFAULT_SENDER'],
        recipients=[recipient],
        body="¡Hola! Si has recibido este correo, significa que la configuración SMTP de tu aplicación Flask está funcionando perfectamente con tu cuenta de Gmail.\n\nSaludos,\nTu Asistente de IA."
    )
    
    try:
        print(f"\nIntentando enviar correo de prueba a {recipient}...")
        mail.send(msg)
        print("✅ ¡Correo enviado exitosamente!")
        print("👉 Por favor revisa tu bandeja de entrada (y la carpeta de Spam por si acaso).")
    except Exception as e:
        print(f"❌ FALLÓ el envío del correo: {e}")
