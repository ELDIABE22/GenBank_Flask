from src.database.db import get_db_connection

class DepositService():
    @classmethod
    def account_deposits_service(cls, deposit):
        try:
            connection = get_db_connection()

            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM deposits WHERE account = %s ORDER BY date", (deposit.account,))
                result = cursor.fetchall()
            
            connection.close()

            deposits = [
                {
                    "id": row[0],
                    "account": row[1],
                    "amount": row[2],
                    "date": row[3].isoformat() + 'Z',
                    "state": row[4]
                } for row in result
            ]

            return deposits
        except Exception as ex:
            raise Exception(f"Error al obtener los depósitos de la cuenta: {ex}")
        
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