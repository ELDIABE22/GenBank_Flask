export const getCookie = (name) => {
  const cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    const [key, value] = cookie.split('=');
    if (key === name) return value;
  }
  return null;
};

export const verificarAutenticacion = () => {
  const token = getCookie('token');
  if (!token) {
    window.location.href = '/auth/login';
  }
};

export const logout = () => {
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
  localStorage.removeItem('userData');
  window.location.href = '/';
};
