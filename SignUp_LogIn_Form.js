// --- INITIALISATION SUPABASE ---
const supabaseUrl = 'https://cqzsamqyhdwejogxxohm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxenNhbXF5aGR3ZWpvZ3h4b2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg0NjYsImV4cCI6MjA4MjQxNDQ2Nn0.igWJ7Ct5tXpxrd-MmRjBLlPehHmeOpHLd8ee9Xm_30w';

const { createClient } = supabase;
const _supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- ELEMENTS ---
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

const registerForm = document.getElementById('register-form');
const loginForm = document.querySelector('.form-box.login form');
const registerError = document.getElementById('register-error');
const loginError = document.getElementById('login-error');

// --- SIGNATURE FOOTER ---
if (!document.getElementById('sig')) {
    const footer = document.createElement('div');
    footer.id = 'sig';
    footer.className = 'footer-signature';
    footer.innerHTML = 'Développé par <strong>Emmanuel Kpan</strong>';
    body.appendChild(footer);
}

// --- GESTION THEME & HEURE ---
function updateGreeting() {
    const hour = new Date().getHours();
    const greet = document.getElementById('greeting-message');
    if (greet) greet.textContent = (hour >= 5 && hour < 18) ? "Bonjour, bienvenue !" : "Bonsoir, bienvenue !";
    
    // Auto-thème si l'utilisateur n'a pas encore cliqué
    if (!localStorage.getItem('manual-theme')) {
        body.classList.toggle('dark', (hour >= 18 || hour < 6));
    }
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('manual-theme', 'true');
});

// --- INSCRIPTION ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('confirm-password').value;

        registerError.classList.remove('show');

        if (password !== confirm) {
            registerError.textContent = "Mots de passe différents !";
            registerError.classList.add('show');
            return;
        }

        const { data, error } = await _supabase.auth.signUp({
            email, password, options: { data: { username } }
        });

        if (error) {
            registerError.textContent = error.message;
            registerError.classList.add('show');
        } else {
            registerError.style.background = "#51cf66";
            registerError.textContent = "Inscription réussie ! Vérifie tes mails.";
            registerError.classList.add('show');
        }
    });
}

// --- CONNEXION ---
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = loginForm.querySelector('input[type="text"]').value.trim();
        const password = loginForm.querySelector('input[type="password"]').value;

        loginError.classList.remove('show');

        const { data, error } = await _supabase.auth.signInWithPassword({
            email: identifier, // Supabase accepte l'email ici
            password: password
        });

        if (error) {
            loginError.textContent = "Identifiants incorrects.";
            loginError.classList.add('show');
        } else {
            window.location.href = "dashboard.html";
        }
    });
}

// --- UI ACTIONS ---
registerBtn.addEventListener('click', () => container.classList.add('active'));
loginBtn.addEventListener('click', () => container.classList.remove('active'));

document.querySelectorAll('.eye-toggle').forEach(icon => {
    icon.addEventListener('click', () => {
        const input = document.getElementById(icon.getAttribute('data-target'));
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('bx-show', 'bx-hide');
        } else {
            input.type = 'password';
            icon.classList.replace('bx-hide', 'bx-show');
        }
    });
});

updateGreeting();
