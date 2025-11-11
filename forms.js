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

    // Gerar dados de exemplo se não houver formulários
    generateSampleData() {
         const sampleForms = [

            ];
             
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
                    
                    <button class="icon-btn download" onclick="generateReportPDF(event, ${form.id})" title="Baixar PDF">
                        <i class="fas fa-file-pdf"></i>
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


// ==================================================================
// === FUNÇÃO DE PDF CORRIGIDA ===
// ==================================================================

/**
 * Converte um arquivo (de fetch) para Base64
 */
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

/**
 * Função principal para gerar o PDF
 */
async function generateReportPDF(event, formId) {
    // 1. Impedir que o clique abra o formulário
    event.stopPropagation();
    
    // Envolver toda a função em um try/catch para evitar "unhandledrejection"
    try {
        // 2. Obter os dados do formulário
        const form = formsManager.getFormById(formId);
        if (!form || !form.data) {
            throw new Error("Dados do formulário não encontrados.");
        }
        const data = form.data;

        // 3. Inicializar o jsPDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4'); // P = Retrato, mm = milímetros, A4 = 210x297mm
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const contentWidth = pageWidth - (margin * 2);

        // 4. Carregar o logo
        try { 
            const response = await fetch('logo_ccs.png');
            if (!response.ok) { // Adiciona verificação se o fetch foi bem sucedido
                 throw new Error(`Falha ao carregar logo: ${response.statusText}`);
            }
            const blob = await response.blob();
            const logoBase64 = await toBase64(blob);
            
            // *** CORREÇÃO: A LINHA ABAIXO FOI MOVIDA PARA DENTRO DESTE TRY BLOCK ***
            doc.addImage(logoBase64, 'PNG', 15, 12, 20, 20);
        } catch (e) {
            console.error("Erro ao carregar o logo:", e);
            // A função continuará sem o logo, mas não vai quebrar.
        }

        // --- PÁGINA 1: CABEÇALHO E ANÁLISE ---

        // Título
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('RNC - RELATÓRIO DE NÃO CONFORMIDADE', 40, 20);

        // Bloco Nº
        doc.setFontSize(9);
        doc.text('Nº', 170, 15);
        doc.rect(170, 17, 25, 8); // x, y, w, h
        doc.setFont('helvetica', 'normal');
        doc.text(data.numero || '', 172, 22);

        // Bloco Datas
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DATA DE ABERTURA', margin, 40);
        doc.rect(margin, 42, (contentWidth / 2) - 5, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data['data-abertura'] || '', margin + 2, 47);

        doc.setFont('helvetica', 'bold');
        doc.text('DATA DE FECHAMENTO', margin + (contentWidth / 2) + 5, 40);
        doc.rect(margin + (contentWidth / 2) + 5, 42, (contentWidth / 2) - 5, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data['data-fechamento'] || '', margin + (contentWidth / 2) + 7, 47);

        // Bloco Origem
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TIPO DE RELATÓRIO / ORIGEM DA NÃO CONFORMIDADE', margin, 60);
        doc.setFontSize(9);
        
        // Helper para desenhar checkbox
        const drawCheckbox = (x, y, text, isChecked) => {
            doc.rect(x, y, 4, 4);
            doc.setFont('helvetica', 'normal');
            doc.text(text, x + 6, y + 3);
            if (isChecked) {
                doc.setFont('helvetica', 'bold');
                doc.text('X', x + 1, y + 3.2);
            }
        };

        drawCheckbox(margin, 67, 'PROCESSO', data.origem === 'processo');
        drawCheckbox(margin + 45, 67, 'ACIDENTE / INCIDENTE', data.origem === 'acidente');
        drawCheckbox(margin + 90, 67, 'MEIO AMBIENTE', data.origem === 'meio-ambiente');
        drawCheckbox(margin, 74, 'AUDITORIA INTERNA', data.origem === 'auditoria');
        drawCheckbox(margin + 45, 74, 'RECLAMAÇÃO CLIENTE', data.origem === 'reclamacao');
        
        // Bloco Responsável
        const respY = 85;
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('RESPONSÁVEL:', margin, respY);
        doc.rect(margin, respY + 2, contentWidth, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data.responsavel || '', margin + 2, respY + 7);

        const respY2 = 100;
        doc.setFont('helvetica', 'bold');
        doc.text('CARGO', margin, respY2);
        doc.rect(margin, respY2 + 2, 55, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data.cargo || '', margin + 2, respY2 + 7);

        doc.setFont('helvetica', 'bold');
        doc.text('SETOR', margin + 60, respY2);
        doc.rect(margin + 60, respY2 + 2, 55, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data.setor || '', margin + 62, respY2 + 7);

        doc.setFont('helvetica', 'bold');
        doc.text('MATRÍCULA', margin + 120, respY2);
        doc.rect(margin + 120, respY2 + 2, 60, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data.matricula || '', margin + 122, respY2 + 7);

        // Bloco Análise
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('ANÁLISE', margin, 120);

        const descY = 125;
        doc.setFontSize(9);
        doc.text('DESCRIÇÃO DA OCORRÊNCIA', margin, descY);
        doc.rect(margin, descY + 2, contentWidth, 30);
        doc.setFont('helvetica', 'normal');
        const ocorrenciaTexto = doc.splitTextToSize(data['descricao-ocorrencia'] || '', contentWidth - 4);
        doc.text(ocorrenciaTexto, margin + 2, descY + 7);

        const naoConfY = 162;
        doc.setFont('helvetica', 'bold');
        doc.text('DESCRIÇÃO DA NÃO CONFORMIDADE/CAUSAS PROVÁVEIS', margin, naoConfY);
        doc.rect(margin, naoConfY + 2, contentWidth, 30);
        doc.setFont('helvetica', 'normal');
        const naoConfTexto = doc.splitTextToSize(data['descricao-nao-conformidade'] || '', contentWidth - 4);
        doc.text(naoConfTexto, margin + 2, naoConfY + 7);
        
        const refY = 199;
        doc.setFont('helvetica', 'bold');
        doc.text('REFERÊNCIAS NORMATIVAS:', margin, refY);
        doc.rect(margin, refY + 2, contentWidth, 10);
        doc.setFont('helvetica', 'normal');
        const refTexto = doc.splitTextToSize(data.referencias || '', contentWidth - 4);
        doc.text(refTexto, margin + 2, refY + 7);


        // --- PÁGINA 2: AÇÕES E IMAGENS ---
        doc.addPage();
        let currentY = 20;

        // Bloco Tomada de Ações
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('TOMADA DE AÇÕES', margin, currentY);
        currentY += 10;

        doc.setFontSize(9);
        doc.text('AÇÕES CORRETIVAS A SEREM TOMADAS', margin, currentY);
        doc.rect(margin, currentY + 2, contentWidth, 25);
        doc.setFont('helvetica', 'normal');
        const corretivasTexto = doc.splitTextToSize(data['acoes-corretivas'] || '', contentWidth - 4);
        doc.text(corretivasTexto, margin + 2, currentY + 7);
        currentY += 32;

        doc.setFont('helvetica', 'bold');
        doc.text('RESPONSÁVEL', margin, currentY);
        doc.rect(margin, currentY + 2, contentWidth, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data['responsavel-acoes'] || '', margin + 2, currentY + 7);
        currentY += 15;

        doc.setFont('helvetica', 'bold');
        doc.text('AÇÕES PREVENTIVAS, quando aplicáveis', margin, currentY);
        doc.rect(margin, currentY + 2, contentWidth, 25);
        doc.setFont('helvetica', 'normal');
        const preventivasTexto = doc.splitTextToSize(data['acoes-preventivas'] || '', contentWidth - 4);
        doc.text(preventivasTexto, margin + 2, currentY + 7);
        currentY += 32;

        doc.setFont('helvetica', 'bold');
        doc.text('RESPONSÁVEL', margin, currentY);
        doc.rect(margin, currentY + 2, contentWidth, 8);
        doc.setFont('helvetica', 'normal');
        doc.text(data['responsavel-acoes-prev'] || '', margin + 2, currentY + 7);
        currentY += 20;

        // --- LÓGICA DINÂMICA PARA IMAGENS ---
        
        // 1. Encontrar e organizar todas as imagens do formulário
        const imagesData = [];
        for (const key in data) {
            const match = key.match(/^preview(\d+)_base64$/);
            if (match) {
                const imgNumber = parseInt(match[1]);
                const descKey = `desc-img${imgNumber}`;
                imagesData.push({
                    number: imgNumber,
                    base64: data[key],
                    description: data[descKey] || ''
                });
            }
        }
        imagesData.sort((a, b) => a.number - b.number);

        if (imagesData.length > 0) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('REGISTRO ICONOGRÁFICO', margin, currentY);
            currentY += 10;

            const imgWidth = (contentWidth / 2) - 5;
            const imgHeight = imgWidth * 0.75; 
            const x1 = margin;
            const x2 = margin + imgWidth + 10;

            // 2. Loop para desenhar cada imagem
            imagesData.forEach((imgItem, index) => {
                const isLeftColumn = index % 2 === 0;
                const currentX = isLeftColumn ? x1 : x2;

                if (isLeftColumn && (currentY + imgHeight + 20 > pageHeight - margin)) {
                    doc.addPage();
                    currentY = margin;
                }

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.text(`Imagem ${imgItem.number}`, currentX, currentY);
                try {
                    doc.addImage(imgItem.base64, 'PNG', currentX, currentY + 2, imgWidth, imgHeight);
                } catch(e) {
                    console.error(`Erro ao adicionar imagem ${imgItem.number}:`, e);
                    doc.text('Erro ao carregar imagem.', currentX + 5, currentY + (imgHeight / 2));
                }
                doc.rect(currentX, currentY + 4 + imgHeight, imgWidth, 10); 
                doc.setFont('helvetica', 'normal');
                doc.text(imgItem.description, currentX + 2, currentY + 8 + imgHeight);

                if (!isLeftColumn) {
                    currentY += imgHeight + 20;
                }
            });
        }

        // 5. Salvar o PDF
        doc.save(`RNC_${data.numero || form.id}.pdf`);
        showToast("PDF gerado com sucesso!", "success");

    } catch (e) {
        // Se qualquer erro ocorrer, ele será pego aqui
        console.error("Erro ao gerar PDF:", e);
        showToast(`Erro ao gerar PDF: ${e.message}`, "error");
    }
}


