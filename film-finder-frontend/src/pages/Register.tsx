import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function Register() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      await api.post('/auth/register', { nickname, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка регистрации');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: 'url(https://cs10.pikabu.ru/post_img/big/2020/01/27/1/158007679712145663.jpg)' }}
    >
      <div className="bg-slate-500 p-8 rounded-2xl shadow-2xl w-96">
        <h1 className="text-3xl font-bold mb-2 text-center text-white">Регистрация</h1>
        <p className="text-center text-white mb-6">Создайте аккаунт</p>

        {error && (
          <div className="bg-red-500 text-white p-2 rounded mb-3 text-center text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Введите никнейм"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg mb-3 focus:outline-none focus:border-indigo-700"
            required
          />
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg mb-3 focus:outline-none focus:border-indigo-700"
            required
          />
          <input
            type="password"
            placeholder="Повторите пароль"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="w-full p-3 border-2 border-gray-200 text-white placeholder-gray-300 rounded-lg mb-4 focus:outline-none focus:border-indigo-700"
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-700 text-white p-3 rounded-lg hover:bg-indigo-800 font-semibold"
          >
            Зарегистрироваться
          </button>
        </form>

        <p className="text-center text-sm text-white mt-4">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-indigo-700 hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}