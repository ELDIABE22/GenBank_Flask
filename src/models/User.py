class User:

    def __init__(self, cc, first_name=None, last_name=None, birth_date=None, email=None, phone_number=None, department=None, city=None, address=None, address_details=None, password=None, created_at=None, updated_at=None):
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
