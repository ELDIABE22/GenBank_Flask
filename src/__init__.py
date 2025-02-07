from flask import Flask

# Routes
from .controllers import AuthController

app = Flask(__name__)

def init_app(config):
    # Configuration
    app.config.from_object(config)

    # Blueprints
    app.register_blueprint(AuthController.main, url_prefix='/api/v1/auth')

    return app