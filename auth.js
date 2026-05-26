import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// COLOQUE SUAS CHAVES AQUI
const supabaseUrl = 'https://eskmnjffgaqceicqilid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVza21uamZmZ2FxY2VpY3FpbGlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc3OTY4MiwiZXhwIjoyMDk1MzU1NjgyfQ.AEU6NqQoRTib6DM0y3lzFw5N41UQ0kbmN-UI8nYZamM';
const supabase = createClient(supabaseUrl, supabaseKey);

const authForm = document.getElementById('auth-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const btnRegister = document.getElementById('btn-register');
const authMsg = document.getElementById('auth-msg');

// Verifica se já está logado
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        window.location.href = 'index.html';
    }
}
checkSession();

// Função de Login
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authMsg.textContent = 'Carregando...';
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.value,
        password: passwordInput.value,
    });

    if (error) {
        authMsg.textContent = 'Erro ao entrar: ' + error.message;
    } else {
        window.location.href = 'index.html';
    }
});

// Função de Registro
btnRegister.addEventListener('click', async () => {
    if(!emailInput.value || !passwordInput.value) {
        authMsg.textContent = 'Preencha email e senha para registrar.';
        return;
    }
    
    authMsg.textContent = 'Criando conta...';
    const { data, error } = await supabase.auth.signUp({
        email: emailInput.value,
        password: passwordInput.value,
    });

    if (error) {
        authMsg.textContent = 'Erro ao registrar: ' + error.message;
    } else {
        authMsg.style.color = 'var(--success)';
        authMsg.textContent = 'Conta criada! Confirme seu email ou faça login.';
    }
});