#excep и сттус для выхода с ошибкой, депендс для выполнения действия перед основым процессом
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.auth import decode_access_token
security = HTTPBearer()
#Проверяет запрос от сайта автоматически на то, какой пользователь его сделал
def get_current_user(
    #Достаём токен из запроса
    credentials: HTTPAuthorizationCredentials = Depends(security),
    #открываем сессию с БД
    db: Session = Depends(get_db)) -> int:
    #достаём сырой токен
    token = credentials.credentials
    #Расшифровываем
    payload = decode_access_token(token)
    #Токен шляпа, тогда выкидывает на экран входа
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Невалидный или истёкший токен",
            headers={"WWW-Authenticate": "Bearer"},
        )
    #Токен не содержит id - на экран входа
    user_id_str = payload.get("sub")
    if user_id_str is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Токен не содержит id пользователя",
        )
    #Неверный формат ID - на экран входа
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный формат id в токене",
        )
    #Пользователя нету в базе - на экранвхода
    user = db.query(User).filter(User.id_user == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Пользователь не найден",
        )
    return user_id
#Просверка прав админа
def require_admin(
    #Проверяем пользователя предыдущей функцией
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)) -> int:
    #Вытаскиваем данные пользователя
    user = db.query(User).filter(User.id_user == current_user_id).first()
    #Если роль не админ- не видать ему функций админа
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Требуются права администратора",
        )
    #Если всё чётко возвращаем id пользователя
    return current_user_id