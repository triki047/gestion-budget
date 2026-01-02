// --- INITIALISATION SUPABASE (VERSION OFFICIELLE ET 100% FONCTIONNELLE) ---
const supabaseUrl = 'https://cqzsamqyhdwejogxxohm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxenNhbXF5aGR3ZWpvZ3h4b2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4Mzg0NjYsImV4cCI6MjA4MjQxNDQ2Nn0.igWJ7Ct5tXpxrd-MmRjBLlPehHmeOpHLd8ee9Xm_30w';

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// --- ÉLÉMENTS DU DOM ---
const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;

const registerForm = document.getElementById('register-form');
const loginForm = document.querySelector('.form-box.login form');
const registerError = document.getElementById('register-error');

// Création du message d'erreur pour la connexion
if (!document.getElementById('login-error')) {
    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error-message');
    errorDiv.id = 'login-error';
    loginForm.appendChild(errorDiv);
}
const loginErrorMsg = document.getElementById('login-error');

// --- FOOTER ---
const footer = document.createElement('div');
footer.innerHTML = 'Développé par <strong>Emmanuel Kpan</strong>';
footer.style.position = 'absolute';
footer.style.bottom = '10px';
footer.style.right = '20px';
footer.style.fontSize = '12px';
footer.style.color = '#666';
footer.style.zIndex = '10';
body.appendChild(footer);

// Adaptation automatique au mode sombre
if (body.classList.contains('dark')) {
    footer.style.color = '#aaa';
}

// --- THÈME AUTO SELON L'HEURE ---
function isNightTime() {
    const hour = new Date().getHours();
    return hour >= 18 || hour < 6;
}

function applyAutoTheme() {
    if (isNightTime()) {
        body.classList.add('dark');
        footer.style.color = '#aaa';
    } else {
        body.classList.remove('dark');
        footer.style.color = '#666';
    }
}
applyAutoTheme();
setInterval(applyAutoTheme, 3600000);

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    footer.style.color = body.classList.contains('dark') ? '#aaa' : '#666';
});

// --- BONJOUR / BONSOIR ---
function updateGreeting() {
    const hour = new Date().getHours();
    const greetingElement = document.getElementById('greeting-message');
    if (greetingElement) {
        greetingElement.textContent = (hour >= 5 && hour < 18) ? "Bonjour, bienvenue !" : "Bonsoir, bienvenue !";
    }
}
updateGreeting();
setInterval(updateGreeting, 3600000);

// --- INSCRIPTION ---
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        registerError.classList.remove('show');
        registerError.textContent = '';
        registerError.style.background = '';
        if (!username || !email || !password || !confirmPassword) {
            registerError.textContent = "Veuillez remplir tous les champs.";
            registerError.classList.add('show');
            return;
        }
        if (password.length < 6) {
            registerError.textContent = "Le mot de passe doit faire au moins 6 caractères.";
            registerError.classList.add('show');
            return;
        }
        if (password !== confirmPassword) {
            registerError.textContent = "Les mots de passe ne correspondent pas.";
            registerError.classList.add('show');
            return;
        }
        const { data, error } = await supabaseClient.auth.signUp({
            email: email,
            password: password,
            options: {
                data: { username: username }
            }
        });
        if (error || (data.user && data.user.identities && data.user.identities.length === 0)) {
            registerError.textContent = error?.message?.includes('duplicate') || data.user?.identities?.length === 0
                ? "Cet email est déjà utilisé."
                : "Erreur : " + (error?.message || "Inscription échouée");
            registerError.classList.add('show');
        } else {
            registerError.textContent = "Inscription réussie ! Vérifiez votre boîte mail pour confirmer.";
            registerError.style.background = "#51cf66";
            registerError.classList.add('show');
            setTimeout(() => {
                registerForm.reset();
                container.classList.remove('active');
            }, 3000);
        }
    });
}

// --- CONNEXION (NOM D'UTILISATEUR OU EMAIL) ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const identifier = loginForm.querySelector('input[type="text"]').value.trim();
    const password = loginForm.querySelector('input[type="password"]').value;
    loginErrorMsg.classList.remove('show');
    loginErrorMsg.textContent = '';
    loginErrorMsg.style.background = '';
    if (!identifier || !password) {
        loginErrorMsg.textContent = "Veuillez remplir tous les champs.";
        loginErrorMsg.classList.add('show');
        return;
    }
    let email = identifier;
    if (!identifier.includes('@')) {
        const { data: emailData, error: funcError } = await supabaseClient.rpc('get_email_from_username', { p_username: identifier });
        if (funcError || !emailData) {
            loginErrorMsg.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
            loginErrorMsg.classList.add('show');
            return;
        }
        email = emailData;
    }
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });
    if (error) {
        loginErrorMsg.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
        loginErrorMsg.classList.add('show');
    } else {
        loginErrorMsg.textContent = "Connexion réussie ! Bienvenue 😉";
        loginErrorMsg.style.background = "#51cf66";
        loginErrorMsg.classList.add('show');
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1500);
    }
});

// --- VÉRIFICATION SESSION (redirection vers dashboard si déjà connecté) ---
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && !window.location.pathname.includes('dashboard.html')) {
        window.location.href = "dashboard.html";
    }
});

// --- CONNEXION GOOGLE ---
document.getElementById('google-login')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://gestion-budget-three.vercel.app/dashboard.html'
        }
    });
});

// --- CONNEXION GITHUB ---
document.getElementById('github-login')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
            redirectTo: 'https://gestion-budget-three.vercel.app/dashboard.html'
        }
    });
});

// --- TOGGLE FORMULAIRE ---
registerBtn.addEventListener('click', () => container.classList.add('active'));
loginBtn.addEventListener('click', () => container.classList.remove('active'));

// --- ŒIL MOT DE PASSE ---
document.querySelectorAll('.eye-toggle').forEach(icon => {
    icon.addEventListener('click', () => {
        const targetId = icon.getAttribute('data-target');
        const field = document.getElementById(targetId);
        if (field && field.type === 'password') {
            field.type = 'text';
            icon.classList.replace('bx-show', 'bx-hide');
        } else if (field) {
            field.type = 'password';
            icon.classList.replace('bx-hide', 'bx-show');
        }
    });
});

// --- MOT DE PASSE OUBLIÉ ---
const forgotLink = document.getElementById('forgot-password-link');
const modal = document.getElementById('forgot-modal');
const closeModal = document.getElementById('close-modal');
const sendResetBtn = document.getElementById('send-reset-btn');
const resetEmail = document.getElementById('reset-email');
const resetMessage = document.getElementById('reset-message');

if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    });
}

if (closeModal) {
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
        resetMessage.textContent = '';
        resetEmail.value = '';
    });
}

if (sendResetBtn) {
    sendResetBtn.addEventListener('click', async () => {
        const email = resetEmail.value.trim();

        if (!email) {
            resetMessage.textContent = "Entre un email valide.";
            resetMessage.style.color = '#ff6b6b';
            return;
        }

        resetMessage.textContent = "Envoi en cours...";
        resetMessage.style.color = '#7494ec';

        const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://gestion-budget-three.vercel.app/index.html'
        });

        if (error) {
            resetMessage.textContent = "Erreur : " + error.message;
            resetMessage.style.color = '#ff6b6b';
        } else {
            resetMessage.textContent = "Lien envoyé ! Vérifie tes mails (et spams).";
            resetMessage.style.color = '#51cf66';
            setTimeout(() => {
                modal.style.display = 'none';
                resetMessage.textContent = '';
                resetEmail.value = '';
            }, 4000);
        }
    });
}
