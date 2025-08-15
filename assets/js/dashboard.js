// Dashboard - JavaScript
// Funcionalidades específicas da página de dashboard

document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard: Inicializando...');
    updateDashboardStats();
    renderRecentActivities();
    showWelcomeMessage();
    console.log('Dashboard: Inicialização completa!');
});

function updateDashboardStats() {
    // Atualizar estatísticas do dashboard
    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    const completedTasks = parseInt(localStorage?.getItem('completedTasks')) || 0;
    const streak = parseInt(localStorage?.getItem('streak')) || 0;
    
    // Total de matérias
    const totalSubjectsEl = document.getElementById('totalSubjects');
    if (totalSubjectsEl) {
        totalSubjectsEl.textContent = subjects.length;
    }
    
    // Progresso semanal
    const weeklyProgressEl = document.getElementById('weeklyProgress');
    if (weeklyProgressEl) {
        const completedThisWeek = subjects.filter(s => s.completed).length;
        const progress = subjects.length > 0 ? Math.round((completedThisWeek / subjects.length) * 100) : 0;
        weeklyProgressEl.textContent = `${progress}%`;
    }
    
    // Streak
    const streakEl = document.getElementById('streak');
    if (streakEl) {
        streakEl.textContent = streak;
    }
}

function renderRecentActivities() {
    const activities = JSON.parse(localStorage?.getItem('recentActivities')) || [];
    const container = document.getElementById('recentActivities');
    
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--gray-medium);">Nenhuma atividade recente.</p>';
        return;
    }
    
    container.innerHTML = activities.slice(0, 5).map(activity => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid var(--gray-light);">
            <span style="color: var(--gray-dark);">${activity.action}</span>
            <span style="color: var(--gray-medium); font-size: 0.9rem;">${formatTimeAgo(activity.timestamp)}</span>
        </div>
    `).join('');
}

function showWelcomeMessage() {
    const container = document.getElementById('motivationContainer');
    if (!container) return;
    
    const hour = new Date().getHours();
    let greeting = '🌅 Bom dia';
    
    if (hour >= 12 && hour < 18) {
        greeting = '☀️ Boa tarde';
    } else if (hour >= 18) {
        greeting = '🌙 Boa noite';
    }
    
    const motivationalMessage = getRandomMotivationalMessage();
    
    container.innerHTML = `
        <div style="background: var(--purple-ultra-light); padding: 1.5rem; border-radius: 10px; margin-bottom: 2rem;">
            <h3 style="color: var(--purple-dark); margin-bottom: 0.5rem;">${greeting}!</h3>
            <p style="color: var(--gray-medium); margin: 0;">${motivationalMessage}</p>
        </div>
    `;
}

function completeTask() {
    const taskName = prompt('Qual tarefa você completou?');
    if (taskName) {
        let completedTasks = parseInt(localStorage?.getItem('completedTasks')) || 0;
        completedTasks++;
        localStorage.setItem('completedTasks', completedTasks);
        
        addRecentActivity(`✅ Completou: ${taskName}`);
        updateDashboardStats();
        renderRecentActivities();
        
        showSuccessMessage('🎉 Parabéns! Tarefa marcada como concluída!');
        
        // Verificar conquistas
        checkAchievements();
    }
}

function startPomodoro() {
    // Redirecionar para a página de métodos onde o Pomodoro está implementado
    window.location.href = 'methods.html';
}

function showMotivation() {
    const message = getRandomMotivationalMessage();
    showMotivationalMessage(message);
}

function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'motivation-message';
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--success);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function showMotivationalMessage(message) {
    const container = document.getElementById('motivationContainer');
    if (!container) return;

    const messageEl = document.createElement('div');
    messageEl.className = 'motivation-message';
    messageEl.style.cssText = `
        background: linear-gradient(135deg, var(--purple-primary), var(--purple-light));
        color: white;
        padding: 1rem;
        border-radius: 10px;
        text-align: center;
        margin: 1rem 0;
        animation: slideIn 0.3s ease;
    `;
    messageEl.innerHTML = `<strong>${message}</strong>`;
    
    container.appendChild(messageEl);
    
    setTimeout(() => {
        messageEl.remove();
    }, 5000);
}

function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
}

function checkAchievements() {
    const completedTasks = parseInt(localStorage?.getItem('completedTasks')) || 0;
    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    
    // Conquista: Primeira tarefa
    if (completedTasks === 1) {
        showAchievementNotification('🎯 Primeira Conquista!', 'Você completou sua primeira tarefa!');
    }
    
    // Conquista: 10 tarefas
    if (completedTasks === 10) {
        showAchievementNotification('🔥 Produtivo!', 'Você completou 10 tarefas!');
    }
    
    // Conquista: 5 matérias cadastradas
    if (subjects.length === 5) {
        showAchievementNotification('📚 Organizador!', 'Você cadastrou 5 matérias!');
    }
}

function showAchievementNotification(title, description) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, gold, orange);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        z-index: 1000;
        max-width: 300px;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
    `;
    
    notification.innerHTML = `
        <div style="text-align: center;">
            <h4 style="margin: 0 0 0.5rem 0;">${title}</h4>
            <p style="margin: 0; font-size: 0.9rem;">${description}</p>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
