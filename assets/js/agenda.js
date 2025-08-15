// Agenda de Estudos - JavaScript
// Funcionalidades específicas da página de agenda

document.addEventListener('DOMContentLoaded', function() {
    renderSubjects();
    renderWeeklySchedule();
});

// Formulário de adição de matérias
document.getElementById('subjectForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('subjectName').value;
    const time = document.getElementById('studyTime').value;
    const day = document.getElementById('studyDay').value;
    const duration = document.getElementById('studyDuration').value;
    const notes = document.getElementById('studyNotes').value;
    
    const subject = {
        id: Date.now(),
        name: name,
        time: time,
        day: day,
        duration: duration,
        notes: notes,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Carregar matérias existentes
    let subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    subjects.push(subject);
    
    // Salvar no localStorage
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('subjects', JSON.stringify(subjects));
    }
    
    renderSubjects();
    renderWeeklySchedule();
    
    // Reset form
    this.reset();
    
    // Mostrar mensagem de sucesso
    showSuccessMessage("✅ Matéria adicionada com sucesso!");
    
    // Adicionar à atividade recente
    addRecentActivity(`📚 Adicionou ${name} - ${day} às ${time}`);
});

function renderSubjects() {
    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    const subjectList = document.getElementById('subjectList');
    
    if (!subjectList) return;
    
    if (subjects.length === 0) {
        subjectList.innerHTML = '<p style="text-align: center; color: var(--gray-medium);">Nenhuma matéria cadastrada ainda.</p>';
        return;
    }
    
    subjectList.innerHTML = subjects.map(subject => `
        <div class="subject-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid var(--purple-light); border-radius: 10px; margin-bottom: 1rem; ${subject.completed ? 'opacity: 0.6; text-decoration: line-through;' : ''}">
            <div>
                <h4 style="color: var(--purple-dark); margin-bottom: 0.5rem;">${subject.name}</h4>
                <p style="color: var(--gray-medium); font-size: 0.9rem;">
                    📅 ${subject.day} às ${subject.time} (${subject.duration} min)
                </p>
                ${subject.notes ? `<p style="color: var(--gray-medium); font-size: 0.8rem; margin-top: 0.5rem;">📝 ${subject.notes}</p>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="toggleSubjectCompletion(${subject.id})" class="btn btn-secondary" style="padding: 0.5rem;">
                    ${subject.completed ? '↩️' : '✅'}
                </button>
                <button onclick="removeSubject(${subject.id})" class="btn btn-secondary" style="padding: 0.5rem; background: var(--error);">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

function renderWeeklySchedule() {
    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    const schedule = document.getElementById('weeklySchedule');
    
    if (!schedule) return;
    
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    schedule.innerHTML = days.map(day => {
        const daySubjects = subjects.filter(subject => subject.day === day);
        
        return `
            <div class="day-card" style="border: 1px solid var(--purple-light); border-radius: 10px; padding: 1rem; background: white;">
                <h4 style="color: var(--purple-dark); margin-bottom: 1rem; text-align: center;">${day}</h4>
                ${daySubjects.length > 0 ? 
                    daySubjects.map(subject => `
                        <div style="background: var(--purple-ultra-light); padding: 0.5rem; border-radius: 5px; margin-bottom: 0.5rem; font-size: 0.9rem;">
                            <strong>${subject.time}</strong><br>
                            ${subject.name}
                        </div>
                    `).join('') : 
                    '<p style="text-align: center; color: var(--gray-medium); font-size: 0.9rem;">Nenhuma matéria</p>'
                }
            </div>
        `;
    }).join('');
}

function toggleSubjectCompletion(id) {
    let subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    const subjectIndex = subjects.findIndex(subject => subject.id === id);
    
    if (subjectIndex !== -1) {
        subjects[subjectIndex].completed = !subjects[subjectIndex].completed;
        localStorage.setItem('subjects', JSON.stringify(subjects));
        renderSubjects();
        renderWeeklySchedule();
        
        const action = subjects[subjectIndex].completed ? 'completou' : 'reabriu';
        addRecentActivity(`✅ ${action.charAt(0).toUpperCase() + action.slice(1)} ${subjects[subjectIndex].name}`);
    }
}

function removeSubject(id) {
    if (confirm('Tem certeza que deseja remover esta matéria?')) {
        let subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
        const subject = subjects.find(s => s.id === id);
        subjects = subjects.filter(subject => subject.id !== id);
        localStorage.setItem('subjects', JSON.stringify(subjects));
        renderSubjects();
        renderWeeklySchedule();
        
        if (subject) {
            addRecentActivity(`🗑️ Removeu ${subject.name}`);
        }
    }
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
