import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// COLOQUE SUAS CHAVES AQUI
const supabaseUrl = 'https://eskmnjffgaqceicqilid.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVza21uamZmZ2FxY2VpY3FpbGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3Nzk2ODIsImV4cCI6MjA5NTM1NTY4Mn0.cpbZX8VZ-2q4iG2ZmQ8UzW84aJChuhCpgAb9FxW0Qk4';
const supabase = createClient(supabaseUrl, supabaseKey);

let currentUser = null;

// Elementos da DOM
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const logoutBtn = document.getElementById('logout-btn');
const themeToggle = document.getElementById('theme-toggle');

// Inicialização e proteção da rota
async function init() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html'; // Redireciona se não estiver logado
        return;
    }
    currentUser = session.user;
    loadTheme();
    fetchTasks();
}

// ---------------- THEMA CLARO/ESCURO ----------------
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ---------------- LÓGICA DO SUPABASE (CRUD) ----------------

// Buscar tarefas
async function fetchTasks() {
    taskList.innerHTML = '<p>Carregando...</p>';
    const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: true });

    if (error) console.error('Erro ao buscar', error);
    else renderTasks(data);
}

// Adicionar tarefa
taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = taskInput.value.trim();
    if (!title) return;

    const { data, error } = await supabase
        .from('tasks')
        .insert([{ title: title, user_id: currentUser.id, status: 'pending' }]);

    if (!error) {
        taskInput.value = '';
        fetchTasks();
    }
});

// Deletar
window.deleteTask = async (id) => {
    if (!confirm('Tem certeza que deseja excluir?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchTasks();
};

// Editar
window.editTask = async (id, currentTitle) => {
    const newTitle = prompt('Edite a tarefa:', currentTitle);
    if (newTitle && newTitle.trim() !== currentTitle) {
        await supabase.from('tasks').update({ title: newTitle.trim() }).eq('id', id);
        fetchTasks();
    }
};

// Marcar como Feito (Alternar)
window.toggleDone = async (id, currentStatus) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done';
    await supabase.from('tasks').update({ status: newStatus }).eq('id', id);
    fetchTasks();
};

// Adiar
window.postponeTask = async (id) => {
    await supabase.from('tasks').update({ status: 'postponed' }).eq('id', id);
    fetchTasks();
};

// Logout
logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
});

// ---------------- RENDERIZAÇÃO NA TELA ----------------
function renderTasks(tasks) {
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        taskList.innerHTML = '<p style="text-align:center; color:var(--text-muted);">Nenhuma tarefa ainda. Adicione uma!</p>';
        return;
    }

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = `task-item ${task.status}`;
        
        li.innerHTML = `
            <span class="task-title">${task.title}</span>
            <div class="task-actions">
                <button onclick="toggleDone('${task.id}', '${task.status}')" class="btn-small btn-success" title="Concluir/Desfazer">✓</button>
                <button onclick="postponeTask('${task.id}')" class="btn-small btn-warning" title="Adiar">⏳</button>
                <button onclick="editTask('${task.id}', '${task.title}')" class="btn-small btn-primary" title="Editar">✏️</button>
                <button onclick="deleteTask('${task.id}')" class="btn-small btn-danger" title="Excluir">X</button>
            </div>
        `;
        taskList.appendChild(li);
    });
}

// Inicia o app
init();