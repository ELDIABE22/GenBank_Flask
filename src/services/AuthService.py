import bcrypt
from sqlalchemy import text
from src.database.db import db

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