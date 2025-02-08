from flask import Blueprint, request, jsonify
import bcrypt

# Models
from src.models.User import User
# Security
from src.utils.Security import Security
# Services
from src.services.AccountService import AccountService
from src.services.AuthService import AuthService

main = Blueprint('auth_blueprint', __name__)

@main.route('/login', methods=['POST'])
def login():
    cc = request.json['cc']
    password = request.json['password']

    _user = User(cc=cc, password=password)
    authenticated_user = AuthService.login_user(_user)   

    if authenticated_user:
        accounts = AccountService.accounts_by_user_service(authenticated_user.cc)
        userData = {
            'cc': authenticated_user.cc,
            'first_name': authenticated_user.first_name,
            'last_name': authenticated_user.last_name,
            'birth_date': authenticated_user.birth_date,
            'email': authenticated_user.email,
            'phone_number': authenticated_user.phone_number,
            'department': authenticated_user.department,
            'city': authenticated_user.city,
            'address': authenticated_user.address,
            'address_details': authenticated_user.address_details,
            'accounts': [account.__dict__ for account in accounts]
        }
        
        token = Security.generate_token(authenticated_user)

        return jsonify({
            'message': f"Inicio de sesión exitoso. Bienvenido, {authenticated_user.first_name}!",
            'token': token,
            'user': userData
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
