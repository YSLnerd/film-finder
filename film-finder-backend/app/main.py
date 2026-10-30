#Точка входа в программу
from fastapi import FastAPI
#Нужно для связи фронта и бека на разных портах
from fastapi.middleware.cors import CORSMiddleware
#Импорт роутеров
from app.routers import auth, movies, search, favourites, stats, admin

#Главный класс
app = FastAPI(
    title="Film Finder API",
    description="API для сервиса подбора фильмов",
    version="0.1.0"
)
#Настройка для того чтобы мобильный клиент и веб сайт могли обмениваться с бекэндом
app.add_middleware(
    CORSMiddleware,
    #Любые адреса могут отправлять запросы на бекенд
    allow_origins=["*"],
    #разрешение на передачу учётных данных
    allow_credentials=True,
    #Разрешение на все HTTP методы
    allow_methods=["*"],
    #Разрешает все заголовки
    allow_headers=["*"],
)
#Подключение роутеров
app.include_router(auth.router)
app.include_router(movies.router)
app.include_router(search.router)
app.include_router(favourites.router)
app.include_router(stats.router)
app.include_router(admin.router)


@app.get("/")
def root():
    return {"message": "Film Finder API работает", "docs": "/docs"}