from flask import Blueprint, request, jsonify

# Models
from src.models.Transaction import Transaction
# Services
from src.services.TransactionService import TransactionService
# Security
from src.utils.Security import Security

main = Blueprint('transaction_blueprint', __name__)

@main.route('/', methods=['POST'])
def transaction_controller():
    has_access = Security.verify_token(request.headers)

    if has_access:
        from_account = request.json['from_account']
        to_account = request.json['to_account']
        amount = request.json['amount']

        _transaction = Transaction(from_account=from_account, to_account=to_account, amount=amount)
        message = TransactionService.transaction_service(_transaction)

        if message == 'Transferencia realizada con éxito.':
            return jsonify({'message': message}), 200
        else: 
            return jsonify({'message': message}), 400
    else:
        return jsonify({'message': '¡Error de autenticación, inicie sesión!'}), 401
    
@main.route('/<account>/transactions', methods=['GET'])
def account_transactions_controller(account):
    has_access = Security.verify_token(request.headers)

    if has_access:
        result = TransactionService.account_transactions_service(account)
        return jsonify(result), 200
    else:
        return jsonify({'message': '¡Error de autenticación, inicie sesión!'}), 401