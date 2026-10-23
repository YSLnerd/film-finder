import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { isAdmin } from '../hooks/useUser';

interface User {
  id_user: number;
  nickname: string;
  role: string;
  prof_pic_link: string | null;
}

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [photoUrl, setPhotoUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [searchNick, setSearchNick] = useState('');
  const [searchError, setSearchError] = useState('');

  const admin = isAdmin();

  // Загрузка профиля
  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data);
        setPhotoUrl(res.data.prof_pic_link || '');
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  // Сохранить фото
  const handleSavePhoto = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put('/auth/me/photo', { prof_pic_link: photoUrl });
      setUser((prev) =>
        prev ? { ...prev, prof_pic_link: res.data.prof_pic_link } : prev
      );
      setSuccess('Фото сохранено');
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail[0]?.msg || 'Ошибка сохранения');
      } else {
        setError(detail || 'Ошибка сохранения');
      }
    } finally {
      setSaving(false);
    }
  };

  // Поиск пользователя
  const handleSearchUser = async () => {
    setSearchError('');
    if (!searchNick.trim()) {
      setSearchError('Введите никнейм');
      return;
    }

    try {
      const res = await api.get('/admin/users');
      const found = res.data.find(
        (u: any) => u.nickname === searchNick.trim()
      );

      if (found) {
        navigate(`/admin/users/${found.id_user}`);
      } else {
        setSearchError('Пользователь не найден');
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.detail || 'Ошибка поиска');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-lg">Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-white text-lg">Не удалось загрузить профиль</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-6xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Профиль
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Фото + ссылка */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4 space-y-3">
            {user.prof_pic_link ? (
              <img
                src={user.prof_pic_link}
                alt={user.nickname}
                className="w-full aspect-[2/3] object-cover rounded"
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
              placeholder="Вставьте ссылку на фото"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full p-2 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg text-sm focus:outline-none focus:border-indigo-700 bg-transparent"
            />

            {error && (
              <div className="bg-red-500 text-white p-2 rounded text-center text-xs">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-600 text-white p-2 rounded text-center text-xs">
                {success}
              </div>
            )}

            <button
              onClick={handleSavePhoto}
              disabled={saving}
              className="w-full bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold text-sm disabled:bg-gray-500"
            >
              {saving ? 'Сохранение...' : 'Сохранить фото'}
            </button>
          </div>

          {/* Данные */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-6 space-y-3">
            {[
              { l: 'ID', v: user.id_user },
              { l: 'Никнейм', v: user.nickname },
              { l: 'Роль', v: user.role },
            ].map((f) => (
              <div key={f.l} className="flex border-b border-gray-300 pb-2">
                <span className="w-1/2 text-sm text-gray-200">{f.l}</span>
                <span className="w-1/2 text-sm text-white font-semibold">
                  {f.v}
                </span>
              </div>
            ))}
          </div>

          {/* Админ-панель */}
          {admin && (
            <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4 space-y-3">
              <h3 className="font-semibold text-white mb-2">Админ-панель</h3>

              <Link
                to="/admin/genres"
                className="block w-full text-center bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold"
              >
                Жанры
              </Link>

              <Link
                to="/admin/movies/new"
                className="block w-full text-center bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold"
              >
                Добавить фильм
              </Link>

              <Link
                to="/admin/directors/new"
                className="block w-full text-center bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold"
              >
                Добавить режиссёра
              </Link>

              <Link
                to="/admin/actors/new"
                className="block w-full text-center bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold"
              >
                Добавить актёра
              </Link>

              {/* Поиск пользователя */}
              <div className="border-t border-gray-300 pt-3 mt-3">
                <p className="text-xs text-gray-200 mb-2">Поиск пользователя</p>

                <input
                  type="text"
                  placeholder="Введите никнейм"
                  value={searchNick}
                  onChange={(e) => setSearchNick(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                  className="w-full p-2 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg mb-2 text-sm focus:outline-none focus:border-indigo-700 bg-transparent"
                />

                <button
                  onClick={handleSearchUser}
                  className="block w-full text-center bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold text-sm"
                >
                  Найти пользователя
                </button>

                {searchError && (
                  <div className="bg-red-500 text-white p-1 rounded text-center text-xs mt-2">
                    {searchError}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}