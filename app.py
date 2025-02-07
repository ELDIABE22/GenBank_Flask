from config import config
from src import init_app
from dotenv import load_dotenv

load_dotenv()

configuration = config['development']
app = init_app(configuration)

if __name__ == '__main__':
    app.run(debug=True)