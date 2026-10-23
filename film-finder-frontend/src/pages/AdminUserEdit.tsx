import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';

interface User {
  id_user: number;
  nickname: string;
  role: string;
}

export default function AdminUserEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!id) return;
    api
      .get('/admin/users')
      .then((res) => {
        const found = res.data.find((u: User) => u.id_user === Number(id));
        if (found) {
          setUser(found);
          setRole(found.role);
        } else {
          setError('Пользователь не найден');
        }
      })
      .catch(() => setError('Ошибка загрузки'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveRole = async () => {
    setError('');
    setSuccess('');
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      setSuccess('Роль сохранена');
      setUser((prev) => (prev ? { ...prev, role } : prev));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка сохранения');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      navigate('/profile');
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

  if (!user) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
        style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
      >
        <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl text-center">
          <p className="text-white text-lg mb-4">
            {error || 'Пользователь не найден'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-800 font-semibold"
          >
            Назад
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center p-6"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-full max-w-2xl">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-indigo-300 mb-4"
        >
          ← Назад
        </button>

        <h1 className="text-3xl font-bold mb-6 text-center text-white">
          Блокировка пользователя
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

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-200 mb-1">Никнейм</label>
            <input
              type="text"
              readOnly
              value={user.nickname}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-200 mb-1">Роль</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border-2 border-gray-200 text-white rounded-lg bg-transparent focus:outline-none focus:border-indigo-700"
            >
              <option value="user" className="text-black">user</option>
              <option value="admin" className="text-black">admin</option>
            </select>
          </div>

          <button
            onClick={handleSaveRole}
            className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold"
          >
            Сохранить изменения
          </button>

          <button
            onClick={handleDelete}
            className="w-full bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 font-semibold"
          >
            Заблокировать пользователя
          </button>
        </div>
      </div>
    </div>
  );
}