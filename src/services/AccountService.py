from src.database.db import db
from sqlalchemy import text

# Models
from src.models.Account import Account

class AccountService():

    @classmethod
    def accounts_by_user_service(cls, cc):
        try:
            accounts = Account.query.with_entities(
                Account.account_number,
                Account.account_type,
                Account.balance,
                Account.expiration_date,
                Account.cvv
            ).filter_by(user=cc)

            return accounts
        except Exception as ex:
            raise Exception(f"Error al obtener cuentas del usuario: {ex}")
        
    @classmethod
    def account_current_service(cls, cc):
        try:
            db.session.execute(text("""
                CALL sp_generate_account_current(
                    :cc, @p_message
                )
            """), {
                'cc': cc
            })

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            return message
        except Exception as ex:
            raise Exception(f"Error al generar la cuenta corriente: {ex}")