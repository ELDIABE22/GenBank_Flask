from sqlalchemy import text
from src.database.db import db

# Models
from src.models.Deposits import Deposit

class DepositService():
    @classmethod
    def account_deposits_service(cls, deposit, page=1, limit=10):
        try:
            offset = (page - 1) * limit
            
            deposits = Deposit.query \
            .filter_by(account=deposit.account) \
            .order_by(Deposit.date) \
            .offset(offset) \
            .limit(limit) \
            .all()

            total = Deposit.query \
            .filter_by(account=deposit.account) \
            .count()
            
            return deposits, total
        except Exception as ex:
            raise Exception(f"Error al obtener los depósitos de la cuenta: {ex}")
        
    @classmethod
    def deposit_service(cls, deposit):
        try:
            db.session.execute(text("""
                CALL sp_deposit(
                    :account, :amount, @p_message
                )
            """), {
                'account': deposit.account,
                'amount': deposit.amount
            })

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            return message
        except Exception as ex:
            raise Exception(f"Error al depositar en la cuenta: {ex}")   