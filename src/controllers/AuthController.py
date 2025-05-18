from flask import Blueprint, request, jsonify
import bcrypt

# Models
from src.models.User import User, UsersSchema
# Security
from src.utils.Security import Security
# Services
from src.services.AuthService import AuthService

user_schema = UsersSchema()
users_schema = UsersSchema(many=True)

main = Blueprint('auth_blueprint', __name__)

@main.route('/login', methods=['POST'])
def login():
    cc = request.json['cc']
    password = request.json['password']

    _user = User(cc=cc, password=password)
    authenticated_user = AuthService.login_user(_user)   

    if authenticated_user:
        token = Security.generate_token(authenticated_user)

        return jsonify({
            'message': f"Inicio de sesión exitoso. Bienvenido, {authenticated_user.first_name}!",
            'token': token,
            'user': user_schema.dump(authenticated_user)
            }), 200
    else:
        return jsonify({'message': "Credenciales incorrectas. Verifica tus datos."}), 401
    
@main.route('/register', methods=['POST'])
def register():
    cc = request.json['cc']
    first_name = request.json['first_name']
    last_name = request.json['last_name']
    birth_date = request.json['birth_date']
    email = request.json['email']
    phone_number = request.json['phone_number']
    department = request.json['department']
    city = request.json['city']
    address = request.json['address']
    address_details = request.json['address_details']
    password = request.json['password']

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    _user = User(
        cc, first_name, last_name, birth_date, email, phone_number,
        department, city, address, address_details, hashed_password.decode('utf-8')
    )

    message = AuthService.register_user(_user)

    return jsonify({'message': message}), 201 if message == 'Cuenta creada exitosamente.' else 400

@main.route('/password/request-reset', methods=['POST'])
def generate_reset_password_token_controller():
    email = request.json['email']

    _user = User(email=email)

    message = AuthService.generate_reset_password_token_service(_user)

    if message == 'Se ha generado un enlace de restablecimiento. Por favor, revisa tu correo para continuar con el proceso.':
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 404

@main.route('/password/validate-reset/<token>', methods=['GET'])
def validate_reset_password_token_controller(token):
    message = AuthService.validate_reset_password_token_service(token)

    if message == 'Token válido.':
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 400

@main.route('/password/reset', methods=['POST'])
def reset_password_controller():
    token = request.json['token']
    password = request.json['password']

    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    message = AuthService.reset_password_service(token, hashed_password.decode('utf-8'))

    if message == 'Contraseña actualizada correctamente.':
        return jsonify({'message': message}), 200
    else:
        return jsonify({'message': message}), 400