/**
 * 前端交互脚本
 * 处理登录和UI交互
 */

class LoginUI {
    constructor() {
        this.form = document.querySelector('.login-card');
        this.usernameInput = document.getElementById('username');
        this.passwordInput = document.getElementById('password');
        this.loginBtn = document.querySelector('.login-btn');
        this.rememberCheckbox = document.querySelector('input[type="checkbox"]');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 登录按钮点击事件
        this.loginBtn.addEventListener('click', (e) => this.handleLogin(e));

        // 输入框动画效果
        document.querySelectorAll('.cyber-input').forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });

        // 回车键登录
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin(e);
            }
        });
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = this.usernameInput.value.trim();
        const password = this.passwordInput.value;

        // 表单验证
        if (!this.validateForm(username, password)) {
            return;
        }

        this.setLoadingState(true);

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // 登录成功
                this.handleLoginSuccess(data);
            } else {
                // 登录失败
                this.showError(data.error || '登录失败');
            }
        } catch (error) {
            console.error('登录错误:', error);
            this.showError('网络错误，请稍后重试');
        } finally {
            this.setLoadingState(false);
        }
    }

    validateForm(username, password) {
        if (!username || !password) {
            this.showError('请输入用户名和密码');
            return false;
        }

        if (username.length < 3) {
            this.showError('用户名长度不能小于3个字符');
            return false;
        }

        if (password.length < 6) {
            this.showError('密码长度不能小于6个字符');
            return false;
        }

        return true;
    }

    setLoadingState(isLoading) {
        if (isLoading) {
            this.loginBtn.classList.add('loading');
            this.loginBtn.disabled = true;
        } else {
            this.loginBtn.classList.remove('loading');
            this.loginBtn.disabled = false;
        }
    }

    handleLoginSuccess(data) {
        // 保存token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // 记住密码逻辑
        if (this.rememberCheckbox.checked) {
            localStorage.setItem('remembered_username', this.usernameInput.value);
        } else {
            localStorage.removeItem('remembered_username');
        }

        // 显示成功动画
        this.loginBtn.classList.add('success');
        
        setTimeout(() => {
            // 跳转到主页
            window.location.href = '/dashboard.html';
        }, 1000);
    }

    showError(message) {
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        this.form.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const loginUI = new LoginUI();

    // 检查是否已登录
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    }

    // 恢复记住的用户名
    const rememberedUsername = localStorage.getItem('remembered_username');
    if (rememberedUsername) {
        document.getElementById('username').value = rememberedUsername;
        document.querySelector('input[type="checkbox"]').checked = true;
    }
}); 
