// Agenda de Estudos - JavaScript
// Funcionalidades específicas da página de agenda

// Estado atual do calendário mensal
let currentYear, currentMonth;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializa mês atual
    const today = new Date();
    currentYear = today.getFullYear();
    currentMonth = today.getMonth(); // 0-indexed

    // Inicial render
    renderSubjects();
    renderWeeklySchedule();
    renderMonthlyCalendar(currentYear, currentMonth);
    setupViewToggle();
    setupMonthNav();
    // Registrar handler do formulário (garante que o elemento exista)
    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) subjectForm.addEventListener('submit', handleSubjectFormSubmit);
});

// Formulário de adição de matérias
// Handler do formulário - registrado no DOMContentLoaded para garantir que o elemento exista
function handleSubjectFormSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const idInput = document.getElementById('subjectId').value;
    const name = document.getElementById('subjectName').value;
    const time = document.getElementById('studyTime').value;
    const day = document.getElementById('studyDay') ? document.getElementById('studyDay').value : '';
    const date = document.getElementById('studyDate').value; // optional
    const duration = document.getElementById('studyDuration').value;
    const notes = document.getElementById('studyNotes').value;

    const subject = {
        id: idInput ? Number(idInput) : Date.now(),
        name: name,
        time: time,
        day: day,
        date: date || null,
        duration: duration,
        notes: notes,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Carregar matérias existentes
    let subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    // Se estiver editando, substituir
    const existingIndex = subjects.findIndex(s => s.id === subject.id);
    if (existingIndex !== -1) {
        subjects[existingIndex] = Object.assign({}, subjects[existingIndex], subject);
        showSuccessMessage('✏️ Matéria atualizada com sucesso!');
        addRecentActivity(`✏️ Editou ${subject.name}`);
    } else {
        subjects.push(subject);
        showSuccessMessage('✅ Matéria adicionada com sucesso!');
        addRecentActivity(`📚 Adicionou ${name} - ${day || date} às ${time}`);
    }
    
    // Salvar no localStorage
    if (typeof(Storage) !== "undefined") {
        localStorage.setItem('subjects', JSON.stringify(subjects));
    }

    // UX: loading state + prevent multiple submits
    const submitBtn = document.getElementById('submitSubjectBtn');
    const originalBtnText = submitBtn ? submitBtn.innerHTML : 'Adicionar Matéria';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '⏳ Salvando...';
    }

    // Render e persistir view escolhida
    const monthly = document.getElementById('monthlyView');
    const activeView = (monthly && monthly.style.display === 'block') ? 'monthly' : 'weekly';
    localStorage.setItem('agendaActiveView', activeView);

    // Small async simulation to show loading and then redirect/focus
    setTimeout(() => {
        renderSubjects();
        renderWeeklySchedule();
        renderMonthlyCalendar(currentYear, currentMonth);

        // Reset form
        form.reset();
        const subjectIdEl = document.getElementById('subjectId');
        if (subjectIdEl) subjectIdEl.value = '';

        // Feedback visual: toast + temporary button check
        showToast('Matéria salva com sucesso!', 2500);
        if (submitBtn) submitBtn.innerHTML = '✓ Salvo';

        // Focar no dia: se date informado, ir para mês correspondente e destacar o dia
        const targetDate = date ? new Date(date + 'T00:00:00') : new Date();
        const targetYear = targetDate.getFullYear();
        const targetMonth = targetDate.getMonth();
        const targetDay = targetDate.getDate();

        // switch to stored view
        if (activeView === 'monthly') {
            // navigate to that month and show monthly view
            currentYear = targetYear;
            currentMonth = targetMonth;
            renderMonthlyCalendar(currentYear, currentMonth);
            const btnMonthly = document.getElementById('btnMonthly');
            if (btnMonthly) btnMonthly.click();
            highlightCalendarDay(targetYear, targetMonth, targetDay);
        } else {
            const btnWeekly = document.getElementById('btnWeekly');
            if (btnWeekly) btnWeekly.click();
            // highlight day card in weekly view if possible (by weekday)
            const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
            const weekdayName = days[targetDate.getDay()];
            highlightWeeklyDay(weekdayName);
        }

        // restore button after short delay
        setTimeout(() => {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        }, 1200);

        // Adicionar à atividade recente
        addRecentActivity(`📚 Adicionou ${name} - ${day || date} às ${time}`);
    }, 600);
}

