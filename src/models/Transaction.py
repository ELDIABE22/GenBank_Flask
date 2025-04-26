from src.database.db import db, ma
from sqlalchemy.dialects.mysql import ENUM
from datetime import datetime

class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    from_account = db.Column(db.String(16), db.ForeignKey("accounts.account_number", ondelete="SET NULL"), nullable=True, index=True)
    to_account = db.Column(db.String(16), db.ForeignKey("accounts.account_number", ondelete="SET NULL"), nullable=True, index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    state = db.Column(ENUM('Pendiente', 'Exitoso', 'Fallido'), default='Pendiente')

    def __init__(self, from_account, to_account, amount, date=None, state='Pendiente'):
        self.from_account = from_account
        self.to_account = to_account
        self.amount = amount
        self.date = date or datetime.now()
        self.state = state

class TransactionsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Transaction
        load_instance = True
