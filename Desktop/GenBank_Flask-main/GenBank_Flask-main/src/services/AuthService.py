import bcrypt
from sqlalchemy import text

# Config
from src.database.db import db
from src.services.EmailService import EmailService

# Models
from src.models.User import User

class AuthService():
    
    @classmethod
    def login_user(cls, user):
        try:
            authenticated_user = None

            userFilter = User.query.filter_by(cc=user.cc).first()

            if userFilter and bcrypt.checkpw(user.password.encode('utf-8'), userFilter.password.encode('utf-8')):
                authenticated_user = userFilter

            return authenticated_user
        except Exception as ex:
            raise Exception(f"Error en la autenticación: {ex}")

    @classmethod
    def register_user(cls, user):
        try:
            db.session.execute(text("""
                CALL sp_register_user(
                    :cc, :first_name, :last_name, :birth_date, :email, 
                    :phone_number, :department, :city, :address, 
                    :address_details, :password, @p_message
                )
            """), {
                'cc': user.cc,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'birth_date': user.birth_date,
                'email': user.email,
                'phone_number': user.phone_number,
                'department': user.department,
                'city': user.city,
                'address': user.address,
                'address_details': user.address_details,
                'password': user.password
            })

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            return message
        except Exception as ex:
            raise Exception(f"Error al registrar el usuario: {ex}")

    @classmethod
    def generate_reset_password_token_service(cls, user):
        try:
            db.session.execute(text("""
                CALL sp_generate_reset_password_token(
                    :email, @p_token, @p_message
                )
            """), {
                'email': user.email,
            })

            result = db.session.execute(text("SELECT @p_token, @p_message"))
            row = result.fetchone()
            token = row[0]
            message = row[1]

            if token is not None:
                EmailService.enviar_email(
                    destinatario=user.email,
                    asunto="Restablecimiento de tu contraseña - GenBank",
                    plantilla="email/reset_password_email.html",
                    contexto={
                        'reset_link': 'http://localhost:5000/auth/password/reset?token=' + token,
                    }
                )

            db.session.commit()

            return message
        except Exception as ex:
            raise Exception(f"Error al generar el token de restablecimiento de contraseña: {ex}")

    @classmethod
    def validate_reset_password_token_service(cls, token):
        try:
            db.session.execute(text("""
                CALL sp_validate_reset_password_token(
                    :token, @p_message
                )
            """), {
                'token': token,
            })

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            return message
        except Exception as ex:
            raise Exception(f"Error al validar el token de restablecimiento: {ex}")

    @classmethod
    def reset_password_service(cls, token, new_password):
        try:
            db.session.execute(text("""
                CALL sp_reset_password(
                    :token, :new_password, @p_message
                )
            """), {
                'token': token,
                'new_password': new_password
            })

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            return message
        except Exception as ex:
            raise Exception(f"Error al restablecer la contraseña: {ex}")