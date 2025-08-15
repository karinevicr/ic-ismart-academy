// Métodos de Estudo - JavaScript
// Técnica Pomodoro e outros métodos de estudo

let pomodoroTimer = null;
let pomodoroTime = 25 * 60; // 25 minutos em segundos
let pomodoroRunning = false;
let isBreakTime = false;
let cycleCount = 1;
let maxCycles = 4;

document.addEventListener('DOMContentLoaded', function() {
    updateTimerDisplay();
    updatePhaseDisplay();
});

// Pomodoro Timer Functions
function startPomodoro() {
    const modal = document.getElementById('pomodoroModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closePomodoro() {
    const modal = document.getElementById('pomodoroModal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    if (pomodoroRunning) {
        if (confirm('Tem certeza que deseja fechar o timer? Seu progresso será perdido.')) {
            resetTimer();
        }
    }
}

function toggleTimer() {
    if (pomodoroRunning) {
        // Pausar
        clearInterval(pomodoroTimer);
        pomodoroRunning = false;
        document.getElementById('startPauseBtn').textContent = '▶️ Continuar';
        document.getElementById('startPauseBtn').style.background = 'var(--success)';
    } else {
        // Iniciar/Continuar
        pomodoroRunning = true;
        document.getElementById('startPauseBtn').textContent = '⏸️ Pausar';
        document.getElementById('startPauseBtn').style.background = 'var(--warning)';
        
        pomodoroTimer = setInterval(() => {
            pomodoroTime--;
            updateTimerDisplay();
            
            if (pomodoroTime <= 0) {
                completePhase();
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(pomodoroTimer);
    pomodoroRunning = false;
    isBreakTime = false;
    cycleCount = 1;
    pomodoroTime = 25 * 60; // Reset para 25 minutos
    
    updateTimerDisplay();
    updatePhaseDisplay();
    
    document.getElementById('startPauseBtn').textContent = '▶️ Começar';
    document.getElementById('startPauseBtn').style.background = 'var(--success)';
}

function skipPhase() {
    if (confirm('Tem certeza que deseja pular esta fase?')) {
        completePhase();
    }
}

function completePhase() {
    clearInterval(pomodoroTimer);
    pomodoroRunning = false;
    
    if (!isBreakTime) {
        // Completou uma sessão de estudo
        showPomodoroNotification('🎉 Sessão completada! Hora do intervalo.');
        
        // Registrar atividade
        addRecentActivity('🍅 Completou uma sessão Pomodoro');
        
        // Verificar se é hora do intervalo longo
        if (cycleCount % 4 === 0) {
            pomodoroTime = 15 * 60; // 15 minutos de intervalo longo
            showPomodoroNotification('☕ Intervalo longo! Descanse 15 minutos.');
        } else {
            pomodoroTime = 5 * 60; // 5 minutos de intervalo curto
        }
        
        isBreakTime = true;
    } else {
        // Completou um intervalo
        showPomodoroNotification('🔥 Intervalo terminado! Vamos estudar!');
        pomodoroTime = 25 * 60; // Volta para 25 minutos de estudo
        isBreakTime = false;
        cycleCount++;
    }
    
    updateTimerDisplay();
    updatePhaseDisplay();
    
    document.getElementById('startPauseBtn').textContent = '▶️ Começar';
    document.getElementById('startPauseBtn').style.background = 'var(--success)';
}

function updateTimerDisplay() {
    const minutes = Math.floor(pomodoroTime / 60);
    const seconds = pomodoroTime % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
        timerDisplay.textContent = display;
    }
    
    // Atualizar título da página se estiver rodando
    if (pomodoroRunning) {
        document.title = `${display} - StudyPal`;
    }
}

function updatePhaseDisplay() {
    const phaseDisplay = document.getElementById('phaseDisplay');
    if (phaseDisplay) {
        if (isBreakTime) {
            if (cycleCount % 4 === 0) {
                phaseDisplay.textContent = `☕ Intervalo Longo - Ciclo ${cycleCount}`;
            } else {
                phaseDisplay.textContent = `⏰ Intervalo Curto - Ciclo ${cycleCount}`;
            }
            phaseDisplay.style.color = 'var(--success)';
        } else {
            phaseDisplay.textContent = `📚 Sessão de Estudo - Ciclo ${cycleCount}`;
            phaseDisplay.style.color = 'var(--purple-primary)';
        }
    }
}

function showPomodoroNotification(message) {
    // Notificação visual
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--purple-primary);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
    
    // Tentar mostrar notificação do navegador
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('StudyPal Pomodoro', {
            body: message,
            icon: '🍅'
        });
    }
}

// Outras técnicas de estudo
function openTechnique(techniqueName) {
    let content = '';
    
    switch(techniqueName) {
        case 'feynman':
            content = `
                <h3>🧠 Técnica Feynman</h3>
                <p>Aprenda explicando para si mesmo:</p>
                <ol>
                    <li>Escolha um conceito</li>
                    <li>Explique em linguagem simples</li>
                    <li>Identifique lacunas</li>
                    <li>Revise e simplifique</li>
                </ol>
                <p><strong>Dica:</strong> Imagine que está explicando para uma criança!</p>
            `;
            break;
        case 'active-recall':
            content = `
                <h3>🧩 Recordação Ativa</h3>
                <p>Teste seu conhecimento constantemente:</p>
                <ul>
                    <li>Faça perguntas sobre o conteúdo</li>
                    <li>Use flashcards</li>
                    <li>Resuma sem consultar</li>
                    <li>Ensine para alguém</li>
                </ul>
                <p><strong>Dica:</strong> É mais eficaz que apenas reler!</p>
            `;
            break;
        case 'spaced-repetition':
            content = `
                <h3>📅 Repetição Espaçada</h3>
                <p>Revise em intervalos crescentes:</p>
                <ul>
                    <li>1º dia: Aprenda o conteúdo</li>
                    <li>2º dia: Primeira revisão</li>
                    <li>7º dia: Segunda revisão</li>
                    <li>21º dia: Terceira revisão</li>
                </ul>
                <p><strong>Dica:</strong> Use aplicativos como Anki!</p>
            `;
            break;
        case 'mind-maps':
            content = `
                <h3>🗺️ Mapas Mentais</h3>
                <p>Organize informações visualmente:</p>
                <ul>
                    <li>Tópico central no meio</li>
                    <li>Ramificações principais</li>
                    <li>Sub-tópicos detalhados</li>
                    <li>Use cores e símbolos</li>
                </ul>
                <p><strong>Dica:</strong> Ótimo para matérias com muitos conceitos!</p>
            `;
            break;
    }
    
    showTechniqueModal(content);
}

function showTechniqueModal(content) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; max-height: 80vh; overflow-y: auto;">
            ${content}
            <button onclick="this.closest('.modal').remove()" 
                    style="margin-top: 1rem; padding: 0.5rem 1rem; background: var(--purple-primary); color: white; border: none; border-radius: 5px; cursor: pointer;">
                Fechar
            </button>
        </div>
    `;
    
    modal.className = 'modal';
    document.body.appendChild(modal);
    
    // Fechar ao clicar fora
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Pedir permissão para notificações quando a página carregar
window.addEventListener('load', function() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});

// Prevenir fechamento acidental durante sessão Pomodoro
window.addEventListener('beforeunload', function(e) {
    if (pomodoroRunning) {
        e.preventDefault();
        e.returnValue = 'Você tem uma sessão Pomodoro ativa. Tem certeza que deseja sair?';
    }
});

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
