// Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userIn = document.getElementById('loginUser').value.trim();
    const pass = document.getElementById('loginPass').value;
    const errUser = document.getElementById('errUser');
    const errPass = document.getElementById('errPass');
    errUser.textContent = '';
    errPass.textContent = '';

    if (!userIn) { errUser.textContent = 'Enter email or username.'; return; }
    if (!pass) { errPass.textContent = 'Enter password.'; return; }

    const u = AuthStorage.validate(userIn, pass);
    if (!u) {
      errPass.textContent = 'Username or password is incorrect.';
      return;
    }
    AuthStorage.setCurrent({ username: u.username, email: u.email, name: u.name, guest: false });
    window.location.href = 'dashboard.html';
  });
}

// Signup
const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('fullName').value.trim();
    const username = document.getElementById('userName').value.trim();
    const email = document.getElementById('email').value.trim();
    const pass = document.getElementById('pass').value;
    const pass2 = document.getElementById('pass2').value;

    const errName = document.getElementById('errName');
    const errUser = document.getElementById('errUser');
    const errEmail = document.getElementById('errEmail');
    const errPass = document.getElementById('errPass');
    const errPass2 = document.getElementById('errPass2');

    [errName, errUser, errEmail, errPass, errPass2].forEach(el => el.textContent = '');

    if (!name) { errName.textContent = 'Full name is required.'; return; }
    if (username.length < 3) { errUser.textContent = 'Username must be at least 3 characters.'; return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { errEmail.textContent = 'Enter a valid email.'; return; }
    if (pass.length < 6) { errPass.textContent = 'Password must be at least 6 characters.'; return; }
    if (pass !== pass2) { errPass2.textContent = 'Passwords do not match.'; return; }

    const ok = AuthStorage.addUser({ name, username, email, password: pass });
    if (!ok) {
      errUser.textContent = 'Username or email already exists.';
      return;
    }
    AuthStorage.setCurrent({ username, email, name, guest: false });
    window.location.href = 'dashboard.html';
  });
}

// Logout binding (used in dashboard)
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    AuthStorage.logout();
    window.location.href = 'index.html';
  });
}