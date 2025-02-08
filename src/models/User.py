from datetime import date, datetime

class User:
    def __init__(self, cc: str, 
                    first_name: str = None, 
                    last_name: str = None, 
                    birth_date: date = None,
                    email: str = None, 
                    phone_number: str = None, 
                    department: str = None, 
                    city: str = None, 
                    address: str = None, 
                    address_details: str = None, 
                    password: str = None, 
                    created_at: datetime = None,
                    updated_at: datetime = None):
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
        self.created_at = created_at
        self.updated_at = updated_at
