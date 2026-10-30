from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FavouriteMovie, Movie
from app.schemas import MovieBase
from app.dependencies import get_current_user
router = APIRouter(prefix="/favourites", tags=["favourites"])

#Отвечает за получение избранных фильмов пользователя
@router.get("/", response_model=list[MovieBase])
def get_favourites(
    #Получение текущего пользователя
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    #Собираем записи- фильмы, подобранные пользователем
    favourites = (
        db.query(FavouriteMovie)
        .filter(FavouriteMovie.id_user == current_user_id)
        .all()
    )
    #Собираем айдишники фильмов в список
    movie_ids = [f.id_movie for f in favourites]
    if not movie_ids:
        return []
    #Возвращаем ID фильмов из базы, сортируя по алфавиту
    movies = (
        db.query(Movie)
        .filter(Movie.id_movie.in_(movie_ids))
        .order_by(Movie.rus_title)
        .all()
    )
    return movies

#Добавление в Избранное
@router.post("/{movie_id}", status_code=status.HTTP_201_CREATED)
def add_to_favourites(
    movie_id: int,
    #Проверяем текущего пользователя
    current_user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    #проверяем фильм в базе
    movie = db.query(Movie).filter(Movie.id_movie == movie_id).first()
    if not movie:
        raise HTTPException(404, "Фильм не найден")
    #Если связь уже есть, не добавляем
    existing = (
        db.query(FavouriteMovie)
        .filter(
            FavouriteMovie.id_movie == movie_id,
            FavouriteMovie.id_user == current_user_id
        )
        .first()
    )
    if existing:
        raise HTTPException(400, "Фильм уже в избранном")
    #В ином случае добавляем
    favourite = FavouriteMovie(
        id_movie=movie_id,
        id_user=current_user_id
    )
    db.add(favourite)
    db.commit()
    return {
        "message": "Фильм добавлен в избранное",
        "id_movie": movie_id
    }