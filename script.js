// 存储用户数据的键
const USERS_KEY = 'registered_users';

// DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initParticles();
    initInputEffects();
});

// 粒子效果初始化
function initParticles() {
    const particles = document.querySelectorAll('.particle');
    particles.forEach(particle => {
        resetParticle(particle);
    });
}

function resetParticle(particle) {
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = '100%';
    particle.style.opacity = '0';
    particle.style.transform = 'translateY(0) translateX(0)';

    void particle.offsetWidth;
    
    particle.style.opacity = '1';
    particle.style.transform = 'translateY(-100vh) translateX(100vw)';

    setTimeout(() => {
        resetParticle(particle);
    }, 4000);
}

// 输入框效果初始化
function initInputEffects() {
    const inputs = document.querySelectorAll('.cyber-input input');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '') {
                this.parentElement.classList.remove('focused');
            }
        });
    });
}

// 用户数据管理
function getRegisteredUsers() {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
}

function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 表单切换动画
function toggleForms() {
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    
    if (loginForm.style.display !== 'none') {
        loginForm.style.opacity = '0';
        loginForm.style.transform = 'translateX(-100px)';
        setTimeout(() => {
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            setTimeout(() => {
                registerForm.style.opacity = '1';
                registerForm.style.transform = 'translateX(0)';
            }, 50);
        }, 300);
    } else {
        registerForm.style.opacity = '0';
        registerForm.style.transform = 'translateX(100px)';
        setTimeout(() => {
            registerForm.style.display = 'none';
            loginForm.style.display = 'block';
            setTimeout(() => {
                loginForm.style.opacity = '1';
                loginForm.style.transform = 'translateX(0)';
            }, 50);
        }, 300);
    }
}

// 登录处理
async function handleLogin(event) {
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    button.innerHTML = '<span class="cyber-button__tag">登录中...</span>';
    
    try {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const users = getRegisteredUsers();
        
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (!users[username] || users[username] !== password) {
            showError('用户名或密码错误！');
            button.innerHTML = '<span class="cyber-button__tag">登录</span>';
            return false;
        }

        // 登录成功
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', username);
        
        button.innerHTML = '<span class="cyber-button__tag">登录成功!</span>';
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
        
    } catch (error) {
        showError('登录失败，请重试！');
        button.innerHTML = '<span class="cyber-button__tag">登录</span>';
    } finally {
        button.disabled = false;
    }
}

// 注册处理
async function handleRegister(event) {
    event.preventDefault();
    const button = event.currentTarget;
    button.disabled = true;
    button.innerHTML = '<span class="cyber-button__tag">注册中...</span>';
    
    try {
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            showError('两次输入的密码不一致！', 'register');
            return false;
        }

        const users = getRegisteredUsers();
        
        if (users[username]) {
            showError('用户名已存在！', 'register');
            return false;
        }

        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 保存新用户
        users[username] = password;
        saveUsers(users);
        
        button.innerHTML = '<span class="cyber-button__tag">注册成功!</span>';
        setTimeout(() => {
            toggleForms();
            showSuccess('注册成功！请登录');
        }, 500);
        
    } catch (error) {
        showError('注册失败，请重试！', 'register');
    } finally {
        button.disabled = false;
        button.innerHTML = '<span class="cyber-button__tag">注册</span>';
    }
}

// 错误提示
function showError(message, formType = 'login') {
    const form = document.querySelector(`.${formType}-form`);
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.color = 'var(--error)';
    error.style.textAlign = 'center';
    error.style.marginTop = '10px';
    
    form.appendChild(error);
    
    setTimeout(() => {
        error.remove();
    }, 3000);
}

// 成功提示
function showSuccess(message) {
    const form = document.querySelector('.login-form');
    const success = document.createElement('div');
    success.className = 'success-message';
    success.textContent = message;
    success.style.color = 'var(--primary)';
    success.style.textAlign = 'center';
    success.style.marginTop = '10px';
    
    form.appendChild(success);
    
    setTimeout(() => {
        success.remove();
    }, 3000);
} 
