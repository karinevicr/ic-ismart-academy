// StudyPal - JavaScript Principal
// Funções compartilhadas e utilitárias

// Mensagens motivacionais
const motivationalMessages = [
    "🌟 Cada pequeno passo conta na sua jornada!",
    "🚀 Você está mais próximo do seu objetivo a cada estudo!",
    "💪 Persistência é a chave do sucesso!",
    "🎯 Foco e determinação levam à vitória!",
    "⭐ Você tem potencial ilimitado!",
    "🔥 Continue assim, você está indo muito bem!",
    "🏆 Grandes conquistas começam com pequenas ações!",
    "💡 Conhecimento é o seu superpoder!",
    "🌱 Cada dia de estudo é um dia de crescimento!",
    "✨ Sua dedicação hoje constrói o amanhã dos seus sonhos!"
];

// Inicialização geral
document.addEventListener('DOMContentLoaded', function() {
    console.log('StudyPal: Página carregada!');
    initializeAnimations();
    loadTheme();
});

// Função para obter mensagem motivacional aleatória
function getRandomMotivationalMessage() {
    return motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
}

// Animações de entrada
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observar todos os elementos que devem ter animação
    document.querySelectorAll('.card, .feature-card, .method-card').forEach(el => {
        observer.observe(el);
    });
}

// Sistema de navegação
function navigateTo(page) {
    window.location.href = page;
}

// Função para carregar tema (para futuras funcionalidades)
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.className = savedTheme + '-theme';
}

// Função utilitária para adicionar atividade recente (compartilhada entre páginas)
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

// Utilidades de data e tempo
function formatTimeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / 60000);
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
}
