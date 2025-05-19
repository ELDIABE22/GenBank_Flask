from sqlalchemy import text
from src.database.db import db

# Models
from src.models.Account import Account
from src.models.User import User
# Services
from src.services.EmailService import EmailService

class TransactionService():
    @classmethod
    def transaction_service(cls, transaction):
        try:
            db.session.execute(text("""
                CALL sp_transaction(
                    :from_account, :to_account, :amount, @p_message
                )
            """), {
                'from_account': transaction.from_account,
                'to_account': transaction.to_account,
                'amount': transaction.amount
            })

            userFilter = User.query.join(Account, User.cc == Account.user) \
                .filter(Account.account_number == transaction.from_account) \
                .first()

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            if message == "Transferencia realizada con éxito.":
                EmailService.enviar_email(
                    destinatario=userFilter.email,
                    asunto="Transferencia Realizada",
                    plantilla="email/transfer_email.html",
                    contexto={
                        "user_name": userFilter.first_name,
                        "dashboard_link": "http://localhost:5000/transaction",
                    }
                )

            return message
        except Exception as ex:
            raise Exception(f"Error al registrar la transacción: {ex}")
        
    @classmethod
    def account_transactions_service(cls, account, page=1, limit=10):
        try:
            offset = (page - 1) * limit
            transactions = db.session.execute(
                text("""
                    SELECT * FROM vw_account_transactions 
                    WHERE account = :account 
                    LIMIT :limit OFFSET :offset
                """),
                {'account': account, 'limit': limit, 'offset': offset}
            ).mappings().all()

            # Obtener el total de transacciones sin paginar
            total_result = db.session.execute(
            text("""
                SELECT COUNT(*) as total 
                FROM vw_account_transactions 
                WHERE account = :account
            """),
            {'account': account}
            )
            
            total = total_result.scalar()

            return transactions, total
        except Exception as ex:
            raise Exception(f"Error al obtener las transacciones de la cuenta: {ex}")
