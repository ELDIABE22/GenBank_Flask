import os
import pymysql

def get_db_connection():
    try:
        connection = pymysql.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            db=os.getenv('DB_NAME')
        )
        return connection
    except pymysql.MySQLError as e:
        print(f"Error al conectar a MySQL: {e}")
        return None
