from src.database.db import db, ma
from datetime import datetime, timezone

class User(db.Model):
    __tablename__ = "users"

    cc = db.Column(db.String(10), primary_key=True)
    first_name = db.Column(db.String(255), nullable=False)
    last_name = db.Column(db.String(255), nullable=False)
    birth_date = db.Column(db.Date, nullable=False)
    email = db.Column(db.String(255), unique=True, index=True, nullable=False)
    phone_number = db.Column(db.String(10), unique=True, index=True, nullable=False)
    department = db.Column(db.String(100), nullable=False)
    city = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(150), nullable=False)
    address_details = db.Column(db.Text, nullable=True)
    password = db.Column(db.String(255), nullable=False)

    def __init__(self, cc=None, first_name=None, last_name=None, birth_date=None,
                email=None, phone_number=None, department=None, city=None, address=None,
                address_details=None, password=None):
        self.cc = cc
        self.first_name = first_name
        self.last_name = last_name
        self.birth_date = birth_date
        self.email = email
        self.phone_number = phone_number
        self.department = department
        self.city = city
        self.address = address
        self.address_details = address_details
        self.password = password

class UsersSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        exclude = ('password',)