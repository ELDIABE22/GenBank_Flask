from datetime import datetime

class Deposit:
    def __init__(self, id: int = None, account: str = None, amount: float = None, date: datetime = None, state: str = None):
        self.id = id
        self.account = account
        self.amount = amount
        self.date = date
        self.state = state