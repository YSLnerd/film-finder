#для работы со временем
from datetime import datetime, timedelta
#Для работы с токеном
from jose import jwt, JWTError
#Для криптографического хеширования паролей
import bcrypt
#Для работы с файлами и памятью программы
import os
#Для работы с енв
from dotenv import load_dotenv

load_dotenv()
#Секретный ключ для токена
SECRET_KEY = os.getenv("SECRET_KEY", "root")
#Алгоритм JWT
ALGORITHM = "HS256"
#Срок годности JWT на сайт
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
#Хеширование пароля
def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')
#Проверка пароля при входе
def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hashed_bytes)
#Выдача токена
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
#Расшифровка токена на бекенде
def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None