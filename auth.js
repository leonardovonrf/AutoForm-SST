// Gerenciamento de Autenticação
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Verificar se há usuário logado no localStorage
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAuthenticated = true;
            
            // Se estiver na página de login e já autenticado, redirecionar
            if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
                this.redirectToDashboard();
            }
        } else {
            // Se não estiver autenticado e não estiver na página de login, redirecionar
            if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
                this.redirectToLogin();
            }
        }
    }

    // Credenciais de demonstração
    validateCredentials(email, password) {
        const validCredentials = [
            { email: 'admin@bombeiros.com', password: 'admin123', name: 'Administrador', role: 'admin' },
            { email: 'bombeiro@seguranca.com', password: 'bombeiro123', name: 'João Silva', role: 'user' },
            { email: 'supervisor@bombeiros.com', password: 'super123', name: 'Maria Santos', role: 'supervisor' },
            { email: 'demo', password: 'demo', name: 'Usuário Demo', role: 'user' }
        ];

        return validCredentials.find(cred => 
            (cred.email === email || cred.email === email.toLowerCase()) && 
            cred.password === password
        );
    }

    async login(email, password) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                const user = this.validateCredentials(email, password);
                
                if (user) {
                    this.currentUser = {
                        id: Date.now(),
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        loginTime: new Date().toISOString()
                    };
                    
                    this.isAuthenticated = true;
                    localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    
                    resolve(this.currentUser);
                } else {
                    reject(new Error('Credenciais inválidas'));
                }
            }, 1500); // Simular 1.5s de loading
        });
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userPreferences');
        this.redirectToLogin();
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    redirectToLogin() {
        window.location.href = 'index.html';
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    // Verificar se o usuário tem permissão para uma ação
    hasPermission(action) {
        if (!this.isAuthenticated) return false;
        
        const permissions = {
            'admin': ['create', 'read', 'update', 'delete', 'manage_users'],
            'supervisor': ['create', 'read', 'update', 'delete'],
            'user': ['create', 'read', 'update']
        };
        
        const userPermissions = permissions[this.currentUser.role] || [];
        return userPermissions.includes(action);
    }
}

// Instância global do gerenciador de autenticação
const authManager = new AuthManager();

// Funções para o formulário de login
document.addEventListener('DOMContentLoaded', function() {
    // Só executar se estivermos na página de login
    if (document.getElementById('loginForm')) {
        initLoginForm();
    }
    
    // Só executar se estivermos no dashboard
    if (document.getElementById('userBtn')) {
        initUserMenu();
    }
});

function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('loginBtn');
    const togglePassword = document.getElementById('togglePassword');
    const rememberMe = document.getElementById('rememberMe');

    // Toggle de visibilidade da senha
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Validação em tempo real
    emailInput.addEventListener('input', function() {
        clearError('emailError');
        if (this.value.trim() === '') {
            showError('emailError', 'Email ou usuário é obrigatório');
        }
    });

    passwordInput.addEventListener('input', function() {
        clearError('passwordError');
        if (this.value.trim() === '') {
            showError('passwordError', 'Senha é obrigatória');
        }
    });

    // Submissão do formulário
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validação
        let hasErrors = false;
        
        if (!email) {
            showError('emailError', 'Email ou usuário é obrigatório');
            hasErrors = true;
        }
        
        if (!password) {
            showError('passwordError', 'Senha é obrigatória');
            hasErrors = true;
        }
        
        if (hasErrors) return;
        
        // Mostrar loading
        setLoginLoading(true);
        
        try {
            const user = await authManager.login(email, password);
            
            // Salvar preferência "lembrar de mim"
            if (rememberMe.checked) {
                localStorage.setItem('rememberUser', email);
            } else {
                localStorage.removeItem('rememberUser');
            }
            
            showToast('Login realizado com sucesso!', 'success');
            
            // Pequeno delay antes do redirecionamento
            setTimeout(() => {
                authManager.redirectToDashboard();
            }, 1000);
            
        } catch (error) {
            showToast(error.message, 'error');
            setLoginLoading(false);
        }
    });

    // Carregar email salvo se "lembrar de mim" estava marcado
    const rememberedUser = localStorage.getItem('rememberUser');
    if (rememberedUser) {
        emailInput.value = rememberedUser;
        rememberMe.checked = true;
    }

    // Adicionar credenciais de demonstração na tela
    //addDemoCredentials();
}

function initUserMenu() {
    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userName = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');

    // Mostrar nome do usuário
    const currentUser = authManager.getCurrentUser();
    if (currentUser && userName) {
        userName.textContent = currentUser.name;
    }

    // Toggle do menu do usuário
    if (userBtn) {
        userBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });
    }

    // Fechar menu ao clicar fora
    document.addEventListener('click', function() {
        if (userDropdown) {
            userDropdown.classList.remove('show');
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            showConfirmModal(
                'Tem certeza que deseja sair do sistema?',
                () => {
                    showToast('Logout realizado com sucesso!', 'success');
                    setTimeout(() => {
                        authManager.logout();
                    }, 1000);
                }
            );
        });
    }
}

function setLoginLoading(loading) {
    const loginBtn = document.getElementById('loginBtn');
    const btnText = loginBtn.querySelector('.btn-text');
    const loadingSpinner = loginBtn.querySelector('.loading-spinner');
    
    if (loading) {
        loginBtn.classList.add('loading');
        loginBtn.disabled = true;
        btnText.style.opacity = '0';
        loadingSpinner.style.display = 'block';
    } else {
        loginBtn.classList.remove('loading');
        loginBtn.disabled = false;
        btnText.style.opacity = '1';
        loadingSpinner.style.display = 'none';
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

function addDemoCredentials() {
    // Adicionar informações de credenciais de demonstração
    const loginFooter = document.querySelector('.login-footer');
    if (loginFooter) {
        const demoInfo = document.createElement('div');
        demoInfo.className = 'demo-credentials';
        demoInfo.style.marginTop = '1rem';
        demoInfo.style.padding = '1rem';
        demoInfo.style.backgroundColor = 'var(--bg-secondary)';
        demoInfo.style.borderRadius = 'var(--radius-md)';
        demoInfo.style.fontSize = '0.75rem';
        demoInfo.style.color = 'var(--text-secondary)';
        
        demoInfo.innerHTML = `
            <strong style="color: var(--text-primary);">Credenciais de Demonstração:</strong><br>
            <strong>Admin:</strong> admin@bombeiros.com / admin123<br>
            <strong>Usuário:</strong> demo / demo<br>
            <strong>Supervisor:</strong> supervisor@bombeiros.com / super123
        `;
        
        loginFooter.appendChild(demoInfo);
    }
}

