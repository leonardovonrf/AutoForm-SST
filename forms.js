// Gerenciamento de Formulários
class FormsManager {
    constructor() {
        this.forms = [];
        this.currentEditingForm = null;
        this.init();
    }

    init() {
        this.loadForms();
        this.generateSampleData();
    }

    // Carregar formulários do localStorage
    loadForms() {
        const savedForms = localStorage.getItem('forms');
        if (savedForms) {
            this.forms = JSON.parse(savedForms);
        }
    }

    // Salvar formulários no localStorage
    saveForms() {
        localStorage.setItem('forms', JSON.stringify(this.forms));
    }

    // Obter todos os formulários
    getAllForms() {
        return this.forms;
    }

    // Obter formulário por ID
    getFormById(id) {
        return this.forms.find(form => form.id === parseInt(id));
    }

    // Criar novo formulário
    createForm(formData) {

        // --- INÍCIO DA NOVA LÓGICA ---
        // Encontra o ID mais alto na lista "this.forms"
        let maxId = 0;
        if (this.forms.length > 0) {
            maxId = this.forms.reduce((max, form) => (form.id > max ? form.id : max), 0);
        }
        const newId = maxId + 1;
        // --- FIM DA NOVA LÓGICA ---

        const newForm = {
            id: newId, // <-- ID alterado
            title: formData.title,
            description: formData.description,
            status: formData.status || 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: authManager.getCurrentUser()?.name || 'Usuário',
            type: formData.type || 'general'
        };
        
        this.forms.unshift(newForm); //
        this.saveForms(); //
        return newForm;
    }

    // Atualizar formulário
    updateForm(id, formData) {
        const formIndex = this.forms.findIndex(form => form.id === parseInt(id));
        if (formIndex !== -1) {
            this.forms[formIndex] = {
                ...this.forms[formIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };
            this.saveForms();
            return this.forms[formIndex];
        }
        return null;
    }

    // Deletar formulário
    deleteForm(id) {
        const formIndex = this.forms.findIndex(form => form.id === parseInt(id));
        if (formIndex !== -1) {
            const deletedForm = this.forms.splice(formIndex, 1)[0];
            this.saveForms();
            return deletedForm;
        }
        return null;
    }

    // Filtrar formulários
    filterForms(searchTerm = '', status = '') {
        let filtered = this.forms;
        
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(form => 
                form.title.toLowerCase().includes(term) ||
                form.description.toLowerCase().includes(term) ||
                form.createdBy.toLowerCase().includes(term)
            );
        }
        
        if (status) {
            filtered = filtered.filter(form => form.status === status);
        }
        
        return filtered;
    }

    // Obter estatísticas
    getStats() {
        const total = this.forms.length;
        const pending = this.forms.filter(form => form.status === 'pending').length;
        const completed = this.forms.filter(form => form.status === 'completed').length;
        const today = this.forms.filter(form => {
            const formDate = new Date(form.createdAt);
            const todayDate = new Date();
            return formDate.toDateString() === todayDate.toDateString();
        }).length;
        
        return { total, pending, completed, today };
    }

    // Obter formulários recentes (últimos 5)
    getRecentForms() {
        return this.forms
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 5);
    }
}

// Instância global do gerenciador de formulários
const formsManager = new FormsManager();

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('formsGrid')) {
        initFormsSection();
    }
});

function initFormsSection() {
    const searchInput = document.getElementById('searchForms');
    const statusFilter = document.getElementById('statusFilter');
    const refreshBtn = document.getElementById('refreshForms');
    const createFormBtn = document.getElementById('createFormBtn');
    const quickCreateForm = document.getElementById('quickCreateForm');

    // Carregar formulários inicialmente
    renderForms();

    // Busca em tempo real
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value;
            const status = statusFilter ? statusFilter.value : '';
            renderForms(searchTerm, status);
        });
    }

    // Filtro por status
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            const status = this.value;
            const searchTerm = searchInput ? searchInput.value : '';
            renderForms(searchTerm, status);
        });
    }

    // Botão de atualizar
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            formsManager.loadForms();
            renderForms();
            showToast('Lista de formulários atualizada!', 'success');
        });
    }

    // Botão criar formulário (link externo)
    if (createFormBtn) {
        createFormBtn.addEventListener('click', function() {
            // Simular abertura de sistema externo
            showToast('Abrindo sistema de criação de formulários...', 'success');
            
            // Em um cenário real, isso abriria uma nova aba
            // window.open('https://sistema-externo-formularios.com', '_blank');
            
            // Para demonstração, vamos simular a criação de um novo formulário
            setTimeout(() => {
                const newForm = formsManager.createForm({
                    title: `Novo Formulário ${Date.now()}`,
                    description: 'Formulário criado através do sistema externo',
                    status: 'draft',
                    type: 'external'
                });
                
                renderForms();
                updateDashboardStats();
                showToast('Novo formulário criado com sucesso!', 'success');
            }, 2000);
        });
    }

    // Botão de criação rápida no dashboard
    if (quickCreateForm) {
        quickCreateForm.addEventListener('click', function() {
            showSection('create');
        });
    }
}

