from flask_mail import Message
from src.utils.mail import mail
from flask import current_app, render_template

class EmailService():
    @classmethod
    def enviar_email(cls, destinatario, asunto, plantilla, contexto={}):
        with current_app.app_context():
            html = render_template(plantilla, **contexto)

            msg = Message(subject=asunto,
                        recipients=[destinatario],
                        html=html)
            mail.send(msg)
