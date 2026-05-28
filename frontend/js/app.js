const API_BASE = 'https://pdd-fsiv.onrender.com/api';

async function api(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { headers, ...options });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Ошибка сервера');
  return data;
}

function getUser() {
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

function initNav() {
  const user = getUser();
  const navAuth = document.getElementById('navAuth');
  if (!navAuth) return;
  if (user) {
    navAuth.innerHTML = `
      <a href="profile.html" class="btn btn-white btn-sm">👤 ${user.name}</a>
      <button onclick="logout()" class="btn btn-sm" style="background:rgba(255,255,255,0.15);color:#fff">Выйти</button>`;
  } else {
    navAuth.innerHTML = `<a href="login.html" class="btn btn-white btn-sm">Войти</a>`;
  }
}

function toggleMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function showToast(msg, type = 'info') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${icons[type] || 'ℹ️'}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
