import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

type Tab = 'movies' | 'actors' | 'directors';

interface Movie {
  id_movie: number;
  rus_title: string;
  orig_title: string;
  release_date: string;
  poster_url: string | null;
}

interface Person {
  id_actor?: number;
  id_director?: number;
  first_name: string;
  second_name: string;
  date_birth: string | null;
  actor_photo?: string | null;
  director_photo?: string | null;
}

export default function Search() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('movies');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await api.get(`/search/${tab}`, { params: { query } });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    setQuery('');
    setResults([]);
    setSearched(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Поиск</h1>

        {/* Вкладки */}
        <div className="flex gap-2 mb-4 justify-center">
          {[
            { key: 'movies', label: 'Фильмы' },
            { key: 'actors', label: 'Актёры' },
            { key: 'directors', label: 'Режиссёры' },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key as Tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                tab === t.key
                  ? 'bg-indigo-700 text-white'
                  : 'bg-transparent border-2 border-gray-200 text-white hover:bg-slate-600'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Поле поиска */}
        <input
          type="text"
          placeholder={`Введите ${
            tab === 'movies' ? 'название фильма' : tab === 'actors' ? 'имя актёра' : 'имя режиссёра'
          }`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full p-3 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg mb-4 focus:outline-none focus:border-indigo-700"
        />

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold disabled:bg-gray-500 mb-4"
        >
          {loading ? 'Ищем...' : 'Найти'}
        </button>

        {/* Результаты */}
        <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
          {!searched && (
            <p className="text-white text-center mt-20">
              Введите запрос и нажмите «Найти»
            </p>
          )}

          {searched && results.length === 0 && !loading && (
            <p className="text-white text-center mt-20">
              Ничего не найдено
            </p>
          )}

          {tab === 'movies' && results.map((movie: Movie) => (
            <div
              key={movie.id_movie}
              onClick={() => navigate(`/movies/${movie.id_movie}`)}
              className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 mb-2 cursor-pointer flex gap-3"
            >
              {movie.poster_url && (
                <img
                  src={movie.poster_url}
                  alt={movie.rus_title}
                  className="w-16 h-24 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-white">{movie.rus_title}</h3>
                <p className="text-sm text-gray-300">{movie.orig_title}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {movie.release_date?.split('-')[0]}
                </p>
              </div>
            </div>
          ))}

          {(tab === 'actors' || tab === 'directors') && results.map((person: Person) => {
            const id = tab === 'actors' ? person.id_actor : person.id_director;
            const photo = tab === 'actors' ? person.actor_photo : person.director_photo;
            const type = tab === 'actors' ? 'actor' : 'director';

            return (
              <div
                key={id}
                onClick={() => navigate(`/persons/${id}?type=${type}`)}
                className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-3 mb-2 cursor-pointer flex gap-3"
              >
                {photo && (
                  <img
                    src={photo}
                    alt={person.first_name}
                    className="w-16 h-20 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-white">
                    {person.first_name} {person.second_name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {person.date_birth || '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}