// Gerenciamento do Dashboard
class DashboardManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.sidebarCollapsed = false;
        this.init();
    }

    init() {
        this.initNavigation();
        this.initSidebar();
        this.loadDashboardData();
        
        // Verificar se há uma seção específica na URL
        const urlParams = new URLSearchParams(window.location.search);
        const section = urlParams.get('section');
        if (section) {
            this.showSection(section);
        }
    }

    initNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });
    }

    initSidebar() {
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                this.toggleSidebar();
            });
        }

        // Fechar sidebar ao clicar fora em dispositivos móveis
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 1024) {
                const sidebar = document.getElementById('sidebar');
                const sidebarToggle = document.getElementById('sidebarToggle');
                
                if (sidebar && !sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('show');
                }
            }
        });
    }

    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('show');
            this.sidebarCollapsed = !this.sidebarCollapsed;
        }
    }

    showSection(sectionName) {
        // Remover classe active de todas as seções
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => section.classList.remove('active'));
        
        // Remover classe active de todos os nav items
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => item.classList.remove('active'));
        
        // Mostrar seção selecionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
            
            // Ativar nav item correspondente
            const navLink = document.querySelector(`[data-section="${sectionName}"]`);
            if (navLink) {
                navLink.closest('.nav-item').classList.add('active');
            }
            
            // Carregar dados específicos da seção
            this.loadSectionData(sectionName);
            
            // Atualizar URL sem recarregar a página
            const url = new URL(window.location);
            url.searchParams.set('section', sectionName);
            window.history.pushState({}, '', url);
        }

        // Fechar sidebar em dispositivos móveis
        if (window.innerWidth <= 1024) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('show');
            }
        }
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'forms':
                if (typeof renderForms === 'function') {
                    renderForms();
                }
                break;
            case 'create':
                // Seção de criação não precisa carregar dados específicos
                break;
            case 'reports':
                this.loadReportsData();
                break;
        }
    }

    loadDashboardData() {
        // Atualizar estatísticas
        updateDashboardStats();
        
        // Renderizar formulários recentes
        renderRecentForms();
        
        // Animar contadores
        this.animateCounters();
    }

    loadReportsData() {
        // Implementar carregamento de dados de relatórios
        console.log('Carregando dados de relatórios...');
    }

    animateCounters() {
        const counters = document.querySelectorAll('.stat-content h3');
        counters.forEach(counter => {
            const target = parseInt(counter.textContent);
            const increment = target / 20;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 50);
        });
    }
}

// Gerenciamento de Tema
class ThemeManager {
    constructor() {
        this.currentTheme = 'light';
        this.init();
    }

    init() {
        // Carregar tema salvo
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else {
            // Detectar preferência do sistema
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.setTheme(prefersDark ? 'dark' : 'light');
        }

        // Configurar botão de toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                this.toggleTheme();
            });
        }

        // Escutar mudanças na preferência do sistema
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.setTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        
        // Atualizar ícone do botão
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
        
        // Salvar preferência
        localStorage.setItem('theme', theme);
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
        
        // Feedback visual
        showToast(`Tema ${newTheme === 'dark' ? 'escuro' : 'claro'} ativado!`, 'success');
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// Instâncias globais
let dashboardManager;
let themeManager;

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página do dashboard
    if (document.querySelector('.dashboard-page')) {
        dashboardManager = new DashboardManager();
        themeManager = new ThemeManager();
        
        // Inicializar outras funcionalidades
        initReportsSection();
        initResponsiveFeatures();
    }
});

// Função global para mostrar seções (usada por outros scripts)
function showSection(sectionName) {
    if (dashboardManager) {
        dashboardManager.showSection(sectionName);
    }
}

function initReportsSection() {
    // Implementar funcionalidades da seção de relatórios
    const reportButtons = document.querySelectorAll('.report-card .btn');
    reportButtons.forEach(button => {
        button.addEventListener('click', function() {
            const reportType = this.closest('.report-card').querySelector('h3').textContent;
            
            // Simular geração de relatório
            showToast(`Gerando ${reportType}...`, 'success');
            
            setTimeout(() => {
                showToast(`${reportType} gerado com sucesso!`, 'success');
            }, 2000);
        });
    });
}

