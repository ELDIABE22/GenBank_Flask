import datetime
import jwt
import pytz
import os

class Security:
    secret = os.getenv('JWT_KEY')
    tz = pytz.timezone("America/Lima")

    @classmethod
    def generate_token(cls, authenticated_user):
        payload = {
            'iat': datetime.datetime.now(tz=cls.tz),
            'exp': datetime.datetime.now(tz=cls.tz) + datetime.timedelta(hours=1),
            'cc': authenticated_user.cc
        }
        return jwt.encode(payload, cls.secret, algorithm="HS256")
    
    @classmethod
    def verify_token(cls, headers):
        if 'Authorization' in headers.keys():
            authorization = headers['Authorization']
            encoded_token = authorization.split(" ")[1]

            if (len(encoded_token) > 0):
                try:
                    payload = jwt.decode(encoded_token, cls.secret, algorithms=["HS256"])

                    if payload['cc']:
                        return True
                    return False
                except (jwt.ExpiredSignatureError, jwt.InvalidSignatureError):
                    return False

        return False
