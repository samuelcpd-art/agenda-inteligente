// 1. Configuração do Supabase (Substitua pelas suas chaves)
const supabaseUrl = 'https://eskmnjffgaqceicqilid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVza21uamZmZ2FxY2VpY3FpbGlkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTc3OTY4MiwiZXhwIjoyMDk1MzU1NjgyfQ.AEU6NqQoRTib6DM0y3lzFw5N41UQ0kbmN-UI8nYZamM';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Elementos da DOM
const themeToggle = document.getElementById('theme-toggle');
const authSection = document.getElementById('auth-section');
const appSection = document.getElementById('app-section');
const authForm = document.getElementById('auth-form');
const switchAuthBtn = document.getElementById('switch-auth');
const authTitle = document.getElementById('auth-title');
const authSubmit = document.getElementById('auth-submit');
const logoutBtn = document.getElementById('logout-btn');
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');

let isLogin = true;
let currentUser = null;

// 2. Modo Claro / Escuro
themeToggle.addEventListener('click', () => {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', newTheme);
    themeToggle.textContent = newTheme === 'light' ? '🌙 Modo Escuro' : '☀️ Modo Claro';
});

// 3. Autenticação (Registro e Login)
switchAuthBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    authTitle.textContent = isLogin ? 'Entrar' : 'Registrar';
    authSubmit.textContent = isLogin ? 'Entrar' : 'Criar Conta';
    switchAuthBtn.textContent = isLogin ? 'Registre-se' : 'Faça login';
});

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) alert('Erro ao entrar: ' + error.message);
        else checkSession();
    } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) alert('Erro ao registrar: ' + error.message);
        else {
            alert('Conta criada! Faça login.');
            isLogin = true;
            switchAuthBtn.click(); // Volta para tela de login
        }
    }
});

logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    checkSession();
});

// Verifica se o usuário está logado
async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        currentUser = session.user;
        authSection.classList.add('hidden');
        appSection.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        loadTasks();
    } else {
        currentUser = null;
        authSection.classList.remove('hidden');
        appSection.classList.add('hidden');
        logoutBtn.classList.add('hidden');
    }
}

// 4. Lógica da Agenda (CRUD)
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('task-title').value;
    const date = document.getElementById('task-date').value;

    const { error } = await supabase
        .from('tasks')
        .insert([{ user_id: currentUser.id, title, due_date: date, is_done: false }]);

    if (error) alert('Erro ao adicionar tarefa.');
    else {
        taskForm.reset();
        loadTasks();
    }
});

async function loadTasks() {
    const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

    if (error) return console.error(error);

    taskList.innerHTML = '';
    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.innerHTML = `
            <div>
                <strong style="text-decoration: ${task.is_done ? 'line-through' : 'none'}">${task.title}</strong>
                <br>
                <small>Para: ${task.due_date || 'Sem data'}</small>
            </div>
            <div class="task-actions">
                <button onclick="toggleDone('${task.id}', ${task.is_done})">✅</button>
                <button onclick="postponeTask('${task.id}')">📅 Adiar</button>
                <button onclick="deleteTask('${task.id}')">🗑️</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Funções Globais para os botões do DOM
window.toggleDone = async (id, currentStatus) => {
    await supabase.from('tasks').update({ is_done: !currentStatus }).eq('id', id);
    loadTasks();
};

window.postponeTask = async (id) => {
    const newDate = prompt("Digite a nova data (AAAA-MM-DD):");
    if (newDate) {
        await supabase.from('tasks').update({ due_date: newDate }).eq('id', id);
        loadTasks();
    }
};

window.deleteTask = async (id) => {
    if(confirm('Certeza que deseja excluir?')) {
        await supabase.from('tasks').delete().eq('id', id);
        loadTasks();
    }
};

// Iniciar app verificando sessão
checkSession();