function initResponsiveFeatures() {
    // Ajustar layout baseado no tamanho da tela
    function handleResize() {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth > 1024) {
            if (sidebar) {
                sidebar.classList.remove('show');
            }
        }
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Executar uma vez no carregamento
}

// Funcionalidades de busca avançada
function initAdvancedSearch() {
    const searchInput = document.getElementById('searchForms');
    if (!searchInput) return;

    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        
        // Debounce para evitar muitas chamadas
        searchTimeout = setTimeout(() => {
            const searchTerm = this.value.trim();
            
            if (searchTerm.length >= 2) {
                // Destacar termos de busca nos resultados
                highlightSearchTerms(searchTerm);
            } else {
                // Remover destaques se a busca for muito curta
                removeHighlights();
            }
        }, 300);
    });
}

function highlightSearchTerms(searchTerm) {
    const formCards = document.querySelectorAll('.form-card');
    formCards.forEach(card => {
        const title = card.querySelector('.form-card-title');
        const description = card.querySelector('.form-card-description');
        
        if (title && description) {
            // Implementar destaque dos termos de busca
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            
            title.innerHTML = title.textContent.replace(regex, '<mark>$1</mark>');
            description.innerHTML = description.textContent.replace(regex, '<mark>$1</mark>');
        }
    });
}

function removeHighlights() {
    const highlights = document.querySelectorAll('mark');
    highlights.forEach(mark => {
        mark.outerHTML = mark.innerHTML;
    });
}

// Funcionalidades de exportação
function exportFormsData(format = 'csv') {
    const forms = formsManager.getAllForms();
    
    if (format === 'csv') {
        exportToCSV(forms);
    } else if (format === 'json') {
        exportToJSON(forms);
    }
}

function exportToCSV(forms) {
    const headers = ['ID', 'Título', 'Descrição', 'Status', 'Criado em', 'Atualizado em', 'Criado por'];
    const csvContent = [
        headers.join(','),
        ...forms.map(form => [
            form.id,
            `"${form.title}"`,
            `"${form.description}"`,
            form.status,
            form.createdAt,
            form.updatedAt,
            `"${form.createdBy}"`
        ].join(','))
    ].join('\n');
    
    downloadFile(csvContent, 'formularios.csv', 'text/csv');
}

function exportToJSON(forms) {
    const jsonContent = JSON.stringify(forms, null, 2);
    downloadFile(jsonContent, 'formularios.json', 'application/json');
}

function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
    
    showToast(`Arquivo ${filename} baixado com sucesso!`, 'success');
}

// Funcionalidades de impressão
function printFormsList() {
    const forms = formsManager.getAllForms();
    const printContent = generatePrintContent(forms);
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

function generatePrintContent(forms) {
    const currentUser = authManager.getCurrentUser();
    const currentDate = new Date().toLocaleDateString('pt-BR');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Lista de Formulários</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .status.pending { background-color: #fef3c7; color: #92400e; }
                .status.completed { background-color: #d1fae5; color: #065f46; }
                .status.draft { background-color: #e5e7eb; color: #374151; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Sistema de Formulários - Bombeiros/Segurança do Trabalho</h1>
                <h2>Lista de Formulários</h2>
            </div>
            
            <div class="info">
                <p><strong>Gerado por:</strong> ${currentUser?.name || 'Usuário'}</p>
                <p><strong>Data:</strong> ${currentDate}</p>
                <p><strong>Total de formulários:</strong> ${forms.length}</p>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Título</th>
                        <th>Status</th>
                        <th>Criado por</th>
                        <th>Data de Criação</th>
                    </tr>
                </thead>
                <tbody>
                    ${forms.map(form => `
                        <tr>
                            <td>${form.id}</td>
                            <td>${form.title}</td>
                            <td><span class="status ${form.status}">${getStatusText(form.status)}</span></td>
                            <td>${form.createdBy}</td>
                            <td>${new Date(form.createdAt).toLocaleDateString('pt-BR')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </body>
        </html>
    `;
}

