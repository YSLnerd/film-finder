import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Genre {
  id_genre: number;
  name_ru: string;
}

interface Movie {
  id_movie: number;
  rus_title: string;
  orig_title: string;
  release_date: string;
  length: number;
  age_rating: string;
  poster_url: string | null;
}

export default function Home() {
  const navigate = useNavigate();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [moods, setMoods] = useState<string[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);

  const [genre, setGenre] = useState('');
  const [length, setLength] = useState('');
  const [mood, setMood] = useState('');
  const [period, setPeriod] = useState('');
  const [rating, setRating] = useState('');

  const [movie, setMovie] = useState<Movie | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/movies/genres').then((res) => setGenres(res.data));
    api.get('/movies/moods').then((res) => setMoods(res.data));
    api.get('/movies/age-ratings').then((res) => setRatings(res.data));
  }, []);

  const handleFind = async () => {
    setError('');
    setMovie(null);

    if (!genre || !mood || !rating) {
      setError('Заполните жанр, настроение и возрастной рейтинг');
      return;
    }

    setLoading(true);
    try {
      const params: any = { genre, mood, age_rating: rating };
      if (length) params.duration = length;
      if (period) params.year_period = period;

      const res = await api.get('/movies/recommend', { params });
      setMovie(res.data);

      // Автосохранение в избранное — для статистики
      api.post(`/favourites/${res.data.id_movie}`).catch(() => {});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Фильм не найден');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Подбор фильма
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Форма */}
          <div className="space-y-4">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
            >
              <option value="" className="text-black">Выберите жанр</option>
              {genres.map((g) => (
                <option key={g.id_genre} value={g.name_ru} className="text-black">
                  {g.name_ru}
                </option>
              ))}
            </select>

            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
            >
              <option value="" className="text-black">Выберите длительность</option>
              <option value="0-90" className="text-black">До 90 минут</option>
              <option value="90-120" className="text-black">90-120 минут</option>
              <option value="120-150" className="text-black">120-150 минут</option>
              <option value="150-500" className="text-black">Более 150 минут</option>
            </select>

            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
            >
              <option value="" className="text-black">Выберите настроение</option>
              {moods.map((m) => (
                <option key={m} value={m} className="text-black">{m}</option>
              ))}
            </select>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
            >
              <option value="" className="text-black">Выберите период выхода</option>
              <option value="2020-2026" className="text-black">2020-2026</option>
              <option value="2010-2019" className="text-black">2010-2019</option>
              <option value="2000-2009" className="text-black">2000-2009</option>
              <option value="1800-1999" className="text-black">До 2000</option>
            </select>

            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
            >
              <option value="" className="text-black">Выберите возрастной рейтинг</option>
              {ratings.map((r) => (
                <option key={r} value={r} className="text-black">{r}</option>
              ))}
            </select>

            {error && (
              <div className="bg-red-500 text-white p-2 rounded text-center text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleFind}
              disabled={loading}
              className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold disabled:bg-gray-500"
            >
              {loading ? 'Ищем...' : 'Найти'}
            </button>
          </div>

          {/* Результат */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[400px]">
            {movie ? (
              <div className="text-center w-full">
                {movie.poster_url ? (
                  <img
                    src={movie.poster_url}
                    alt={movie.rus_title}
                    className="w-48 h-72 object-cover rounded-lg shadow-lg mx-auto mb-4"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-48 h-72 bg-slate-700 rounded-lg flex items-center justify-center mx-auto mb-4 text-gray-400">
                    Нет постера
                  </div>
                )}

                <h2 className="text-2xl font-bold text-white mb-2">
                  {movie.rus_title}
                </h2>
                <p className="text-gray-300 mb-1">{movie.orig_title}</p>
                <p className="text-sm text-gray-400 mb-4">
                  {movie.release_date?.split('-')[0]} • {movie.length} мин • {movie.age_rating}
                </p>

                <button
                  onClick={() => navigate(`/movies/${movie.id_movie}`)}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Подробнее
                </button>
              </div>
            ) : (
              <p className="text-white text-center">
                Здесь появится постер и название подобранного фильма
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}