from flask import Blueprint, request, jsonify

# Models
from src.models.Transaction import Transaction, TransactionsSchema, AccountTransactionSchema
# Services
from src.services.TransactionService import TransactionService
# Security
from src.utils.Security import Security

transaction_schema = TransactionsSchema()
transactions_schema = TransactionsSchema(many=True)
account_transactions_schema = AccountTransactionSchema(many=True)

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
        page = request.args.get('page', default=1, type=int)
        limit = request.args.get('limit', default=10, type=int)

        transactions, total = TransactionService.account_transactions_service(account, page, limit)
        
        return jsonify({
            'transactions': account_transactions_schema.dump(transactions),
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total
            }
        }), 200
    else:
        return jsonify({'message': '¡Error de autenticación, inicie sesión!'}), 401