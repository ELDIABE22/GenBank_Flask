from src.database.db import db, ma
from sqlalchemy.dialects.mysql import ENUM
from datetime import datetime

class Deposit(db.Model):
    __tablename__ = "deposits"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    account = db.Column(db.String(16), db.ForeignKey("accounts.account_number", ondelete="SET NULL"), nullable=True, index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    date = db.Column(db.DateTime, nullable=False)
    state = db.Column(ENUM('Exitoso', 'Fallido'), nullable=False)

    def __init__(self, account, amount=None, date=None, state='Exitoso'):
        self.account = account
        self.amount = amount
        self.date = date or datetime.now()
        self.state = state

class DepositsSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Deposit
        load_instance = True
