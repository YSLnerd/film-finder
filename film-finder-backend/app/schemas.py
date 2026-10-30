from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
# АВТОРИЗАЦИЯ
class UserRegister(BaseModel):
    # Провеляет поступившие данные пользователя при регистрации
    nickname: str = Field(..., min_length=2, max_length=30)
    password: str = Field(..., min_length=3)
class UserLogin(BaseModel):
    #При входе проверяет, что есть строка логина и пароля
    nickname: str
    password: str
class Token(BaseModel):
    #Схема ответа сервера при успешном запросе
    access_token: str
    token_type: str = "bearer"
class UserResponse(BaseModel):
    #Схема вывода данных пользователю
    id_user: int
    nickname: str
    role: str
    prof_pic_link: Optional[str] = None
    class Config:
        from_attributes = True
#Схема вывода жанра
class GenreResponse(BaseModel):
    id_genre: int
    name: str
    name_ru: str

    class Config:
        from_attributes = True
#Схема вывода данных о режиссёре
class DirectorResponse(BaseModel):
    id_director: int
    first_name: str
    second_name: Optional[str] = None
    date_birth: Optional[date] = None
    date_death: Optional[date] = None
    director_photo: Optional[str] = None
    director_country: Optional[str] = None
    class Config:
        from_attributes = True
#Схема вывода данных о актёре
class ActorResponse(BaseModel):
    id_actor: int
    first_name: str
    second_name: str
    date_birth: Optional[date] = None
    date_death: Optional[date] = None
    actor_photo: Optional[str] = None
    actor_country: Optional[str] = None
    class Config:
        from_attributes = True
#Схема вывода данных о фильме
class MovieBase(BaseModel):
    id_movie: int
    title: str
    orig_title: str
    rus_title: Optional[str] = None
    release_date: date
    poster_url: Optional[str] = None
    length: int
    age_rating: str
    mood: str
    class Config:
        from_attributes = True
class GenreCreate(BaseModel):
    name: str
    name_ru: str
class GenreUpdate(BaseModel):
    name: str | None = None
    name_ru: str | None = None

#Схема вывода инфы о жанрах, актёрах и режиссёрах фильма
class MovieDetail(MovieBase):
    genres: List[GenreResponse] = []
    directors: List[DirectorResponse] = []
    actors: List[ActorResponse] = []
#Схема данных вывода инфы для статистики
class GenreStatsResponse(BaseModel):
    genre: str
    count: int
# АДМИН: ФИЛЬМЫ
class MovieCreate(BaseModel):
    # схема введённых данных о фильме
    title: str = Field(..., min_length=1, max_length=300)
    orig_title: str = Field(..., min_length=1, max_length=300)
    rus_title: Optional[str] = Field(None, max_length=300)
    release_date: date
    poster_url: Optional[str] = None
    length: int = Field(..., gt=0, le=1000)
    age_rating: str = Field(..., min_length=1, max_length=10)
    mood: str = Field(..., min_length=1, max_length=50)
class MovieUpdate(BaseModel):
    # Схема введённых данных для обновления фильма
    title: Optional[str] = Field(None, min_length=1, max_length=300)
    orig_title: Optional[str] = Field(None, min_length=1, max_length=300)
    rus_title: Optional[str] = Field(None, max_length=300)
    release_date: Optional[date] = None
    poster_url: Optional[str] = None
    length: Optional[int] = Field(None, gt=0, le=1000)
    age_rating: Optional[str] = Field(None, min_length=1, max_length=10)
    mood: Optional[str] = Field(None, min_length=1, max_length=50)
# АДМИН: РЕЖИССЁРЫ
class DirectorCreate(BaseModel):
    # Схема введённых данных для создания режиссёра
    first_name: str = Field(..., min_length=1, max_length=100)
    second_name: Optional[str] = Field(None, max_length=100)
    date_birth: Optional[date] = None
    date_death: Optional[date] = None
    director_photo: Optional[str] = None
    director_country: Optional[str] = Field(None, max_length=100)
class DirectorUpdate(BaseModel):
    # Схема введённых данных для обновления режиссёра
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    second_name: Optional[str] = Field(None, max_length=100)
    date_birth: Optional[date] = None
    date_death: Optional[date] = None
    director_photo: Optional[str] = None
    director_country: Optional[str] = Field(None, max_length=100)
# АДМИН: АКТЁРЫ
class ActorCreate(BaseModel):
    # Схема введённых данных для создания актёра
    first_name: str = Field(..., min_length=1, max_length=100)
    second_name: str = Field(..., min_length=1, max_length=100)
    date_birth: Optional[date] = None
    date_death: Optional[date] = None
    actor_photo: Optional[str] = None
    actor_country: Optional[str] = Field(None, max_length=100)
class ActorUpdate(BaseModel):
    # Схема введённых данных для обновления актёра
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    second_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_birth: Optional[date] = None
    date_death: Optional[date] = None
    actor_photo: Optional[str] = None
    actor_country: Optional[str] = Field(None, max_length=100)
# АДМИН: УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ
class UserRoleUpdate(BaseModel):
    # Сжема данных для изменения роли пользователя
    role: str = Field(..., pattern="^(user|admin)$")