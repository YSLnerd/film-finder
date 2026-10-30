//Описывает, как должен выглядеть обьект пользователя приходящий с бекэнда
export interface User {
  id_user: number;
  nickname: string;
  role: 'user' | 'admin';
}
//Берёт из хранилища браузера данные пользователя
export function getUser(): User | null {
  const s = localStorage.getItem('user');
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}
//проверка из хранилища браузера, является ли пользователь админом
export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}
//Проверка залогинен ли пользователь
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}
//Очистка хранилища при разлогинивании
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}