// Toast helper
function showToast(message, duration = 2000) {
    const div = document.createElement('div');
    div.textContent = message;
    div.style.cssText = `position: fixed; bottom: 20px; right: 20px; background: rgba(0,0,0,0.8); color: white; padding: 0.6rem 1rem; border-radius: 6px; z-index: 2000; font-size: 0.95rem;`;
    document.body.appendChild(div);
    setTimeout(() => { div.remove(); }, duration);
}

// Destaca um dia no calendário mensal (temporariamente)
function highlightCalendarDay(year, month, day) {
    const monthlyCalendar = document.getElementById('monthlyCalendar');
    if (!monthlyCalendar) return;
    // procura célula pelo conteúdo do dia — estratégia simples: procurar divs que comecem com o número
    const cells = Array.from(monthlyCalendar.querySelectorAll('div'));
    const dayStr = String(day);
    // começamos depois dos headers (7 elementos)
    const candidate = cells.find(c => c.firstChild && c.firstChild.textContent && c.firstChild.textContent.trim().startsWith(dayStr));
    if (candidate) {
        candidate.style.transition = 'box-shadow 0.25s, transform 0.25s';
        candidate.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.18)';
        candidate.style.transform = 'scale(1.01)';
        setTimeout(() => {
            candidate.style.boxShadow = '';
            candidate.style.transform = '';
        }, 2200);
    }
}

// Destaca o cartão do dia na weekly view (por nome do dia)
function highlightWeeklyDay(weekdayName) {
    const schedule = document.getElementById('weeklySchedule');
    if (!schedule) return;
    const dayCards = Array.from(schedule.querySelectorAll('.day-card'));
    const target = dayCards.find(dc => dc.querySelector('h4') && dc.querySelector('h4').textContent.includes(weekdayName));
    if (target) {
        target.style.transition = 'box-shadow 0.25s, transform 0.25s';
        target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.18)';
        target.style.transform = 'scale(1.01)';
        setTimeout(() => {
            target.style.boxShadow = '';
            target.style.transform = '';
        }, 2200);
    }
}

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
                    📅 ${subject.date ? subject.date + ' ' : ''}${subject.day ? subject.day + ' ' : ''}às ${subject.time} (${subject.duration} min)
                </p>
                ${subject.notes ? `<p style="color: var(--gray-medium); font-size: 0.8rem; margin-top: 0.5rem;">📝 ${subject.notes}</p>` : ''}
            </div>
            <div style="display: flex; gap: 0.5rem;">
                <button onclick="toggleSubjectCompletion(${subject.id})" class="btn btn-secondary" style="padding: 0.5rem;">
                    ${subject.completed ? '↩️' : '✅'}
                </button>
                <button onclick="editSubject(${subject.id})" class="btn btn-secondary" style="padding: 0.5rem; background: var(--info);">
                    ✏️
                </button>
                <button onclick="removeSubject(${subject.id})" class="btn btn-secondary" style="padding: 0.5rem; background: var(--error);">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Edita matéria: preencher o formulário com os dados
function editSubject(id) {
    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    const subject = subjects.find(s => s.id === id);
    if (!subject) return;

    document.getElementById('subjectId').value = subject.id;
    document.getElementById('subjectName').value = subject.name || '';
    document.getElementById('studyTime').value = subject.time || '';
    const studyDayEl = document.getElementById('studyDay');
    if (studyDayEl) studyDayEl.value = subject.day || '';
    document.getElementById('studyDate').value = subject.date || '';
    document.getElementById('studyDuration').value = subject.duration || 60;
    document.getElementById('studyNotes').value = subject.notes || '';
    // Scroll to form
    document.getElementById('subjectName').scrollIntoView({ behavior: 'smooth' });
}

