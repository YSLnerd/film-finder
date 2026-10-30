#Библиотека для работы с БД на языке Python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
load_dotenv()
#Достаём адрес базы из енв и проверяем
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL не найден в .env")
#Двигатель базы данных
engine = create_engine(DATABASE_URL)
#Создание сессии(Отдельной операции с БД)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
#Базовый класс для таблиц
Base = declarative_base()
#Автосоздание таблиц если в базе их нет
Base.metadata.create_all(bind=engine)
#Управление сессиями
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()