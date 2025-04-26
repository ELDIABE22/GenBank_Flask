from flask import Flask
from src.database.db import db, ma, configure_db

# Routes
from .controllers import AuthController
from .controllers import AccountController
from .controllers import TransactionController
from .controllers import DepositController
from .controllers import TemplateController

def init_app():
    app = Flask(__name__)

    # Configura la base de datos
    configure_db(app)
    
    # Blueprints

        # Template
    app.register_blueprint(TemplateController.main, url_prefix='/')

        # API
    app.register_blueprint(AuthController.main, url_prefix='/api/v1/auth')
    app.register_blueprint(AccountController.main, url_prefix='/api/v1/account')
    app.register_blueprint(TransactionController.main, url_prefix='/api/v1/transaction')
    app.register_blueprint(DepositController.main, url_prefix='/api/v1/deposit')

    with app.app_context():
        db.create_all()

    return app