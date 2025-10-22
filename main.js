// Funcionalidades principais e utilitários compartilhados

// Gerenciamento de Modais
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro input do modal
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        
        // Limpar formulários do modal
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
    }
}

// Fechar modal ao clicar fora
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        const modalId = e.target.id;
        closeModal(modalId);
    }
});

// Fechar modal com ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
            closeModal(openModal.id);
        }
    }
});

// Gerenciamento de Toast Notifications
let toastTimeout;

function showToast(message, type = 'success', duration = 4000) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Limpar classes anteriores
    toast.classList.remove('success', 'error', 'warning', 'info');
    
    // Adicionar nova classe
    toast.classList.add(type);
    
    // Definir ícone baseado no tipo
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    toastIcon.className = `toast-icon ${icons[type] || icons.info}`;
    toastMessage.textContent = message;
    
    // Mostrar toast
    toast.classList.add('show');
    
    // Auto-hide após duração especificada
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        hideToast();
    }, duration);
}

function hideToast() {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.classList.remove('show');
    }
    clearTimeout(toastTimeout);
}

// Modal de Confirmação
function showConfirmModal(message, onConfirm, onCancel = null) {
    const modal = document.getElementById('confirmModal');
    const messageElement = document.getElementById('confirmMessage');
    const confirmButton = document.getElementById('confirmAction');
    
    if (modal && messageElement && confirmButton) {
        messageElement.textContent = message;
        
        // Remover listeners anteriores
        const newConfirmButton = confirmButton.cloneNode(true);
        confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);
        
        // Adicionar novo listener
        newConfirmButton.addEventListener('click', function() {
            closeModal('confirmModal');
            if (onConfirm) onConfirm();
        });
        
        showModal('confirmModal');
    }
}

// Utilitários de Validação
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateRequired(value) {
    return value && value.trim().length > 0;
}

function validateMinLength(value, minLength) {
    return value && value.length >= minLength;
}

function validateMaxLength(value, maxLength) {
    return !value || value.length <= maxLength;
}

// Utilitários de Formatação
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

function formatNumber(value) {
    return new Intl.NumberFormat('pt-BR').format(value);
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Utilitários de Debounce e Throttle
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Utilitários de Local Storage
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error('Erro ao salvar no localStorage:', error);
        return false;
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Erro ao carregar do localStorage:', error);
        return defaultValue;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (error) {
        console.error('Erro ao remover do localStorage:', error);
        return false;
    }
}

// Utilitários de Animação
function fadeIn(element, duration = 300) {
    element.style.opacity = 0;
    element.style.display = 'block';
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = Math.min(progress / duration, 1);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        }
    }
    
    requestAnimationFrame(animate);
}

function fadeOut(element, duration = 300) {
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        element.style.opacity = Math.max(1 - (progress / duration), 0);
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.display = 'none';
        }
    }
    
    requestAnimationFrame(animate);
}

function slideDown(element, duration = 300) {
    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.display = 'block';
    
    const targetHeight = element.scrollHeight;
    
    let start = null;
    function animate(timestamp) {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        
        const height = Math.min((progress / duration) * targetHeight, targetHeight);
        element.style.height = height + 'px';
        
        if (progress < duration) {
            requestAnimationFrame(animate);
        } else {
            element.style.height = '';
            element.style.overflow = '';
        }
    }
    
    requestAnimationFrame(animate);
}

// Utilitários de Clipboard
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast('Copiado para a área de transferência!', 'success');
        return true;
    } catch (error) {
        console.error('Erro ao copiar:', error);
        showToast('Erro ao copiar para a área de transferência', 'error');
        return false;
    }
}

// Utilitários de URL
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function setUrlParameter(name, value) {
    const url = new URL(window.location);
    url.searchParams.set(name, value);
    window.history.pushState({}, '', url);
}

function removeUrlParameter(name) {
    const url = new URL(window.location);
    url.searchParams.delete(name);
    window.history.pushState({}, '', url);
}

// Utilitários de Dispositivo
function isMobile() {
    return window.innerWidth <= 768;
}

function isTablet() {
    return window.innerWidth > 768 && window.innerWidth <= 1024;
}

function isDesktop() {
    return window.innerWidth > 1024;
}

function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Utilitários de Performance
function measurePerformance(name, func) {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    console.log(`${name} executado em ${end - start} milissegundos`);
    return result;
}

// Lazy Loading de Imagens
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Gerenciamento de Erros Globais
window.addEventListener('error', function(e) {
    console.error('Erro JavaScript:', e.error);
    showToast('Ocorreu um erro inesperado. Tente novamente.', 'error');
});

window.addEventListener('unhandledrejection', function(e) {
    console.error('Promise rejeitada:', e.reason);
    showToast('Erro de conexão. Verifique sua internet.', 'error');
});

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar lazy loading se houver imagens
    if (document.querySelectorAll('img[data-src]').length > 0) {
        initLazyLoading();
    }
    
    // Adicionar classe para indicar que JavaScript está ativo
    document.documentElement.classList.add('js-enabled');
    
    // Configurar tooltips personalizados
    initTooltips();
    
    // Configurar atalhos de teclado
    initKeyboardShortcuts();
});

// Sistema de Tooltips
function initTooltips() {
    const elementsWithTooltip = document.querySelectorAll('[title]');
    
    elementsWithTooltip.forEach(element => {
        const title = element.getAttribute('title');
        element.removeAttribute('title');
        element.setAttribute('data-tooltip', title);
        
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
    
    setTimeout(() => tooltip.classList.add('show'), 10);
}

function hideTooltip() {
    const tooltip = document.querySelector('.custom-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Atalhos de Teclado
function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K para busca rápida
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.getElementById('searchForms');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Ctrl/Cmd + N para novo formulário
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            if (typeof showSection === 'function') {
                showSection('create');
            }
        }
        
        // Ctrl/Cmd + D para dashboard
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            if (typeof showSection === 'function') {
                showSection('dashboard');
            }
        }
    });
}

// Adicionar estilos CSS para tooltips e outros elementos
const customStyles = `
    .custom-tooltip {
        position: absolute;
        background: var(--bg-card);
        color: var(--text-primary);
        padding: 0.5rem 0.75rem;
        border-radius: var(--radius-sm);
        font-size: 0.75rem;
        box-shadow: var(--shadow-lg);
        border: 1px solid var(--border-color);
        z-index: 1000;
        opacity: 0;
        transform: translateY(4px);
        transition: all 0.2s ease;
        pointer-events: none;
        white-space: nowrap;
    }
    
    .custom-tooltip.show {
        opacity: 1;
        transform: translateY(0);
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
    
    mark {
        background-color: #fef08a;
        color: #92400e;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
    }
    
    [data-theme="dark"] mark {
        background-color: #451a03;
        color: #fbbf24;
    }
`;

// Adicionar estilos ao documento
const styleSheet = document.createElement('style');
styleSheet.textContent = customStyles;
document.head.appendChild(styleSheet);

// Exportar funções para uso global
window.showModal = showModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.hideToast = hideToast;
window.showConfirmModal = showConfirmModal;

