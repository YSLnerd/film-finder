import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Form {
  title: string;
  orig_title: string;
  rus_title: string;
  release_date: string;
  length: number;
  age_rating: string;
  mood: string;
  poster_url: string;
}

interface Director {
  id_director: number;
  first_name: string;
  second_name: string | null;
}

interface Actor {
  id_actor: number;
  first_name: string;
  second_name: string;
}

interface Genre {
  id_genre: number;
  name_ru: string;
}

export default function AdminMovieNew() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<Form>({
    title: '',
    orig_title: '',
    rus_title: '',
    release_date: '',
    length: 0,
    age_rating: '',
    mood: '',
    poster_url: '',
  });

  const [directors, setDirectors] = useState<Director[]>([]);
  const [actors, setActors] = useState<Actor[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);
  const [moods, setMoods] = useState<string[]>([]);

  // Связи текущего фильма
  const [linkedDirectors, setLinkedDirectors] = useState<number[]>([]);
  const [linkedActors, setLinkedActors] = useState<number[]>([]);
  const [linkedGenres, setLinkedGenres] = useState<number[]>([]);

  // Выбор для добавления
  const [selDirector, setSelDirector] = useState<number | ''>('');
  const [selActor, setSelActor] = useState<number | ''>('');
  const [selGenre, setSelGenre] = useState<number | ''>('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загрузка справочников
  useEffect(() => {
    const loadAll = async () => {
      try {
        const [r, m, a, d, g] = await Promise.all([
          api.get('/movies/age-ratings').catch(() => ({ data: [] })),
          api.get('/movies/moods').catch(() => ({ data: [] })),
          api.get('/movies/actors').catch(() => ({ data: [] })),
          api.get('/movies/directors').catch(() => ({ data: [] })),
          api.get('/movies/genres').catch(() => ({ data: [] })),
        ]);
        setRatings(r.data);
        setMoods(m.data);
        setActors(a.data);
        setDirectors(d.data);
        setGenres(g.data);
      } catch (err) {
        console.error('Ошибка загрузки справочников', err);
      }
    };
    loadAll();
  }, []);

  // Если редактируем — загружаем фильм
  useEffect(() => {
    if (!isEdit || !id) {
      setLoading(false);
      return;
    }

    api
      .get(`/movies/${id}`)
      .then((res) => {
        const m = res.data;
        setForm({
          title: m.title || '',
          orig_title: m.orig_title || '',
          rus_title: m.rus_title || '',
          release_date: m.release_date || '',
          length: m.length || 0,
          age_rating: m.age_rating || '',
          mood: m.mood || '',
          poster_url: m.poster_url || '',
        });
        setLinkedDirectors(m.directors?.map((d: any) => d.id_director) || []);
        setLinkedActors(m.actors?.map((a: any) => a.id_actor) || []);
        setLinkedGenres(m.genres?.map((g: any) => g.id_genre) || []);
      })
      .catch(() => setError('Не удалось загрузить фильм'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (field: keyof Form, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const addDirector = () => {
    if (selDirector === '') return;
    if (linkedDirectors.includes(selDirector)) return;
    setLinkedDirectors([...linkedDirectors, selDirector]);
    setSelDirector('');
  };
  const removeDirector = (did: number) => {
    setLinkedDirectors(linkedDirectors.filter((x) => x !== did));
  };

  const addActor = () => {
    if (selActor === '') return;
    if (linkedActors.includes(selActor)) return;
    setLinkedActors([...linkedActors, selActor]);
    setSelActor('');
  };
  const removeActor = (aid: number) => {
    setLinkedActors(linkedActors.filter((x) => x !== aid));
  };

  const addGenre = () => {
    if (selGenre === '') return;
    if (linkedGenres.includes(selGenre)) return;
    setLinkedGenres([...linkedGenres, selGenre]);
    setSelGenre('');
  };
  const removeGenre = (gid: number) => {
    setLinkedGenres(linkedGenres.filter((x) => x !== gid));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.title.trim() || !form.orig_title.trim() || !form.rus_title.trim()) {
      setError('Заполните все три названия');
      return;
    }
    if (!form.release_date) {
      setError('Укажите дату выхода');
      return;
    }
    if (form.length <= 0) {
      setError('Длительность должна быть больше 0');
      return;
    }
    if (!form.age_rating || !form.mood) {
      setError('Выберите рейтинг и настроение');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        orig_title: form.orig_title.trim(),
        rus_title: form.rus_title.trim(),
        release_date: form.release_date,
        length: Number(form.length),
        age_rating: form.age_rating,
        mood: form.mood,
        poster_url: form.poster_url.trim() || null,
      };

      let movieId: number;

      if (isEdit && id) {
        await api.put(`/admin/movies/${id}`, payload);
        movieId = Number(id);
        setSuccess('Изменения сохранены');
      } else {
        const res = await api.post('/admin/movies', payload);
        movieId = res.data.id_movie;
        setSuccess(`Фильм создан #${movieId}`);
      }

      // Привязка режиссёров
      for (const did of linkedDirectors) {
        try { await api.post(`/admin/movies/${movieId}/directors/${did}`); } catch {}
      }

      // Привязка актёров
      for (const aid of linkedActors) {
        try { await api.post(`/admin/movies/${movieId}/actors/${aid}`); } catch {}
      }

      // Привязка жанров
      for (const gid of linkedGenres) {
        try { await api.post(`/admin/movies/${movieId}/genres/${gid}`); } catch {}
      }

      setTimeout(() => navigate(`/movies/${movieId}`), 800);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Ошибка');
      } else {
        setError(detail || 'Ошибка сохранения');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-lg">Загрузка...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-6xl">
        <button onClick={() => navigate(-1)} className="text-white hover:text-indigo-300 mb-4">
          ← Назад
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          {isEdit ? 'Изменить фильм' : 'Добавить фильм'}
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-3 text-center text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-600 text-white p-2 rounded mb-3 text-center text-sm">{success}</div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Постер */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4 space-y-3">
            {form.poster_url ? (
              <img
                src={form.poster_url}
                alt="Постер"
                className="w-full aspect-[2/3] object-contain rounded bg-slate-700/30"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-700 rounded flex items-center justify-center text-gray-400">
                Нет постера
              </div>
            )}

            <input
              type="text"
              placeholder="Ссылка на постер"
              value={form.poster_url}
              onChange={(e) => handleChange('poster_url', e.target.value)}
              className="w-full p-2 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-700 bg-transparent"
            />
          </div>

          {/* Данные */}
          <div className="lg:col-span-3 bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm text-gray-200 mb-1">Название (ориг.) *</label>
                <input type="text" value={form.title} onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Оригинальное название *</label>
                <input type="text" value={form.orig_title} onChange={(e) => handleChange('orig_title', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Русское название *</label>
                <input type="text" value={form.rus_title} onChange={(e) => handleChange('rus_title', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-gray-200 mb-1">Дата выхода *</label>
                <input type="date" value={form.release_date} onChange={(e) => handleChange('release_date', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Длительность (мин) *</label>
                <input type="number" value={form.length} onChange={(e) => handleChange('length', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required />
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Рейтинг *</label>
                <select value={form.age_rating} onChange={(e) => handleChange('age_rating', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required>
                  <option value="" className="text-black">— выбрать —</option>
                  {ratings.map((r) => <option key={r} value={r} className="text-black">{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-200 mb-1">Настроение *</label>
                <select value={form.mood} onChange={(e) => handleChange('mood', e.target.value)}
                  className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700" required>
                  <option value="" className="text-black">— выбрать —</option>
                  {moods.map((m) => <option key={m} value={m} className="text-black">{m}</option>)}
                </select>
              </div>
            </div>

            {/* ЖАНРЫ */}
            <div className="border-t border-gray-300 pt-3">
              <h3 className="text-white font-semibold mb-2">Жанры</h3>
              <div className="flex gap-2 mb-2">
                <select value={selGenre} onChange={(e) => setSelGenre(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700">
                  <option value="" className="text-black">— выбрать жанр —</option>
                  {genres.map((g) => <option key={g.id_genre} value={g.id_genre} className="text-black">{g.name_ru}</option>)}
                </select>
                <button type="button" onClick={addGenre}
                  className="bg-indigo-700 text-white px-4 rounded-lg hover:bg-indigo-800 font-bold">+</button>
              </div>
              {linkedGenres.length === 0 ? (
                <p className="text-gray-400 text-sm">Нет жанров</p>
              ) : (
                <ul className="space-y-1">
                  {linkedGenres.map((gid) => {
                    const g = genres.find((x) => x.id_genre === gid);
                    return (
                      <li key={gid} className="flex justify-between items-center bg-slate-700/50 rounded px-2 py-1">
                        <span className="text-white text-sm">• {g ? g.name_ru : `ID ${gid}`}</span>
                        <button type="button" onClick={() => removeGenre(gid)}
                          className="text-red-400 hover:text-red-300 text-xs">Удалить</button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* РЕЖИССЁРЫ */}
            <div className="border-t border-gray-300 pt-3">
              <h3 className="text-white font-semibold mb-2">Режиссёры</h3>
              <div className="flex gap-2 mb-2">
                <select value={selDirector} onChange={(e) => setSelDirector(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700">
                  <option value="" className="text-black">— выбрать режиссёра —</option>
                  {directors.map((d) => <option key={d.id_director} value={d.id_director} className="text-black">{d.first_name} {d.second_name || ''}</option>)}
                </select>
                <button type="button" onClick={addDirector}
                  className="bg-indigo-700 text-white px-4 rounded-lg hover:bg-indigo-800 font-bold">+</button>
              </div>
              {linkedDirectors.length === 0 ? (
                <p className="text-gray-400 text-sm">Нет режиссёров</p>
              ) : (
                <ul className="space-y-1">
                  {linkedDirectors.map((did) => {
                    const d = directors.find((x) => x.id_director === did);
                    return (
                      <li key={did} className="flex justify-between items-center bg-slate-700/50 rounded px-2 py-1">
                        <span className="text-white text-sm">• {d ? `${d.first_name} ${d.second_name || ''}` : `ID ${did}`}</span>
                        <button type="button" onClick={() => removeDirector(did)}
                          className="text-red-400 hover:text-red-300 text-xs">Удалить</button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* АКТЁРЫ */}
            <div className="border-t border-gray-300 pt-3">
              <h3 className="text-white font-semibold mb-2">Актёры</h3>
              <div className="flex gap-2 mb-2">
                <select value={selActor} onChange={(e) => setSelActor(e.target.value ? Number(e.target.value) : '')}
                  className="flex-1 p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700">
                  <option value="" className="text-black">— выбрать актёра —</option>
                  {actors.map((a) => <option key={a.id_actor} value={a.id_actor} className="text-black">{a.first_name} {a.second_name}</option>)}
                </select>
                <button type="button" onClick={addActor}
                  className="bg-indigo-700 text-white px-4 rounded-lg hover:bg-indigo-800 font-bold">+</button>
              </div>
              {linkedActors.length === 0 ? (
                <p className="text-gray-400 text-sm">Нет актёров</p>
              ) : (
                <ul className="space-y-1 max-h-48 overflow-y-auto">
                  {linkedActors.map((aid) => {
                    const a = actors.find((x) => x.id_actor === aid);
                    return (
                      <li key={aid} className="flex justify-between items-center bg-slate-700/50 rounded px-2 py-1">
                        <span className="text-white text-sm">• {a ? `${a.first_name} ${a.second_name}` : `ID ${aid}`}</span>
                        <button type="button" onClick={() => removeActor(aid)}
                          className="text-red-400 hover:text-red-300 text-xs">Удалить</button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <button type="submit" disabled={saving}
              className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold disabled:bg-gray-500 mt-2">
              {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Добавить фильм'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}