function renderForms(searchTerm = '', status = '') {
    const formsGrid = document.getElementById('formsGrid');
    if (!formsGrid) return;

    const filteredForms = formsManager.filterForms(searchTerm, status);
    
    if (filteredForms.length === 0) {
        formsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-file-alt" style="font-size: 3rem; color: var(--text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--text-secondary); margin-bottom: 0.5rem;">Nenhum formulário encontrado</h3>
                <p style="color: var(--text-muted);">
                    ${searchTerm || status ? 'Tente ajustar os filtros de busca.' : 'Comece criando seu primeiro formulário.'}
                </p>
            </div>
        `;
        return;
    }

    formsGrid.innerHTML = filteredForms.map(form => `
        <div class="form-card" data-form-id="${form.id}" onclick="openForm(${form.id})" style="cursor:pointer;">
            <div class="form-card-header">
                <div>
                    <h3 class="form-card-title">${form.id} - ${form.title}</h3>
                    <p class="form-card-date">${formatDate(form.updatedAt)}</p>
                </div>
                <div class="form-card-actions">
                    <button class="icon-btn edit" onclick="editForm(event, ${form.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn delete" onclick="confirmDeleteForm(event, ${form.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <p class="form-card-description">${form.description}</p>
            
            <div class="form-card-footer">
                <span class="form-status ${form.status}">${getStatusText(form.status)}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">
                    por ${form.createdBy}
                </span>
            </div>
        </div>
    `).join('');
}

function editForm(event, formId) {
    event.stopPropagation();
    const form = formsManager.getFormById(formId);
    if (!form) return;

    formsManager.currentEditingForm = form;
    
    // Preencher o modal de edição
    document.getElementById('editTitle').value = form.title;
    document.getElementById('editDescription').value = form.description;
    document.getElementById('editStatus').value = form.status;
    
    // Mostrar modal
    showModal('editModal');
}

function saveForm() {
    if (!formsManager.currentEditingForm) return;

    const title = document.getElementById('editTitle').value.trim();
    const description = document.getElementById('editDescription').value.trim();
    const status = document.getElementById('editStatus').value;

    if (!title) {
        showToast('Título é obrigatório!', 'error');
        return;
    }

    const updatedForm = formsManager.updateForm(formsManager.currentEditingForm.id, {
        title,
        description,
        status
    });

    if (updatedForm) {
        closeModal('editModal');
        renderForms();
        updateDashboardStats();
        showToast('Formulário atualizado com sucesso!', 'success');
    } else {
        showToast('Erro ao atualizar formulário!', 'error');
    }
}

function confirmDeleteForm(event, formId) {
    event.stopPropagation();
    const form = formsManager.getFormById(formId);

    if (!form) return;

    showConfirmModal(
        `Tem certeza que deseja excluir o formulário "${form.title}"?`,
        () => deleteForm(formId)
    );
}

function deleteForm(formId) {
    const deletedForm = formsManager.deleteForm(formId);
    
    if (deletedForm) {
        renderForms();
        updateDashboardStats();
        showToast('Formulário excluído com sucesso!', 'success');
    } else {
        showToast('Erro ao excluir formulário!', 'error');
    }
}

function getStatusText(status) {
    const statusMap = {
        'draft': 'Rascunho',
        'pending': 'Pendente',
        'completed': 'Concluído'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
        return 'Hoje';
    } else if (diffDays === 2) {
        return 'Ontem';
    } else if (diffDays <= 7) {
        return `${diffDays - 1} dias atrás`;
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

// Função para atualizar estatísticas no dashboard
function updateDashboardStats() {
    const stats = formsManager.getStats();
    
    const totalElement = document.getElementById('totalForms');
    const pendingElement = document.getElementById('pendingForms');
    const completedElement = document.getElementById('completedForms');
    const todayElement = document.getElementById('todayForms');
    
    if (totalElement) totalElement.textContent = stats.total;
    if (pendingElement) pendingElement.textContent = stats.pending;
    if (completedElement) completedElement.textContent = stats.completed;
    if (todayElement) todayElement.textContent = stats.today;
}

// Função para renderizar formulários recentes no dashboard
function renderRecentForms() {
    const recentFormsContainer = document.getElementById('recentForms');
    if (!recentFormsContainer) return;

    const recentForms = formsManager.getRecentForms();
    
    if (recentForms.length === 0) {
        recentFormsContainer.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: var(--text-muted);">
                <i class="fas fa-file-alt" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                <p>Nenhum formulário encontrado</p>
            </div>
        `;
        return;
    }

    recentFormsContainer.innerHTML = recentForms.map(form => `
        <div class="form-item">
            <div class="form-info">
                <h4>${form.title}</h4>
                <p>Atualizado ${formatDate(form.updatedAt)} por ${form.createdBy}</p>
            </div>
            <span class="form-status ${form.status}">${getStatusText(form.status)}</span>
        </div>
    `).join('');
}

function openForm(id) {
    window.open(`formulario.html?id=${id}`, "_blank");
}


