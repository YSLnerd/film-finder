export interface User {
  id_user: number;
  nickname: string;
  role: 'user' | 'admin';
}

export function getUser(): User | null {
  const s = localStorage.getItem('user');
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

export function isAdmin(): boolean {
  return getUser()?.role === 'admin';
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}