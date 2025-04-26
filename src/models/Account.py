from src.database.db import db, ma
from sqlalchemy.dialects.mysql import ENUM

class Account(db.Model):
    __tablename__ = "accounts"

    account_number = db.Column(db.String(16), unique=True)
    user = db.Column(db.String(10), db.ForeignKey("users.cc", ondelete="CASCADE"), primary_key=True)
    account_type = db.Column(ENUM("Ahorros", "Corriente"), default="Ahorros", primary_key=True)
    balance = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    expiration_date = db.Column(db.String(5), nullable=False)
    cvv = db.Column(db.String(3), nullable=False)
    state = db.Column(ENUM("Activa", "Inactiva"), default="Activa")

    def __init__(self, user, account_type="Ahorros", balance=0.00, 
                account_number=None, expiration_date=None, cvv=None, state="Activa"):
        self.user = user
        self.account_type = account_type
        self.balance = balance
        self.account_number = account_number
        self.expiration_date = expiration_date
        self.cvv = cvv
        self.state = state

class AccountsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Account
        load_instance = True
