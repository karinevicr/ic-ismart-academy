// Progresso - JavaScript
// Sistema de acompanhamento de progresso e estatísticas

document.addEventListener('DOMContentLoaded', function() {
    console.log('Progress: Inicializando...');
    initializeProgressData();
    renderProgressChart();
    renderWeeklyGoals();
    updateProgressStats();
    console.log('Progress: Inicialização completa!');
});

function initializeProgressData() {
    // Inicializar dados de progresso se não existirem
    if (!localStorage.getItem('progressData')) {
        const initialData = {
            weeklyHours: [],
            subjectProgress: {},
            goals: [],
            achievements: []
        };
        localStorage.setItem('progressData', JSON.stringify(initialData));
    }
}

function renderProgressChart() {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    const chartContainer = document.getElementById('progressChart');
    
    if (!chartContainer) return;
    
    // Dados das últimas 7 semanas
    const weeklyHours = progressData.weeklyHours || [];
    const lastSevenWeeks = weeklyHours.slice(-7);
    
    if (lastSevenWeeks.length === 0) {
        chartContainer.innerHTML = `
            <div style="text-align: center; color: var(--gray-medium); padding: 2rem;">
                <p>Nenhum dado de progresso ainda.</p>
                <p>Comece a usar o StudyPal para ver suas estatísticas!</p>
            </div>
        `;
        return;
    }
    
    const maxHours = Math.max(...lastSevenWeeks, 10);
    
    chartContainer.innerHTML = `
        <div style="display: flex; align-items: end; justify-content: space-between; height: 200px; padding: 1rem; background: white; border-radius: 10px; border: 1px solid var(--gray-light);">
            ${lastSevenWeeks.map((hours, index) => {
                const height = (hours / maxHours) * 150;
                return `
                    <div style="display: flex; flex-direction: column; align-items: center; flex: 1;">
                        <div style="width: 30px; background: var(--purple-primary); border-radius: 3px 3px 0 0; height: ${height}px; margin-bottom: 0.5rem; display: flex; align-items: end; justify-content: center; color: white; font-size: 0.8rem; font-weight: bold;">
                            ${hours > 0 ? hours + 'h' : ''}
                        </div>
                        <span style="font-size: 0.8rem; color: var(--gray-medium);">Sem ${index + 1}</span>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function renderWeeklyGoals() {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    const goals = progressData.goals || [];
    const goalsContainer = document.getElementById('weeklyGoals');
    
    if (!goalsContainer) return;
    
    if (goals.length === 0) {
        goalsContainer.innerHTML = `
            <div style="text-align: center; color: var(--gray-medium); padding: 1rem;">
                <p>Nenhuma meta definida ainda.</p>
                <button onclick="addNewGoal()" class="btn btn-primary">Adicionar Meta</button>
            </div>
        `;
        return;
    }
    
    goalsContainer.innerHTML = goals.map(goal => {
        const progress = (goal.current / goal.target) * 100;
        const isCompleted = progress >= 100;
        
        return `
            <div class="goal-item" style="border: 1px solid var(--purple-light); border-radius: 10px; padding: 1rem; margin-bottom: 1rem; ${isCompleted ? 'background: var(--success-light);' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <h4 style="color: var(--purple-dark); margin: 0;">${goal.title}</h4>
                    <span style="font-size: 0.9rem; color: var(--gray-medium);">${goal.current}/${goal.target} ${goal.unit}</span>
                </div>
                
                <div style="background: var(--gray-light); height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 0.5rem;">
                    <div style="background: ${isCompleted ? 'var(--success)' : 'var(--purple-primary)'}; height: 100%; width: ${Math.min(progress, 100)}%; transition: width 0.3s ease;"></div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem; color: var(--gray-medium);">${Math.round(progress)}% concluído</span>
                    <div style="display: flex; gap: 0.5rem;">
                        <button onclick="updateGoalProgress(${goal.id})" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;">
                            ${isCompleted ? '✅' : '➕'}
                        </button>
                        <button onclick="removeGoal(${goal.id})" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; background: var(--error);">
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('') + `
        <button onclick="addNewGoal()" class="btn btn-primary" style="width: 100%; margin-top: 1rem;">
            ➕ Adicionar Nova Meta
        </button>
    `;
}

function updateProgressStats() {
    const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const completedTasks = parseInt(localStorage.getItem('completedTasks')) || 0;
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    
    // Total de horas estudadas
    const totalHours = (progressData.weeklyHours || []).reduce((sum, hours) => sum + hours, 0);
    const totalHoursEl = document.getElementById('totalHours');
    if (totalHoursEl) {
        totalHoursEl.textContent = totalHours;
    }
    
    // Matérias ativas
    const activeSubjectsEl = document.getElementById('activeSubjects');
    if (activeSubjectsEl) {
        activeSubjectsEl.textContent = subjects.length;
    }
    
    // Tarefas completadas
    const completedTasksEl = document.getElementById('completedTasks');
    if (completedTasksEl) {
        completedTasksEl.textContent = completedTasks;
    }
    
    // Média semanal
    const weeklyAverage = progressData.weeklyHours?.length > 0 
        ? Math.round(totalHours / progressData.weeklyHours.length * 10) / 10
        : 0;
    const weeklyAverageEl = document.getElementById('weeklyAverage');
    if (weeklyAverageEl) {
        weeklyAverageEl.textContent = weeklyAverage;
    }
}

function addNewGoal() {
    const title = prompt('Título da meta:');
    if (!title) return;
    
    const target = parseInt(prompt('Meta (número):'));
    if (!target || target <= 0) return;
    
    const unit = prompt('Unidade (ex: horas, páginas, exercícios):');
    if (!unit) return;
    
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    if (!progressData.goals) progressData.goals = [];
    
    const newGoal = {
        id: Date.now(),
        title: title,
        target: target,
        current: 0,
        unit: unit,
        createdAt: new Date().toISOString()
    };
    
    progressData.goals.push(newGoal);
    localStorage.setItem('progressData', JSON.stringify(progressData));
    
    renderWeeklyGoals();
    addRecentActivity(`🎯 Adicionou meta: ${title}`);
}

function updateGoalProgress(goalId) {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    const goal = progressData.goals?.find(g => g.id === goalId);
    
    if (!goal) return;
    
    if (goal.current >= goal.target) {
        alert('Esta meta já foi concluída! 🎉');
        return;
    }
    
    const increment = parseInt(prompt(`Adicionar progresso para "${goal.title}" (atual: ${goal.current}/${goal.target} ${goal.unit}):`));
    if (!increment || increment <= 0) return;
    
    goal.current = Math.min(goal.current + increment, goal.target);
    localStorage.setItem('progressData', JSON.stringify(progressData));
    
    // Verificar se a meta foi concluída
    if (goal.current >= goal.target) {
        showAchievementNotification('🎯 Meta Concluída!', `Parabéns! Você atingiu a meta "${goal.title}"!`);
        addRecentActivity(`🎯 Completou meta: ${goal.title}`);
    } else {
        addRecentActivity(`📈 Progresso em: ${goal.title} (+${increment} ${goal.unit})`);
    }
    
    renderWeeklyGoals();
}

function removeGoal(goalId) {
    if (!confirm('Tem certeza que deseja remover esta meta?')) return;
    
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    const goal = progressData.goals?.find(g => g.id === goalId);
    
    if (goal) {
        progressData.goals = progressData.goals.filter(g => g.id !== goalId);
        localStorage.setItem('progressData', JSON.stringify(progressData));
        renderWeeklyGoals();
        addRecentActivity(`🗑️ Removeu meta: ${goal.title}`);
    }
}

function addStudySession() {
    const hours = parseFloat(prompt('Quantas horas você estudou hoje?'));
    if (!hours || hours <= 0) return;
    
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    if (!progressData.weeklyHours) progressData.weeklyHours = [];
    
    // Adicionar à semana atual (última posição ou criar nova)
    const currentWeek = progressData.weeklyHours.length - 1;
    if (currentWeek >= 0) {
        progressData.weeklyHours[currentWeek] += hours;
    } else {
        progressData.weeklyHours.push(hours);
    }
    
    localStorage.setItem('progressData', JSON.stringify(progressData));
    
    renderProgressChart();
    updateProgressStats();
    addRecentActivity(`📚 Estudou ${hours}h hoje`);
    
    showSuccessMessage(`✅ ${hours}h de estudo registradas!`);
}

function exportProgress() {
    const progressData = JSON.parse(localStorage.getItem('progressData')) || {};
    const subjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const activities = JSON.parse(localStorage.getItem('recentActivities')) || [];
    
    const exportData = {
        progressData,
        subjects,
        activities,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `studypal-progress-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    addRecentActivity('📤 Exportou dados de progresso');
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

function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
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

function addRecentActivity(action) {
    let activities = JSON.parse(localStorage?.getItem('recentActivities')) || [];
    activities.unshift({
        action: action,
        timestamp: new Date().toISOString()
    });
    
    // Manter apenas as últimas 10 atividades
    activities = activities.slice(0, 10);
    localStorage.setItem('recentActivities', JSON.stringify(activities));
}
