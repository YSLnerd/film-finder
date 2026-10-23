import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

interface Genre {
  id_genre: number;
  name: string;
  name_ru: string;
}

export default function AdminGenres() {
  const navigate = useNavigate();

  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  // Поля для нового жанра
  const [newName, setNewName] = useState('');
  const [newNameRu, setNewNameRu] = useState('');

  // Редактирование
  const [editing, setEditing] = useState<Genre | null>(null);
  const [editName, setEditName] = useState('');
  const [editNameRu, setEditNameRu] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Загрузка жанров
  const loadGenres = () => {
    api
      .get('/movies/genres')
      .then((res) => setGenres(res.data))
      .catch(() => setGenres([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGenres();
  }, []);

  // Добавить жанр
  const handleAdd = async () => {
    setError('');
    setSuccess('');

    if (!newName.trim() || !newNameRu.trim()) {
      setError('Заполните оба поля');
      return;
    }

    try {
      await api.post('/admin/genres', {
        name: newName.trim(),
        name_ru: newNameRu.trim(),
      });
      setNewName('');
      setNewNameRu('');
      setSuccess('Жанр добавлен');
      loadGenres();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка добавления');
    }
  };

  // Начать редактирование
  const startEdit = (genre: Genre) => {
    setEditing(genre);
    setEditName(genre.name);
    setEditNameRu(genre.name_ru);
    setError('');
    setSuccess('');
  };

  // Сохранить редактирование
  const handleSaveEdit = async () => {
    if (!editing) return;
    setError('');
    setSuccess('');

    if (!editName.trim() || !editNameRu.trim()) {
      setError('Заполните оба поля');
      return;
    }

    try {
      await api.put(`/admin/genres/${editing.id_genre}`, {
        name: editName.trim(),
        name_ru: editNameRu.trim(),
      });
      setEditing(null);
      setSuccess('Жанр обновлён');
      loadGenres();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    }
  };

  // Удалить жанр
  const handleDelete = async (id: number) => {
    if (!window.confirm('Удалить жанр? Это также удалит связи с фильмами.')) return;
    setError('');
    setSuccess('');

    try {
      await api.delete(`/admin/genres/${id}`);
      setSuccess('Жанр удалён');
      loadGenres();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка удаления');
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
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-indigo-300 mb-4"
        >
          ← Назад
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Жанры
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* СПИСОК ЖАНРОВ */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-3">
              Список жанров ({genres.length})
            </h3>

            {genres.length === 0 ? (
              <p className="text-gray-400 text-sm">Нет жанров</p>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {genres.map((g) => (
                  <div
                    key={g.id_genre}
                    className="flex items-center justify-between bg-slate-700/50 hover:bg-slate-700 rounded p-2 gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {g.name_ru}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {g.name}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => startEdit(g)}
                        className="bg-indigo-700 hover:bg-indigo-800 text-white px-2 py-1 rounded text-xs"
                      >
                        Изменить
                      </button>
                      <button
                        onClick={() => handleDelete(g.id_genre)}
                        className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ФОРМА */}
          <div className="bg-slate-600/50 border-2 border-gray-200 rounded-lg p-4 space-y-3">
            {editing ? (
              // РЕЖИМ РЕДАКТИРОВАНИЯ
              <>
                <h3 className="font-semibold text-white mb-3">
                  Редактировать жанр #{editing.id_genre}
                </h3>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Название (английское)
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Название (русское)
                  </label>
                  <input
                    type="text"
                    value={editNameRu}
                    onChange={(e) => setEditNameRu(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                  />
                </div>

                <button
                  onClick={handleSaveEdit}
                  className="w-full bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 font-semibold"
                >
                  Сохранить
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="w-full bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700 font-semibold"
                >
                  Отмена
                </button>
              </>
            ) : (
              // РЕЖИМ ДОБАВЛЕНИЯ
              <>
                <h3 className="font-semibold text-white mb-3">
                  Добавить жанр
                </h3>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Название (английское)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Action"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-200 mb-1">
                    Название (русское)
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Экшн"
                    value={newNameRu}
                    onChange={(e) => setNewNameRu(e.target.value)}
                    className="w-full p-2 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
                  />
                </div>

                <button
                  onClick={handleAdd}
                  className="w-full bg-indigo-700 text-white p-2 rounded-lg hover:bg-indigo-800 font-semibold"
                >
                  Добавить
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}