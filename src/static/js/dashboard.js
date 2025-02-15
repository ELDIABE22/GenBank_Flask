import { verificarAutenticacion, logout } from './token.js';

document.addEventListener('DOMContentLoaded', () => {
  verificarAutenticacion();

  const btn_logout = document.getElementById('btn_logout');
  const title_dashboard = document.getElementById('title_dashboard');

  const userName = JSON.parse(localStorage.getItem('userData')).first_name;

  if (userName) {
    title_dashboard.textContent = `Bienvenido ${userName}`;
  }

  btn_logout.addEventListener('click', () => logout());
});
