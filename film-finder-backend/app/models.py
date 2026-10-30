#ОРМ модель базы данных
from sqlalchemy import Column, Integer, String, Float, Text, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base
#Таблица пользователей
class User(Base):
    __tablename__ = "users"
    id_user = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="user")
    prof_pic_link = Column(String, nullable=True)
    favourites = relationship("FavouriteMovie", back_populates="user")
#Таблица фильмов
class Movie(Base):
    __tablename__ = "movies"
    id_movie = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    orig_title = Column(String, nullable=False)
    rus_title = Column(String, nullable=True)
    release_date = Column(Date, nullable=False)
    poster_url = Column(String, nullable=True)
    length = Column(Integer, nullable=False)
    age_rating = Column(String, nullable=False)
    mood = Column(String, nullable=False)
    genres = relationship("Genre", secondary="genre_movies", back_populates="movies")
    directors = relationship("Director", secondary="directing", back_populates="movies")
    actors = relationship("Actor", secondary="acting", back_populates="movies")
    favourites = relationship("FavouriteMovie", back_populates="movie")
#Таблица жанров
class Genre(Base):
    __tablename__ = "genres"
    id_genre = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    name_ru = Column(String, nullable=False, unique=True)
    movies = relationship("Movie", secondary="genre_movies", back_populates="genres")
#Таблица режиссёров
class Director(Base):
    __tablename__ = "directors"
    id_director = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    second_name = Column(String, nullable=True)
    date_birth = Column(Date, nullable=True)
    date_death = Column(Date, nullable=True)
    director_photo = Column(String, nullable=True)
    director_country = Column(String, nullable=True)
    movies = relationship("Movie", secondary="directing", back_populates="directors")
#Таблица актёров
class Actor(Base):
    __tablename__ = "actors"
    id_actor = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    second_name = Column(String, nullable=False)
    date_birth = Column(Date, nullable=True)
    date_death = Column(Date, nullable=True)
    actor_photo = Column(String, nullable=True)
    actor_country = Column(String, nullable=True)
    movies = relationship("Movie", secondary="acting", back_populates="actors")
#Таблица жанров фильмов
class GenreMovie(Base):
    __tablename__ = "genre_movies"
    id_genre_movies = Column(Integer, primary_key=True)
    id_genre = Column(Integer, ForeignKey("genres.id_genre"), nullable=False)
    id_movie = Column(Integer, ForeignKey("movies.id_movie"), nullable=False)
#Таблица режиссёров фильма
class Directing(Base):
    __tablename__ = "directing"
    id_directing = Column(Integer, primary_key=True)
    id_movie = Column(Integer, ForeignKey("movies.id_movie"), nullable=False)
    id_director = Column(Integer, ForeignKey("directors.id_director"), nullable=False)
#Таблица актёров фильма
class Acting(Base):
    __tablename__ = "acting"
    id_acting = Column(Integer, primary_key=True)
    id_movie = Column(Integer, ForeignKey("movies.id_movie"), nullable=False)
    id_actor = Column(Integer, ForeignKey("actors.id_actor"), nullable=False)
#Таблица любимых фильмов пользователя
class FavouriteMovie(Base):
    __tablename__ = "favourite_movies"
    id_favourite_movies = Column(Integer, primary_key=True)
    id_movie = Column(Integer, ForeignKey("movies.id_movie"), nullable=False)
    id_user = Column(Integer, ForeignKey("users.id_user"), nullable=False)
    movie = relationship("Movie", back_populates="favourites")
    user = relationship("User", back_populates="favourites")