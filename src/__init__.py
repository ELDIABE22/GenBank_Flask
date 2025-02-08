from flask import Flask

# Routes
from .controllers import AuthController
from .controllers import AccountController

app = Flask(__name__)

def init_app(config):
    # Configuration
    app.config.from_object(config)

    # Blueprints
    app.register_blueprint(AuthController.main, url_prefix='/api/v1/auth')
    app.register_blueprint(AccountController.main, url_prefix='/api/v1/account')

    return app