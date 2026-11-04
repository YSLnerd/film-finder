import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { isAdmin } from '../utils/useUser';
// Описываем структуры данных, приходящих с бекенда
interface Genre { id_genre: number; name_ru: string; }
interface Director { id_director: number; first_name: string; second_name: string | null; }
interface Actor { id_actor: number; first_name: string; second_name: string; }

interface MovieDetail {
  id_movie: number;
  rus_title: string;
  orig_title: string;
  release_date: string;
  length: number;
  age_rating: string;
  mood: string;
  poster_url: string | null;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
}

export default function MovieDetail() {
  //берём данные из адресной строки
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const admin = isAdmin();
  //В случае смены ID берём новые данные с бекенда
  useEffect(() => {
    if (!id) return;
    api.get(`/movies/${id}`)
      .then((res) => setMovie(res.data))
      .catch(() => setMovie(null))
      .finally(() => setLoading(false));
  }, [id]);
  //Функция удаления фильма
  const handleDelete = async () => {
    if (!window.confirm('Удалить фильм?')) return;
    try {
      await api.delete(`/admin/movies/${id}`);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления');
    }
  };
  //Пока данные грузятся, выводится черный экран с надписью
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><p className="text-white">Загрузка...</p></div>;
  //Если фильм с таким ID не нашелся (или сервер вернул ошибку), выводится текст
  if (!movie) return <div className="min-h-screen flex items-center justify-center bg-black"><p className="text-white">Фильм не найден</p></div>;

  return (
    <div
      //Внешний фон
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      {/* Кнопка Назад */}
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-6xl">
        <button onClick={() => navigate(-1)} className="text-white hover:text-indigo-300 mb-4">← Назад</button>
        {/* Колонка постера */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
            {movie.poster_url ? (
              <img src={movie.poster_url} alt={movie.rus_title} className="w-full aspect-[2/3] object-contain rounded bg-slate-700/30" />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-700 rounded flex items-center justify-center text-gray-400">Нет постера</div>
            )}
          </div>
          {/* Данные фильма */}
          <div className="lg:col-span-2 bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 space-y-3">
            <h1 className="text-2xl font-bold text-white mb-4">{movie.rus_title}</h1>
            {[
              { l: 'Оригинальное название', v: movie.orig_title },
              { l: 'Длительность', v: `${movie.length} мин` },
              { l: 'Возрастной рейтинг', v: movie.age_rating },
              { l: 'Дата выхода', v: movie.release_date },
              { l: 'Настроение', v: movie.mood },
            ].map((f) => (
              <div key={f.l} className="flex border-b border-gray-300 pb-2">
                <span className="w-1/2 text-sm text-gray-200">{f.l}</span>
                <span className="w-1/2 text-sm text-white font-semibold">{f.v}</span>
              </div>
            ))}
          </div>
          {/* Режиссёры */}
          <div className="space-y-4">
            <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Режиссёры</h3>
              {movie.directors.length === 0 ? <p className="text-sm text-gray-400">Нет данных</p> : (
                <ul className="text-sm text-white space-y-1">
                  {movie.directors.map((d) => (
                    <li
                      key={d.id_director}
                      onClick={() => navigate(`/persons/${d.id_director}?type=director`)}
                      className="hover:text-indigo-300 cursor-pointer"
                    >
                      • {d.first_name} {d.second_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Актёры */}
            <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Актёры</h3>
              {movie.actors.length === 0 ? <p className="text-sm text-gray-400">Нет данных</p> : (
                <ul className="text-sm text-white space-y-1 max-h-48 overflow-y-auto">
                  {movie.actors.map((a) => (
                    <li
                      key={a.id_actor}
                      onClick={() => navigate(`/persons/${a.id_actor}?type=actor`)}
                      className="hover:text-indigo-300 cursor-pointer"
                    >
                      • {a.first_name} {a.second_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Жанры */}
            <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-white mb-2">Жанры</h3>
              <div className="flex flex-wrap gap-2">
                {movie.genres.map((g) => (
                  <span key={g.id_genre} className="bg-indigo-700 text-white text-xs px-2 py-1 rounded">{g.name_ru}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Кнопки Удалить или Изменить для админа */}
        {admin && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate(`/admin/movies/${id}/edit`)}
              className="flex-1 bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold"
            >
              Изменить
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 font-semibold"
            >
              Удалить
            </button>
          </div>
        )}
      </div>
    </div>
  );
}