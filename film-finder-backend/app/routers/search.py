from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from app.database import get_db
from app.models import Movie, Actor, Director
from app.schemas import MovieShort, ActorResponse, DirectorResponse


router = APIRouter(prefix="/search", tags=["search"])

# Поиск фильмов
@router.get("/movies", response_model=list[MovieShort])
def search_movies(
    query: str = Query(..., min_length=1, description="Название фильма (рус/ориг)"),
    limit: int = Query(30, ge=1, le=100, description="Максимум результатов"),
    db: Session = Depends(get_db)
):
    pattern = f"%{query}%"
    return (
        db.query(Movie)
        .filter(
            or_(
                Movie.rus_title.ilike(pattern),
                Movie.orig_title.ilike(pattern),
                Movie.title.ilike(pattern)
            )
        )
        .order_by(Movie.rus_title)
        .limit(limit)
        .all()
    )

# Поиск актёров
@router.get("/actors", response_model=list[ActorResponse])
def search_actors(
    query: str = Query(..., min_length=1, description="Имя или фамилия актёра"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    clean_query = query.strip()
    pattern = f"%{clean_query}%"
    
    # Склеиваем имя и фамилию в оба порядка
    full_name_1 = func.concat(Actor.first_name, ' ', Actor.second_name)
    full_name_2 = func.concat(Actor.second_name, ' ', Actor.first_name)

    return (
        db.query(Actor)
        .filter(
            or_(
                Actor.first_name.ilike(pattern),
                Actor.second_name.ilike(pattern),
                full_name_1.ilike(pattern),
                full_name_2.ilike(pattern),
                # Нечёткий поиск через pg_trgm (порог 0.2 отсекает совсем нерелевантное)
                func.similarity(full_name_1, clean_query) > 0.2
            )
        )
        .order_by(
            # Сначала самые похожие друг к другу результаты
            func.similarity(full_name_1, clean_query).desc(),
            Actor.first_name, 
            Actor.second_name
        )
        .limit(limit)
        .all()
    )

# Поиск режиссёров
@router.get("/directors", response_model=list[DirectorResponse])
def search_directors(
    query: str = Query(..., min_length=1, description="Имя или фамилия режиссёра"),
    limit: int = Query(30, ge=1, le=100),
    db: Session = Depends(get_db)
):
    clean_query = query.strip()
    pattern = f"%{clean_query}%"
    
    full_name_1 = func.concat(Director.first_name, ' ', Director.second_name)
    full_name_2 = func.concat(Director.second_name, ' ', Director.first_name)

    return (
        db.query(Director)
        .filter(
            or_(
                Director.first_name.ilike(pattern),
                Director.second_name.ilike(pattern),
                full_name_1.ilike(pattern),
                full_name_2.ilike(pattern),
                func.similarity(full_name_1, clean_query) > 0.2
            )
        )
        .order_by(
            func.similarity(full_name_1, clean_query).desc(),
            Director.first_name, 
            Director.second_name
        )
        .limit(limit)
        .all()
    )