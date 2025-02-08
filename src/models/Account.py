class Account:
    def __init__(self, user: str, account_type: str, balance: float, 
                account_number: str, expiration_date: str, cvv: str):
        self.user = user
        self.account_type = account_type
        self.balance = balance
        self.account_number = account_number
        self.expiration_date = expiration_date
        self.cvv = cvv