from flask import Blueprint, render_template

main = Blueprint('template_blueprint', __name__)

@main.route('/')
def index_route():
    return render_template('index.html')

@main.route('/auth/login')
def login_route():
    return render_template('login.html') 

@main.route('/auth/register')
def register_route():
    return render_template('register.html') 

@main.route('/auth/password/reset')
def reset_password_route():
    return render_template('reset_password.html')

@main.route('/dashboard')
def dashboard_route():
    return render_template('dashboard.html') 

@main.route('/transfer')
def transfer_route():
    return render_template('transfer.html')

@main.route('/transaction')
def transaction_route():
    return render_template('transaction.html')

@main.route('/deposit')
def deposit_route():
    return render_template('deposit.html')