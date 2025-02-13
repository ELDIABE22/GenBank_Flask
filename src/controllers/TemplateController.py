from flask import Blueprint, render_template

main = Blueprint('template_blueprint', __name__)

@main.route('/auth/login')
def login_route():
    return render_template('login.html') 