function renderWeeklySchedule() {
    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];
    const schedule = document.getElementById('weeklySchedule');
    
    if (!schedule) return;
    
    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    
    schedule.innerHTML = days.map(day => {
        // Subjects that are either set to this weekday (recurring) OR have a specific date matching this week's date
        const daySubjects = subjects.filter(subject => subject.day === day || (subject.date && isDateInWeek(subject.date, day)));
        
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

// Utility: verifica se uma data (YYYY-MM-DD) cai no dia da semana atual do calendário (usado para weekly view)
function isDateInWeek(dateString, weekdayName) {
    try {
        const d = new Date(dateString + 'T00:00:00');
        const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
        return days[d.getDay()] === weekdayName;
    } catch (e) {
        return false;
    }
}

/* ------------------ Calendário Mensal ------------------ */
function setupViewToggle() {
    const btnMonthly = document.getElementById('btnMonthly');
    const btnWeekly = document.getElementById('btnWeekly');
    const monthlyView = document.getElementById('monthlyView');
    const weeklyView = document.getElementById('weeklyView');

    btnMonthly.addEventListener('click', () => {
        monthlyView.style.display = 'block';
        weeklyView.style.display = 'none';
        btnMonthly.classList.add('active');
        btnWeekly.classList.remove('active');
    });

    btnWeekly.addEventListener('click', () => {
        monthlyView.style.display = 'none';
        weeklyView.style.display = 'block';
        btnWeekly.classList.add('active');
        btnMonthly.classList.remove('active');
    });

    // default: weekly shown
    btnWeekly.click();
}

function setupMonthNav() {
    document.getElementById('prevMonth').addEventListener('click', () => {
        currentMonth -= 1;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear -= 1;
        }
        renderMonthlyCalendar(currentYear, currentMonth);
    });

    document.getElementById('nextMonth').addEventListener('click', () => {
        currentMonth += 1;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear += 1;
        }
        renderMonthlyCalendar(currentYear, currentMonth);
    });
}

function renderMonthlyCalendar(year, month) {
    const monthlyCalendar = document.getElementById('monthlyCalendar');
    const monthYear = document.getElementById('monthYear');
    if (!monthlyCalendar || !monthYear) return;

    const subjects = JSON.parse(localStorage?.getItem('subjects')) || [];

    // Set header
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    monthYear.textContent = `${monthNames[month]} ${year}`;

    // Clear
    monthlyCalendar.innerHTML = '';

    // Add weekday headers
    const weekDays = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    weekDays.forEach(w => {
        const hd = document.createElement('div');
        hd.style.fontWeight = '600';
        hd.style.textAlign = 'center';
        hd.style.padding = '0.5rem';
        hd.textContent = w;
        monthlyCalendar.appendChild(hd);
    });

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingWeekday = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Fill blanks before first day
    for (let i = 0; i < startingWeekday; i++) {
        const empty = document.createElement('div');
        empty.style.minHeight = '80px';
        empty.style.border = '1px solid transparent';
        monthlyCalendar.appendChild(empty);
    }

    // Create day cells
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.style.minHeight = '100px';
        cell.style.border = '1px solid var(--purple-light)';
        cell.style.borderRadius = '8px';
        cell.style.padding = '0.5rem';
        cell.style.background = 'white';

        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        const header = document.createElement('div');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = '0.3rem';

        const dayLabel = document.createElement('div');
        dayLabel.style.fontWeight = '600';
        dayLabel.textContent = day;

        header.appendChild(dayLabel);
        cell.appendChild(header);

        // Add subjects for this date OR recurring by weekday
        const daySubjects = subjects.filter(s => (s.date && s.date === dateStr) || (!s.date && weekdayNameForDate(dateStr) === s.day));

        if (daySubjects.length > 0) {
            daySubjects.forEach(s => {
                const sDiv = document.createElement('div');
                sDiv.style.background = 'var(--purple-ultra-light)';
                sDiv.style.padding = '0.25rem';
                sDiv.style.marginBottom = '0.25rem';
                sDiv.style.borderRadius = '6px';
                sDiv.style.fontSize = '0.85rem';

                const time = document.createElement('div');
                time.style.fontWeight = '600';
                time.textContent = s.time;

                const name = document.createElement('div');
                name.textContent = s.name;

                sDiv.appendChild(time);
                sDiv.appendChild(name);

                cell.appendChild(sDiv);
            });
        } else {
            const p = document.createElement('div');
            p.style.color = 'var(--gray-medium)';
            p.style.fontSize = '0.85rem';
            p.style.marginTop = '0.5rem';
            p.textContent = '—';
            cell.appendChild(p);
        }

        monthlyCalendar.appendChild(cell);
    }
}

function weekdayNameForDate(dateString) {
    const d = new Date(dateString + 'T00:00:00');
    const days = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
    return days[d.getDay()];
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
