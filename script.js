document.addEventListener('DOMContentLoaded', async function() {
    // 初始化粒子效果
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 100,
                density: {
                    enable: true,
                    value_area: 1000
                }
            },
            color: {
                value: ['#ffffff', '#ff8533', '#ff6700']
            },
            shape: {
                type: ['circle', 'triangle'],
                stroke: {
                    width: 0,
                    color: '#ffffff'
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.3,
                width: 1
            },
            move: {
                enable: true,
                speed: 2,
                direction: 'none',
                random: false,
                straight: false,
                out_mode: 'bounce',
                bounce: true,
                attract: {
                    enable: true,
                    rotateX: 1200,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: {
                    enable: true,
                    mode: ['grab', 'bubble']
                },
                onclick: {
                    enable: true,
                    mode: 'push'
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 200,
                    line_linked: {
                        opacity: 0.8
                    }
                },
                bubble: {
                    distance: 200,
                    size: 6,
                    duration: 0.3,
                    opacity: 0.8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });

    // 添加刷步数功能
    const submitBtn = document.querySelector('.submit-btn');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const stepsInput = document.getElementById('steps');

    // 添加一个显示结果的容器到 HTML
    const resultContainer = document.createElement('div');
    resultContainer.className = 'result-container';
    resultContainer.style.cssText = `
        margin-top: 20px;
        padding: 15px;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 8px;
        color: white;
        font-family: monospace;
        display: none;
        backdrop-filter: blur(10px);
    `;
    document.querySelector('.form-container').appendChild(resultContainer);

    // 修改提交函数
    async function submitSteps() {
        const phone = phoneInput.value.trim();
        const password = passwordInput.value.trim();
        const steps = stepsInput.value.trim();

        // 输入验证
        if (!phone || !password || !steps) {
            alert('请填写完整信息！');
            return;
        }

        if (isNaN(steps) || steps < 0 || steps > 100000) {
            alert('步数必须是0-100000之间的数字！');
            return;
        }

        try {
            submitBtn.disabled = true;
            submitBtn.textContent = '提交中...';

            const url = `https://steps.api.030101.xyz/api?account=${encodeURIComponent(phone)}&password=${encodeURIComponent(password)}&steps=${steps}`;
            
            // 显示加载状态
            resultContainer.style.display = 'block';
            resultContainer.innerHTML = `
                <div style="text-align: center; color: #888;">
                    正在提交请求...
                </div>
            `;

            // 创建一个嵌入式框架
            const resultFrame = document.createElement('iframe');
            resultFrame.style.cssText = `
                width: 100%;
                height: 100px;
                border: none;
                background: transparent;
                margin-top: 10px;
                border-radius: 4px;
                overflow: hidden;
            `;
            resultContainer.appendChild(resultFrame);

            // 加载URL
            resultFrame.src = url;

            // 如果成功则清空步数输入
            stepsInput.value = '';

        } catch (error) {
            resultContainer.innerHTML = `
                <div style="color: #ff6b6b; text-align: center;">
                    提交失败，请稍后重试
                </div>
            `;
            console.error('Error:', error);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = '提交修改';
        }
    }

    // 添加提交按钮事件监听
    submitBtn.addEventListener('click', submitSteps);

    // 添加回车键提交功能
    const inputs = [phoneInput, passwordInput, stepsInput];
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitSteps();
            }
        });
    });

    // 页面切换逻辑
    const instructionsPage = document.querySelector('.instructions-page');
    const formPage = document.querySelector('.form-page');
    const startBtn = document.querySelector('.start-btn');
    const backBtn = document.querySelector('.back-btn');

    // 初始化页面状态
    instructionsPage.classList.add('active');
    formPage.style.display = 'none';

    // 切换页面函数
    function switchPage(from, to) {
        from.classList.remove('active');
        setTimeout(() => {
            from.style.display = 'none';
            to.style.display = 'block';
            setTimeout(() => {
                to.classList.add('active');
            }, 50);
        }, 500);
    }

    // 显示表单页面
    startBtn.addEventListener('click', () => {
        switchPage(instructionsPage, formPage);
    });

    // 返回说明页面
    backBtn.addEventListener('click', () => {
        // 如果正在显示结果，先隐藏结果
        if (resultContainer.style.display === 'block') {
            resultContainer.style.display = 'none';
        }
        switchPage(formPage, instructionsPage);
    });

    // 修改管理员登录功能
    const adminBtn = document.querySelector('.admin-btn');
    const loginModal = document.querySelector('.login-modal');
    const loginSubmit = document.querySelector('.login-submit');
    const loginCancel = document.querySelector('.login-cancel');
    const adminUser = document.getElementById('adminUser');
    const adminPass = document.getElementById('adminPass');

    // 显示登录弹窗
    adminBtn.addEventListener('click', () => {
        loginModal.style.display = 'block';
    });

    // 隐藏登录弹窗
    loginCancel.addEventListener('click', () => {
        loginModal.style.display = 'none';
        // 清空输入
        adminUser.value = '';
        adminPass.value = '';
    });

    // 点击弹窗外部关闭
    loginModal.addEventListener('click', (e) => {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
            // 清空输入
            adminUser.value = '';
            adminPass.value = '';
        }
    });

    // 登录处理
    loginSubmit.addEventListener('click', () => {
        const username = adminUser.value.trim();
        const password = adminPass.value.trim();
        
        if (!username || !password) {
            alert('请输入账号和密码！');
            return;
        }
        
        if (username === 'admin' && password === '123456zy') {
            window.location.href = 'admin.html';
        } else {
            alert('账号或密码错误！');
            // 清空密码
            adminPass.value = '';
        }
    });

    // 添加回车键登录
    adminPass.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginSubmit.click();
        }
    });
}); 
