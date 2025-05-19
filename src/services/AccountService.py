from src.database.db import db
from sqlalchemy import text

# Models
from src.models.Account import Account
from src.models.User import User
# Services
from src.services.EmailService import EmailService

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

            userFilter = User.query.filter_by(cc=cc).first()

            result = db.session.execute(text("SELECT @p_message"))
            message = result.fetchone()[0]

            db.session.commit()

            if message == "Cuenta corriente generada exitosamente.":
                EmailService.enviar_email(
                    destinatario=userFilter.email,
                    asunto="Cuenta Corriente Generada",
                    plantilla="email/account_current_email.html",
                    contexto={
                        "user_name": userFilter.first_name,
                        "dashboard_link": "http://localhost:5000/dashboard",
                    }
                )

            return message
        except Exception as ex:
            raise Exception(f"Error al generar la cuenta corriente: {ex}")