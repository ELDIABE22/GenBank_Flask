from src.database.db import get_db_connection

# Models
from src.models.Account import Account

class AccountService():

    @classmethod
    def accounts_by_user_service(cls, cc):
        try:
            connection = get_db_connection()
            accounts = []
            with connection.cursor() as cursor:
                query = "SELECT account_number, account_type, balance, expiration_date, cvv FROM accounts WHERE user = %s"
                cursor.execute(query, (cc))
                rows = cursor.fetchall()
                
                for row in rows:
                    account = Account(
                        user=cc,
                        account_type=row[1],
                        balance=row[2],
                        account_number=row[0],
                        expiration_date=row[3],
                        cvv=row[4]
                    )
                    accounts.append(account)
            
            connection.close()
            return accounts
        except Exception as ex:
            raise Exception(f"Error al obtener cuentas del usuario: {ex}")
        
    @classmethod
    def account_current_service(cls, cc):
        try:
            connection = get_db_connection()

            with connection.cursor() as cursor:
                cursor.callproc("sp_generate_account_current", (cc, None))

                cursor.execute("SELECT @p_message;")
                message = cursor.fetchone()[0]

            connection.commit()
            connection.close()

            return message
        except Exception as ex:
            raise Exception(f"Error al generar la cuenta corriente: {ex}")
        
    @classmethod
    def deposit_service(cls, deposit):
        try:
            connection = get_db_connection()

            with connection.cursor() as cursor:
                cursor.callproc("sp_deposit", (deposit.account, deposit.amount, None))

                cursor.execute("SELECT @p_message;")
                message = cursor.fetchone()[0]

            connection.commit()
            connection.close()

            return message
        except Exception as ex:
            raise Exception(f"Error al depositar en la cuenta: {ex}")   