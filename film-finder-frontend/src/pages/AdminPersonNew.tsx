import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Form {
  first_name: string;
  second_name: string;
  date_birth: string;
  date_death: string;
  country: string;
  photo: string;
}

export default function AdminPersonNew() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Определяем тип по URL
  const isDirector = location.pathname.includes('directors');
  const isActor = location.pathname.includes('actors');
  const isEdit = !!id;

  const type = isDirector ? 'director' : 'actor';
  const typeName = isDirector ? 'режиссёра' : 'актёра';
  const apiUrl = isDirector ? 'directors' : 'actors';

  const [form, setForm] = useState<Form>({
    first_name: '',
    second_name: '',
    date_birth: '',
    date_death: '',
    country: '',
    photo: '',
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Если редактируем — загружаем данные
  useEffect(() => {
    if (!isEdit || !id) return;

    const url = isDirector ? `/movies/directors/${id}` : `/movies/actors/${id}`;

    api
      .get(url)
      .then((res) => {
        const d = res.data;
        setForm({
          first_name: d.first_name || '',
          second_name: d.second_name || '',
          date_birth: d.date_birth || '',
          date_death: d.date_death || '',
          country: isDirector ? d.director_country || '' : d.actor_country || '',
          photo: isDirector ? d.director_photo || '' : d.actor_photo || '',
        });
      })
      .catch(() => setError('Не удалось загрузить данные'))
      .finally(() => setLoading(false));
  }, [id, isEdit, isDirector]);

  const handleChange = (field: keyof Form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.first_name.trim()) {
      setError('Введите имя');
      return;
    }

    setSaving(true);
    try {
      // Формируем данные под схему бэкенда
      const payload: any = isDirector
        ? {
            first_name: form.first_name.trim(),
            second_name: form.second_name.trim() || null,
            date_birth: form.date_birth || null,
            date_death: form.date_death || null,
            director_country: form.country.trim() || null,
            director_photo: form.photo.trim() || null,
          }
        : {
            first_name: form.first_name.trim(),
            second_name: form.second_name.trim(),
            date_birth: form.date_birth || null,
            date_death: form.date_death || null,
            actor_country: form.country.trim() || null,
            actor_photo: form.photo.trim() || null,
          };

      if (isEdit && id) {
        await api.put(`/admin/${apiUrl}/${id}`, payload);
        setSuccess('Изменения сохранены');
        setTimeout(() => navigate(-1), 800);
      } else {
        const res = await api.post(`/admin/${apiUrl}`, payload);
        setSuccess(`Создан ${typeName} #${res.data.id_actor || res.data.id_director}`);
        setForm({
          first_name: '',
          second_name: '',
          date_birth: '',
          date_death: '',
          country: '',
          photo: '',
        });
      }
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
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-indigo-300 mb-4"
        >
          ← Назад
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          {isEdit ? 'Изменить' : 'Добавить'} {typeName}
        </h1>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-3 text-center text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-600 text-white p-2 rounded mb-3 text-center text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Фото */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4 space-y-3">
            {form.photo ? (
              <img
                src={form.photo}
                alt="Фото"
                className="w-full aspect-[2/3] object-contain rounded bg-slate-700/30"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-700 rounded flex items-center justify-center text-gray-400">
                Нет фото
              </div>
            )}

            <input
              type="text"
              placeholder="Ссылка на фото"
              value={form.photo}
              onChange={(e) => handleChange('photo', e.target.value)}
              className="w-full p-2 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-700 bg-transparent"
            />
          </div>

          {/* Поля */}
          <div className="lg:col-span-2 bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 space-y-3">
            <div>
              <label className="block text-sm text-gray-200 mb-1">
                Имя *
              </label>
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-200 mb-1">
                Фамилия
              </label>
              <input
                type="text"
                value={form.second_name}
                onChange={(e) => handleChange('second_name', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Дата рождения
                </label>
                <input
                  type="date"
                  value={form.date_birth}
                  onChange={(e) => handleChange('date_birth', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-200 mb-1">
                  Дата смерти
                </label>
                <input
                  type="date"
                  value={form.date_death}
                  onChange={(e) => handleChange('date_death', e.target.value)}
                  className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-200 mb-1">
                Страна
              </label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold disabled:bg-gray-500"
            >
              {saving ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Добавить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}