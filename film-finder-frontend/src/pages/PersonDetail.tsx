import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { isAdmin } from '../hooks/useUser';

interface Movie { id_movie: number; rus_title: string; }
interface Person {
  id_actor?: number;
  id_director?: number;
  first_name: string;
  second_name: string | null;
  date_birth: string | null;
  date_death: string | null;
  actor_photo?: string | null;
  director_photo?: string | null;
  actor_country?: string | null;
  director_country?: string | null;
  movies: Movie[];
}

export default function PersonDetail() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [person, setPerson] = useState<Person | null>(null);
  const [type, setType] = useState<'actor' | 'director' | null>(null);
  const [loading, setLoading] = useState(true);
  const admin = isAdmin();

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    const typeParam = searchParams.get('type');

    if (typeParam === 'actor') {
      api.get(`/movies/actors/${id}`)
        .then((res) => { setPerson(res.data); setType('actor'); })
        .catch(() => setPerson(null))
        .finally(() => setLoading(false));
    } else if (typeParam === 'director') {
      api.get(`/movies/directors/${id}`)
        .then((res) => { setPerson(res.data); setType('director'); })
        .catch(() => setPerson(null))
        .finally(() => setLoading(false));
    } else {
      // Fallback — если нет параметра, пробуем сначала актёра
      api.get(`/movies/actors/${id}`)
        .then((res) => { setPerson(res.data); setType('actor'); })
        .catch(() =>
          api.get(`/movies/directors/${id}`)
            .then((res) => { setPerson(res.data); setType('director'); })
            .catch(() => setPerson(null))
        )
        .finally(() => setLoading(false));
    }
  }, [id, searchParams]);

  const handleDelete = async () => {
    if (!window.confirm('Удалить?')) return;
    const url = type === 'actor' ? `/admin/actors/${id}` : `/admin/directors/${id}`;
    try {
      await api.delete(url);
      navigate('/');
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Ошибка удаления');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><p className="text-white">Загрузка...</p></div>;
  if (!person) return <div className="min-h-screen flex items-center justify-center bg-black"><p className="text-white">Человек не найден</p></div>;

  const photo = type === 'actor' ? person.actor_photo : person.director_photo;
  const country = type === 'actor' ? person.actor_country : person.director_country;

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-6xl">
        <button onClick={() => navigate(-1)} className="text-white hover:text-indigo-300 mb-4">← Назад</button>

        <h1 className="text-2xl font-bold text-white mb-6">
          {type === 'actor' ? 'Актёр' : 'Режиссёр'}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
            {photo ? (
              <img src={photo} alt={person.first_name} className="w-full aspect-[2/3] object-contain rounded bg-slate-700/30" />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-700 rounded flex items-center justify-center text-gray-400">Нет фото</div>
            )}
          </div>

          <div className="lg:col-span-2 bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 space-y-3">
            <h2 className="text-xl font-bold text-white mb-4">
              {person.first_name} {person.second_name || ''}
            </h2>
            {[
              { l: 'Дата рождения', v: person.date_birth || '—' },
              { l: 'Дата смерти', v: person.date_death || '—' },
              { l: 'Страна', v: country || '—' },
            ].map((f) => (
              <div key={f.l} className="flex border-b border-gray-300 pb-2">
                <span className="w-1/2 text-sm text-gray-200">{f.l}</span>
                <span className="w-1/2 text-sm text-white font-semibold">{f.v}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Фильмы ({person.movies.length})</h3>
            {person.movies.length === 0 ? <p className="text-sm text-gray-400">Нет данных</p> : (
              <ul className="text-sm text-white space-y-1 max-h-80 overflow-y-auto">
                {person.movies.map((m) => (
                  <li
                    key={m.id_movie}
                    onClick={() => navigate(`/movies/${m.id_movie}`)}
                    className="hover:text-indigo-300 cursor-pointer"
                  >
                    • {m.rus_title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {admin && (
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => navigate(`/admin/${type === 'actor' ? 'actors' : 'directors'}/${id}/edit`)}
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