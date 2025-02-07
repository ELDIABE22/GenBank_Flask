from src.database.db import get_db_connection
import bcrypt

# Models
from src.models.User import User

class AuthService():
    
    @classmethod
    def login_user(cls, user):
        try:
            connection = get_db_connection()
            authenticated_user = None
            with connection.cursor() as cursor:
                query = "SELECT * FROM Users WHERE cc = %s"
                cursor.execute(query, (user.cc))
                row = cursor.fetchone()
                if row and bcrypt.checkpw(user.password.encode('utf-8'), row[10].encode('utf-8')):
                    authenticated_user = User(
                        row[0],  # cc
                        row[1],  # first_name
                        row[2],  # last_name
                        row[3],  # birth_date
                        row[4],  # email
                        row[5],  # phone_number
                        row[6],  # department
                        row[7],  # city
                        row[8],  # address
                        row[9],  # address_details
                        None,    # No devolver la contraseña
                        row[11], # created_at
                        row[12]  # updated_at
                    )
            connection.close()
            return authenticated_user
        except Exception as ex:
            raise Exception(f"Error en la autenticación: {ex}")
        
    @classmethod
    def register_user(cls, user):
        try:
            connection = get_db_connection()
            with connection.cursor() as cursor:
                cursor.callproc("sp_register_user", (
                    user.cc, user.first_name, user.last_name, user.birth_date,
                    user.email, user.phone_number, user.department, user.city,
                    user.address, user.address_details, user.password, None
                ))

                cursor.execute("SELECT @p_message;")
                message = cursor.fetchone()[0]

            connection.commit()
            connection.close()

            return message
        except Exception as ex:
            raise Exception(f"Error al registrar el usuario: {ex}")



