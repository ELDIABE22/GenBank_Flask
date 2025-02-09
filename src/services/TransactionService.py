from src.database.db import get_db_connection

class TransactionService():
    @classmethod
    def transaction_service(cls, transaction):
        try:
            connection = get_db_connection()
            with connection.cursor() as cursor:
                cursor.callproc("sp_transaction", (
                    transaction.from_account, transaction.to_account, transaction.amount, None
                ))

                cursor.execute("SELECT @p_message;")
                message = cursor.fetchone()[0]

            connection.commit()
            connection.close()

            return message
        except Exception as ex:
            raise Exception(f"Error al registrar la transacción: {ex}")
        
    @classmethod
    def account_transactions_service(cls, account):
        try:
            connection = get_db_connection()
            with connection.cursor() as cursor:
                cursor.execute("SELECT * FROM vw_account_transactions WHERE cuenta = %s", (account,))

                result = cursor.fetchall()

            connection.close()

            transactions = [
                {
                    "id": row[0],
                    "type": row[1],
                    "account": row[2],
                    "amount": row[3],
                    "date": row[4].isoformat() + 'Z',
                    "state": row[5]
                } for row in result
            ]

            return transactions
        except Exception as ex:
            raise Exception(f"Error al obtener las transacciones de la cuenta: {ex}")