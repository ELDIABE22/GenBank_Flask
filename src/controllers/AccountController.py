from flask import Blueprint, request, jsonify

# Models
from src.models.Deposits import Deposit
# Services
from src.services.AccountService import AccountService

main = Blueprint('account_blueprint', __name__)

@main.route('/current', methods=['POST'])
def account_current_controller():
    cc = request.json['cc']
    message = AccountService.account_current_service(cc)

    if message == 'Cuenta corriente generada exitosamente.':
        return jsonify({'message': message }), 201
    else:
        return jsonify({'message': message}), 400
    
@main.route('/<account_number>/deposit', methods=['POST'])
def deposit_controller(account_number):
    amount = request.json['amount']
    _deposit = Deposit(account=account_number, amount=amount)
    message = AccountService.deposit_service(_deposit)

    if message == 'Depósito realizado con éxito.':
        return jsonify({'message': message }), 200
    else:
        return jsonify({'message': message}), 400