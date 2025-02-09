from datetime import datetime

class Transaction:
    def __init__(self, id: int = None, from_account: str = None, to_account: str = None, amount: float = None, date: datetime = None, state: str = None):
        self.id = id
        self.from_account = from_account
        self.to_account = to_account
        self.amount = amount
        self.date = date
        self.state = state